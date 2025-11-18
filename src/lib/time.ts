export function formatRelativeTime(date: Date, locale = "en") {
  const now = new Date();
  const diffInSeconds = (date.getTime() - now.getTime()) / 1000;

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffInSeconds) >= secondsInUnit || unit === "second") {
      const value = Math.round(diffInSeconds / secondsInUnit);
      const formatter = new Intl.RelativeTimeFormat(locale, {
        numeric: "auto",
      });

      return formatter.format(value, unit);
    }
  }

  return "";
}
