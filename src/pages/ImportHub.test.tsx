import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { ImportHub } from "./ImportHub";

describe("ImportHub", () => {
  it("renders the import options", () => {
    render(
      <MemoryRouter>
        <ImportHub />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "IMPORT HACKATHON 2026 PROJECTS" }),
    ).toBeInTheDocument();
    expect(screen.getByText("IMPORT LIVE ARTIFACTS")).toBeInTheDocument();
    expect(screen.getByText("IMPORT AGENTS")).toBeInTheDocument();
    expect(screen.getByText("IMPORT TOOLS")).toBeInTheDocument();
    expect(screen.getByText("IMPORT WORKFLOWS")).toBeInTheDocument();
  });
});