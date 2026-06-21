import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

const generic = { listings: [], questions: [], generations: [], runs: [], alerts: [], items: [], files: {}, metrics: null, plan: "free", workspaceId: "ws", fileList: [] };
beforeEach(() => {
  global.fetch = vi.fn(async () => ({ ok: true, status: 200, json: async () => generic, blob: async () => new Blob() })) as unknown as typeof fetch;
});

describe("mcp-server-generator page (component + a11y)", () => {
  it("renders the main heading without crashing", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: /mcpforge/i })).toBeInTheDocument();
  });

  it("text inputs and selects have accessible names (a11y)", () => {
    render(<Home />);
    for (const el of screen.queryAllByRole("textbox")) expect(el).toHaveAccessibleName();
    for (const el of screen.queryAllByRole("combobox")) expect(el).toHaveAccessibleName();
  });
});
