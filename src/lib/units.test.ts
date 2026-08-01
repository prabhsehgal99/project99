import { describe, expect, it } from "vitest";
import { litresToIntegerMillilitres, millilitresToLitres } from "@/lib/units";

describe("water unit conversion", () => {
  it("converts litres to integer millilitres with rounding", () => {
    expect(litresToIntegerMillilitres(2.5)).toBe(2500);
    expect(litresToIntegerMillilitres(2.5675)).toBe(2568);
    expect(litresToIntegerMillilitres(0)).toBe(0);
  });

  it("round-trips typical stored values", () => {
    for (const ml of [0, 250, 1500, 3000, 15000]) {
      expect(litresToIntegerMillilitres(millilitresToLitres(ml))).toBe(ml);
    }
  });
});
