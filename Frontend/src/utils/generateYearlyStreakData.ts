import dayjs from "dayjs";

export const generateYearlyStreakData = () => {
  const today = dayjs();
  const days = [];

  for (let i = 0; i < 365; i++) {
    const date = today.subtract(i, "day");

    days.push({
      date: date.format("YYYY-MM-DD"),
      count: Math.floor(Math.random() * 4), // 0–3 activity
      weekday: date.day(),
      week: Math.floor(i / 7),
      month: date.format("MMM"),
    });
  }

  return days.reverse();
};
