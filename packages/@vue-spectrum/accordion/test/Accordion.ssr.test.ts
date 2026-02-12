import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTitle,
} from "../src";

describe("Accordion SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "AccordionSSRApp",
      setup() {
        return () =>
          h(Accordion, null, {
            default: () => [
              h(
                Disclosure,
                {
                  id: "files",
                },
                {
                  default: () => [
                    h(DisclosureTitle, () => "Files"),
                    h(DisclosurePanel, () => "Files content"),
                  ],
                }
              ),
              h(
                Disclosure,
                {
                  id: "people",
                },
                {
                  default: () => [
                    h(DisclosureTitle, () => "People"),
                    h(DisclosurePanel, () => "People content"),
                  ],
                }
              ),
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Accordion");
    expect(html).toContain("Files");
    expect(html).toContain("People");
  });
});
