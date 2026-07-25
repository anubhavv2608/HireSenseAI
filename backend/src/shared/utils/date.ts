export const formatDateToISO = (date: Date = new Date()): string => {
  return date.toISOString();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

export const toUtcDayStart = (date: Date): Date => {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
};

/** Start of the ISO week (Monday) containing `date`, at UTC midnight. */
export const toUtcWeekStart = (date: Date): Date => {
  const dayStart = toUtcDayStart(date);
  const day = dayStart.getUTCDay(); // 0 (Sun) .. 6 (Sat)
  const diffToMonday = day === 0 ? 6 : day - 1;
  dayStart.setUTCDate(dayStart.getUTCDate() - diffToMonday);
  return dayStart;
};

/** First day of the calendar month containing `date`, at UTC midnight. */
export const toUtcMonthStart = (date: Date): Date => {
  const result = toUtcDayStart(date);
  result.setUTCDate(1);
  return result;
};
