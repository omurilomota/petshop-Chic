import { describe, it, expect } from "vitest";
import { formatBRL, formatPercent, formatNumber, toDateKey, parseDateKey, startOfDay, daysBetween } from "./format";

describe("format", () => {
  describe("formatBRL", () => {
    it("formats currency", () => {
      expect(formatBRL(60)).toContain("60");
    });

    it("formats zero", () => {
      expect(formatBRL(0)).toContain("0");
    });
  });

  describe("formatPercent", () => {
    it("rounds and adds %", () => {
      expect(formatPercent(33.3)).toBe("33%");
      expect(formatPercent(100)).toBe("100%");
    });
  });

  describe("formatNumber", () => {
    it("formats with locale", () => {
      expect(formatNumber(1000)).toBe("1.000");
    });
  });

  describe("toDateKey", () => {
    it("formats date as YYYY-MM-DD", () => {
      expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    });
  });

  describe("parseDateKey", () => {
    it("parses YYYY-MM-DD back to Date", () => {
      const d = parseDateKey("2026-01-05");
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(5);
    });
  });

  describe("startOfDay", () => {
    it("zeros time", () => {
      const d = startOfDay(new Date(2026, 0, 5, 14, 30, 45));
      expect(d.getHours()).toBe(0);
      expect(d.getMinutes()).toBe(0);
      expect(d.getSeconds()).toBe(0);
    });
  });

  describe("daysBetween", () => {
    it("calculates difference in days", () => {
      const a = new Date(2026, 0, 1);
      const b = new Date(2026, 0, 10);
      expect(daysBetween(a, b)).toBe(9);
    });
  });
});
