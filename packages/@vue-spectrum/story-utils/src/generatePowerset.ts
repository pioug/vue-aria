import { mergeProps } from "@vue-aria/utils";

export type PowersetState = Record<string, unknown>;

// Generate a powerset from a given array of states/options.
export function generatePowerset(
  states: PowersetState[],
  exclude?: (merged: PowersetState) => boolean
): PowersetState[] {
  const combinations: PowersetState[] = [{}];

  for (let i = 0; i < states.length; i += 1) {
    const len = combinations.length;

    for (let j = 0; j < len; j += 1) {
      const [key, value] = Object.entries(states[i] ?? {})[0] ?? [];
      if (!key) {
        continue;
      }

      if (Array.isArray(value)) {
        value.forEach((stateValue) => {
          const merged = mergeProps(combinations[j] ?? {}, { [key]: stateValue });
          if (!(exclude && exclude(merged))) {
            combinations.push(merged);
          }
        });
      } else {
        const merged = mergeProps(combinations[j] ?? {}, states[i] ?? {});
        const serialized = JSON.stringify(merged);
        if (combinations.some((combination) => JSON.stringify(combination) === serialized)) {
          continue;
        }

        if (!(exclude && exclude(merged))) {
          combinations.push(merged);
        }
      }
    }
  }

  return combinations;
}
