import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { Navbar } from "./Navbar";

function renderNavbar(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>,
  );
}

describe("Navbar", () => {
  afterEach(() => {
    cleanup();
  });

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
