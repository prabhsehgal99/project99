import { describe, expect, it } from "vitest";
import {
  compareDateKeys,
  isFutureDateKey,
  isValidDateKey,
  parseDateKey,
  recentDateKeys,
  shiftDateKey,
  todayKey
} from "@/lib/dates";

describe("todayKey", () => {
  it("formats a date as YYYY-MM-DD in local time", () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(todayKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("parseDateKey", () => {
  it("accepts real calendar dates", () => {
    expect(parseDateKey("2026-07-31")).toMatchObject({ year: 2026, month: 7, day: 31 });
    expect(parseDateKey("2024-02-29")).not.toBeNull();
  });

  it("rejects impossible calendar dates that match the format", () => {
    expect(parseDateKey("2026-02-31")).toBeNull();
    expect(parseDateKey("2026-13-01")).toBeNull();
    expect(parseDateKey("2025-02-29")).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(parseDateKey("2026-7-31")).toBeNull();
    expect(parseDateKey("20260731")).toBeNull();
    expect(parseDateKey("")).toBeNull();
  });
});

describe("isValidDateKey", () => {
  it("matches parseDateKey behavior", () => {
    expect(isValidDateKey("2026-07-31")).toBe(true);
    expect(isValidDateKey("2026-02-31")).toBe(false);
  });
});

describe("compareDateKeys and isFutureDateKey", () => {
  it("orders date keys lexicographically", () => {
    expect(compareDateKeys("2026-07-30", "2026-07-31")).toBeLessThan(0);
    expect(compareDateKeys("2026-07-31", "2026-07-31")).toBe(0);
  });

  it("detects future dates relative to a given today", () => {
    expect(isFutureDateKey("2026-08-01", "2026-07-31")).toBe(true);
    expect(isFutureDateKey("2026-07-31", "2026-07-31")).toBe(false);
    expect(isFutureDateKey("2026-07-30", "2026-07-31")).toBe(false);
  });
});

describe("shiftDateKey", () => {
  it("shifts across month and year boundaries", () => {
    expect(shiftDateKey("2026-07-31", 1)).toBe("2026-08-01");
    expect(shiftDateKey("2026-01-01", -1)).toBe("2025-12-31");
    expect(shiftDateKey("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("returns null for invalid input", () => {
    expect(shiftDateKey("not-a-date", 1)).toBeNull();
  });
});

describe("recentDateKeys", () => {
  it("returns the requested number of ascending keys ending today", () => {
    const keys = recentDateKeys(7);
    expect(keys).toHaveLength(7);
    expect(keys[6]).toBe(todayKey());
    expect([...keys].sort()).toEqual(keys);
  });
});
