export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    localDate.getFullYear() !== year ||
    localDate.getMonth() !== month - 1 ||
    localDate.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day, localDate };
}

export function isValidDateKey(dateKey: string) {
  return parseDateKey(dateKey) !== null;
}

export function compareDateKeys(left: string, right: string) {
  return left.localeCompare(right);
}

export function isFutureDateKey(dateKey: string, today = todayKey()) {
  return compareDateKeys(dateKey, today) > 0;
}

export function shiftDateKey(dateKey: string, days: number) {
  const parsed = parseDateKey(dateKey);

  if (!parsed) {
    return null;
  }

  const next = new Date(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return todayKey(next);
}

export function recentDateKeys(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (days - index - 1));
    return todayKey(date);
  });
}

export function shortDayLabel(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export function longDateLabel(dateKey: string) {
  const parsed = parseDateKey(dateKey);

  if (!parsed) {
    return dateKey;
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(parsed.localDate);
}

export function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
