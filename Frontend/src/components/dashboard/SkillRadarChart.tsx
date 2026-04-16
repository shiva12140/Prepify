import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const SkillRadarChart = ({ data }: { data: any[] }) => (
  // Updated: Transparent background
  <div className="w-full h-full flex items-center justify-center">
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        {/* Grid lines: lighter for dark theme */}
        <PolarGrid stroke="#e5e7eb" strokeOpacity={0.2} />

        {/* Labels: White text */}
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fill: "#ffffff", fontSize: 12, fontWeight: 500 }}
        />

        {/* Radius Axis: Hidden or subtle */}
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />

        {/* The Radar Shape: Highlight Yellow with opacity */}
        <Radar
          name="Skill Level"
          dataKey="value"
          stroke="#F7E396"
          strokeWidth={2}
          fill="#F7E396"
          fillOpacity={0.4}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

export default SkillRadarChart;
