import { describe, expect, it } from "vitest";

import { normalizeToolResponse } from "./normalizeToolResponse";

describe("normalizeToolResponse", () => {
  it("keeps a valid app payload", () => {
    const normalized = normalizeToolResponse({
      name: "Lead Qualifier",
      description: "Scores inbound leads",
      files: {
        "/App.tsx": "export default function App() { return <div>Lead</div>; }",
      },
    });

    expect(normalized.name).toBe("Lead Qualifier");
    expect(normalized.files["/App.tsx"]).toContain("Lead");
  });

  it("throws when App.tsx is missing", () => {
    expect(() =>
      normalizeToolResponse({
        name: "Broken Tool",
        description: "Missing files",
        files: {},
      }),
    ).toThrow("App.tsx");
  });
});
