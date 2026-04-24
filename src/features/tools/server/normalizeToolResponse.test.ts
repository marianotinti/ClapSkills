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

  it("throws when App.tsx references an undefined JSX component", () => {
    expect(() =>
      normalizeToolResponse({
        name: "Broken Calculator",
        description: "Uses Button without defining it",
        files: {
          "/App.tsx": `export default function App() {
  return (
    <main>
      <Button>Add</Button>
    </main>
  );
}`,
        },
      }),
    ).toThrow("undefined JSX component");
  });

  it("allows locally defined JSX components", () => {
    const normalized = normalizeToolResponse({
      name: "Valid Calculator",
      description: "Defines its own button wrapper",
      files: {
        "/App.tsx": `import type { ReactNode } from "react";

function Button(props: { children: ReactNode }) {
  return <button>{props.children}</button>;
}

export default function App() {
  return (
    <main>
      <Button>Add</Button>
    </main>
  );
}`,
      },
    });

    expect(normalized.name).toBe("Valid Calculator");
  });

  it("throws when App.tsx does not render visible UI", () => {
    expect(() =>
      normalizeToolResponse({
        name: "Invisible Tool",
        description: "Only logic and fragments",
        files: {
          "/App.tsx": `export default function App() {
  const value = 1 + 2;
  return <></>;
}`,
        },
      }),
    ).toThrow("visible UI");
  });

  it("throws when App.tsx uses React namespace APIs without importing React", () => {
    expect(() =>
      normalizeToolResponse({
        name: "Broken Calculator",
        description: "Uses React.useState without importing React",
        files: {
          "/App.tsx": `export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <main>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </main>
  );
}`,
        },
      }),
    ).toThrow("TypeScript validation");
  });
});
