const InterviewPlayback = ({
  audioUrl,
  transcript,
  highlights,
}: any) => (
  <div className="bg-white p-5 shadow rounded-xl">
    <h3 className="text-xl font-bold mb-4 text-black"> Interview Playback</h3>

    {audioUrl && (
      <audio controls className="w-full mb-4">
        <source src={audioUrl} type="audio/mp3" />
      </audio>
    )}

    <h4 className="font-semibold mb-2 text-black"> Transcript</h4>
    <p className="text-gray-700 whitespace-pre-wrap">{transcript}</p>

    <h4 className="font-semibold mt-4 text-black"> AI Highlights</h4>
    <ul className="list-disc pl-5 text-blue-600">
      {highlights.map((h: string, i: number) => (
        <li key={i}>{h}</li>
      ))}
    </ul>
  </div>
);

export default InterviewPlayback;
