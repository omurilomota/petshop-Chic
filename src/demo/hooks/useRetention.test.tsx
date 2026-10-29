import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { SupabaseDemoProvider } from "../SupabaseDemoContext";
import { AuthProvider } from "../AuthContext";
import { useRetention } from "./useRetention";
import { createElement } from "react";

describe("useRetention", () => {
  it("returns stats and churnRisk", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(AuthProvider, null, createElement(SupabaseDemoProvider, null, children));

    const { result } = renderHook(() => useRetention(), { wrapper });

    expect(result.current.stats).toBeDefined();
    expect(result.current.stats.totalClients).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.current.churnRisk)).toBe(true);
  });
});
