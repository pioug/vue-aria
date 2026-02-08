# @vue-aria/collections

Collection builder helpers for item/section data and deterministic key traversal.

## `buildCollection`

Builds structured collection nodes and returns key navigation helpers.

```ts
import { buildCollection } from "@vue-aria/collections";

const collection = buildCollection([
  { key: "overview", textValue: "Overview" },
  {
    type: "section",
    key: "admin",
    heading: "Admin",
    children: [
      { key: "users", textValue: "Users" },
      { key: "teams", textValue: "Teams" },
    ],
  },
]);

collection.getFirstKey(); // "overview"
collection.getKeyAfter("overview"); // "users"
```
