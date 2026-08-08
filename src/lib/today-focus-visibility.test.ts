import { afterEach, describe, expect, it } from "vitest";
import { dismissTodayFocus, isTodayFocusDismissed, resetTodayFocusVisibilityForTests } from "@/lib/today-focus-visibility";

describe("Today focus visibility", () => {
  afterEach(resetTodayFocusVisibilityForTests);

  it("keeps a dismissal in runtime memory without affecting another day", () => {
    dismissTodayFocus("2026-08-08");

    expect(isTodayFocusDismissed("2026-08-08")).toBe(true);
    expect(isTodayFocusDismissed("2026-08-09")).toBe(false);
  });
});
