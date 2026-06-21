import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

// Generic superset response so pages that fetch on mount don't crash on undefined fields.
const generic = { listings: [], questions: [], generations: [], runs: [], alerts: [], items: [], files: {}, metrics: null, plan: "free", workspaceId: "ws", fileList: [] };

beforeEach(() => {
  global.fetch = vi.fn(async () => ({ ok: true, status: 200, json: async () => generic, blob: async () => new Blob() })) as unknown as typeof fetch;
});

describe("mcp-server-generator page (component)", () => {
  it("renders the main heading without crashing", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: /mcpforge/i })).toBeInTheDocument();
  });
});
