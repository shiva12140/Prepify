interface StreakData {
  date: string;
  count: number;
  weekday: number;
  week: number;
  month: string;
}

// Updated Colors:
// Empty: Dark Blue (#434E78)
// Low -> High: Light Blue -> Yellow -> Orange
const getColor = (count: number) => {
  if (count === 0) return "#434E78"; // Empty state (matches page bg)
  if (count === 1) return "#607B8F"; // Low activity
  if (count === 2) return "#F7E396"; // Medium activity
  if (count === 3) return "#E97F4A"; // High activity
  return "#E97F4A";
};

const YearlyStreak = ({ data }: { data: StreakData[] }) => {
  const totalSubmissions = data.reduce((a, b) => a + b.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  let streak = 0;
  let maxStreak = 0;
  data.forEach((d) => {
    if (d.count > 0) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  });

  const weeks = data.reduce((acc: any, day) => {
    acc[day.week] = acc[day.week] || [];
    acc[day.week].push(day);
    return acc;
  }, {});

  return (
    // Transparent container, relying on parent card
    <div className="w-full text-white">
      <div className="flex justify-between mb-6">
        <h3 className="text-sm font-medium text-gray-300">
          {totalSubmissions} activities in the last year
        </h3>

        <div className="flex gap-6 text-sm text-gray-300">
          <p>
            Total Active Days:{" "}
            <span className="text-[#F7E396] font-bold">{activeDays}</span>
          </p>
          <p>
            Longest Streak:{" "}
            <span className="text-[#F7E396] font-bold">{maxStreak}</span>
          </p>
        </div>
      </div>

      <div className="flex overflow-x-auto custom-scrollbar pb-2">
        {Object.keys(weeks).map((weekIndex) => (
          <div key={weekIndex} className="flex flex-col mr-1 gap-1">
            {weeks[weekIndex].map((day: StreakData) => (
              <div
                key={day.date}
                title={`${day.date} — ${day.count} tasks`}
                className="w-3 h-3 rounded-[2px] transition-all hover:ring-1 hover:ring-white"
                style={{ backgroundColor: getColor(day.count) }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex mt-2 text-gray-400 text-xs">
        {Object.keys(weeks).map((weekIndex) => {
          const firstDay = weeks[weekIndex][0];
          const showLabel = firstDay.date.endsWith("01");
          return (
            <div key={weekIndex} className="w-3 mr-1">
              {showLabel && <span>{firstDay.month}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearlyStreak;
