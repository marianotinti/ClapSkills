import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { Navbar } from "./Navbar";

afterEach(() => {
  cleanup();
});

describe("Coming Soon badge", () => {
  it("links to the import hub", () => {
    renderNavbar("/");
    const importHubLink = screen.getByRole("link", { name: /coming soon/i });

    expect(importHubLink).toHaveAttribute("href", "/imports");
  });
});

function renderNavbar(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>,
  );
}

describe("Navbar", () => {
  it("marks the Tools link as active on /tools", () => {
    renderNavbar("/tools");
    const toolsLink = screen.getByRole("link", { name: "Tools" });
    expect(toolsLink.className).toMatch(/border-primary/);
  });

  it("does not mark Tools as active on the home path", () => {
    renderNavbar("/");
    const toolsLink = screen.getByRole("link", { name: "Tools" });
    expect(toolsLink.className).not.toMatch(/border-primary/);
  });
});
