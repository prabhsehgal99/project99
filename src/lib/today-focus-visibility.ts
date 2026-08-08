const dismissedDates = new Set<string>();

/**
 * Today focus visibility intentionally lives only for the active browser runtime.
 * It is not written to the Daily Log or persisted in browser storage.
 */
export function isTodayFocusDismissed(date: string) {
  return dismissedDates.has(date);
}

export function dismissTodayFocus(date: string) {
  dismissedDates.add(date);
}

export function resetTodayFocusVisibilityForTests() {
  dismissedDates.clear();
}
