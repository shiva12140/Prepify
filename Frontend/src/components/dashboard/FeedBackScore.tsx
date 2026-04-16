import React from "react";

interface Props {
  confidence: number;
  clarity: number;
  accuracy: number;
  speed: number;
  improvements: string[];
}

const ScoreCard = ({ label, value }: any) => (
  // Updated: Transparent/Darker background for individual score items
  <div className="p-4 text-center bg-[#434E78]/50 border border-white/5 rounded-xl">
    <p className="text-3xl font-bold text-[#F7E396]">{value}%</p>
    <p className="text-gray-300 text-sm mt-1">{label}</p>
  </div>
);

const FeedbackScore: React.FC<Props> = ({
  confidence,
  clarity,
  accuracy,
  speed,
  improvements,
}) => {
  return (
    // Updated: Removed bg-white, using transparent container
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <ScoreCard label="Confidence" value={confidence} />
        <ScoreCard label="Clarity" value={clarity} />
        <ScoreCard label="Accuracy" value={accuracy} />
        <ScoreCard label="Speed" value={speed} />
      </div>

      <div className="bg-[#434E78]/30 p-4 rounded-xl border border-white/5">
        <h4 className="text-sm font-semibold text-white mb-2 uppercase tracking-wide opacity-80">
          Suggested Improvements
        </h4>
        <ul className="space-y-1">
          {improvements.map((item, i) => (
            <li
              key={i}
              className="text-gray-200 text-sm flex items-start gap-2"
            >
              <span className="text-[#E97F4A] mt-1">•</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FeedbackScore;
