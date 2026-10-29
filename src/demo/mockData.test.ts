import { describe, it, expect } from "vitest";
import { getService, getPlan, getOpenMinutes, getAvailableSlots } from "./mockData";

describe("mockData", () => {
  describe("getService", () => {
    it("returns service by id", () => {
      const service = getService("banho");
      expect(service.name).toBe("Banho");
      expect(service.price).toBe(60);
    });

    it("throws for unknown service", () => {
      expect(() => getService("unknown" as any)).toThrow();
    });
  });

  describe("getPlan", () => {
    it("returns plan by id", () => {
      const plan = getPlan("banho-em-dia");
      expect(plan.name).toBe("Banho em Dia");
      expect(plan.price).toBe(109);
    });
  });

  describe("getOpenMinutes", () => {
    it("returns 0 for Sunday", () => {
      const sunday = new Date(2026, 0, 4); // Sunday
      expect(getOpenMinutes(sunday)).toBe(0);
    });

    it("returns 600 for weekday", () => {
      const monday = new Date(2026, 0, 5); // Monday
      expect(getOpenMinutes(monday)).toBe(600);
    });

    it("returns 360 for Saturday", () => {
      const saturday = new Date(2026, 0, 3); // Saturday
      expect(getOpenMinutes(saturday)).toBe(360);
    });
  });

  describe("getAvailableSlots", () => {
    it("returns empty for Sunday", () => {
      const sunday = "2026-01-04";
      const slots = getAvailableSlots(sunday, "banho", []);
      expect(slots).toEqual([]);
    });

    it("returns slots for weekday", () => {
      const monday = "2026-01-05";
      const slots = getAvailableSlots(monday, "banho", []);
      expect(slots.length).toBeGreaterThan(0);
    });
  });
});
