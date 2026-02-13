import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculatePosition } from "../src/calculatePosition";

const FLIPPED_DIRECTION: Record<string, string> = {
  left: "right",
};

function getTargetDimension(targetPosition: { left: number; top: number }, height = 100, width = 100) {
  return {
    ...targetPosition,
    bottom: targetPosition.top + height,
    right: targetPosition.left + width,
    width,
    height,
  };
}

const containerDimensions = {
  width: 600,
  height: 600,
  scroll: {
    top: 0,
    left: 0,
  },
  top: 0,
  left: 0,
};

document.body.style.margin = "0";

function createElementWithDimensions(
  elemName: string,
  dimensions: Record<string, any>,
  margins: Record<string, number> = {}
) {
  const elem = document.createElement(elemName);

  Object.assign(elem.style, {
    width: "width" in dimensions ? `${dimensions.width}px` : "0px",
    height: "height" in dimensions ? `${dimensions.height}px` : "0px",
    top: "top" in dimensions ? `${dimensions.top}px` : "0px",
    left: "left" in dimensions ? `${dimensions.left}px` : "0px",
    marginTop: "top" in margins ? `${margins.top}px` : "0px",
    marginBottom: "bottom" in margins ? `${margins.bottom}px` : "0px",
    marginRight: "right" in margins ? `${margins.right}px` : "0px",
    marginLeft: "left" in margins ? `${margins.left}px` : "0px",
  });

  (elem as any).scrollTop = "scroll" in dimensions ? dimensions.scroll.top : 0;
  (elem as any).scrollLeft = "scroll" in dimensions ? dimensions.scroll.left : 0;

  (elem as any).getBoundingClientRect = () => ({
    width: dimensions.width || 0,
    height: dimensions.height || 0,
    top: dimensions.top || 0,
    left: dimensions.left || 0,
    right: dimensions.right || 0,
    bottom: dimensions.bottom || 0,
  });

  vi.spyOn(elem, "offsetWidth", "get").mockImplementation(() => dimensions.width || 0);
  vi.spyOn(elem, "offsetHeight", "get").mockImplementation(() => dimensions.height || 0);
  vi.spyOn(elem, "scrollWidth", "get").mockImplementation(() => dimensions.width || 0);
  vi.spyOn(elem, "scrollHeight", "get").mockImplementation(() => dimensions.height || 0);

  return elem;
}

const boundaryDimensions = {
  width: 600,
  height: 600,
  scroll: {
    top: 0,
    left: 0,
  },
  top: 0,
  left: 0,
};

const margins = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

const overlaySize = {
  width: 200,
  height: 200,
};

function checkPositionCommon(
  title: string,
  expected: [number, number, number | undefined, number | undefined, number],
  placement: string,
  targetDimension: Record<string, number>,
  offset = 0,
  crossOffset = 0,
  flip = false,
  arrowSize = 8,
  arrowBoundaryOffset = 0
) {
  const [placementAxis] = placement.split(" ");

  const pos: { right?: number; top?: number; left?: number; bottom?: number } = {};
  if ((placementAxis === "left" && !flip) || (placementAxis === "right" && flip)) {
    pos.right = containerDimensions.width - (expected[0] + overlaySize.width);
    pos.top = expected[1];
  } else if ((placementAxis === "right" && !flip) || (placementAxis === "left" && flip)) {
    pos.left = expected[0];
    pos.top = expected[1];
  } else if (placementAxis === "top") {
    pos.left = expected[0];
    pos.bottom = containerDimensions.height - (expected[1] + overlaySize.height);
  } else if (placementAxis === "bottom") {
    pos.left = expected[0];
    pos.top = expected[1];
  }

  const calculatedPlacement = flip ? FLIPPED_DIRECTION[placementAxis] : placementAxis;

  const expectedPosition = {
    position: pos,
    arrowOffsetLeft: expected[2],
    arrowOffsetTop: expected[3],
    maxHeight: expected[4],
    placement: calculatedPlacement,
    triggerAnchorPoint: {
      x: expected[2] ?? (calculatedPlacement === "left" ? overlaySize.width : 0),
      y: expected[3] ?? (calculatedPlacement === "top" ? Math.min(overlaySize.height, expected[4]) : 0),
    },
  };

  it(title, () => {
    const container = createElementWithDimensions("div", containerDimensions);
    Object.assign(container.style, { position: "relative" });
    const target = createElementWithDimensions("div", targetDimension);
    const overlay = createElementWithDimensions("div", overlaySize, margins);

    const parentElement = document.createElement("div");
    parentElement.appendChild(container);
    parentElement.appendChild(target);
    container.appendChild(overlay);
    document.documentElement.appendChild(parentElement);

    const boundariesElem = createElementWithDimensions("div", boundaryDimensions);
    parentElement.appendChild(boundariesElem);

    const result = calculatePosition({
      placement: placement as any,
      overlayNode: overlay,
      targetNode: target,
      scrollNode: overlay,
      padding: 50,
      shouldFlip: flip,
      boundaryElement: boundariesElem,
      offset,
      crossOffset,
      arrowSize,
      arrowBoundaryOffset,
    });

    expect(result).toEqual(expectedPosition);
    document.documentElement.removeChild(parentElement);
  });
}

describe("calculatePosition", () => {
  beforeEach(() => {
    (window as any).visualViewport = {
      offsetTop: 0,
      height: 600,
      offsetLeft: 0,
      scale: 1,
      width: 0,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      onresize: () => {},
      onscroll: () => {},
      pageLeft: 0,
      pageTop: 0,
    } as VisualViewport;
  });

  checkPositionCommon(
    "computes left placement baseline",
    [50, 200, undefined, 100, 350],
    "left",
    getTargetDimension({ left: 250, top: 250 })
  );

  checkPositionCommon(
    "computes top placement baseline",
    [200, 50, 100, undefined, 200],
    "top",
    getTargetDimension({ left: 250, top: 250 })
  );

  checkPositionCommon(
    "flips from left to right when space is insufficient",
    [100, 50, undefined, 4, 500],
    "left",
    getTargetDimension({ left: 0, top: 0 }),
    0,
    0,
    true
  );

  checkPositionCommon(
    "enforces arrow boundary offset",
    [50, 322, undefined, 24, 228],
    "left",
    getTargetDimension({ left: 250, top: 250 }),
    0,
    1000,
    false,
    8,
    20
  );
});
