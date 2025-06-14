import React from "react";

interface TimerBlockProps {
  duration?: number; // in seconds
  label?: string;
  autoStart?: boolean;
  showProgress?: boolean;
}

export const TimerBlock: React.FC<TimerBlockProps> = ({
  duration = 60,
  label,
  autoStart = false,
  showProgress = false,
}) => {
  const [remaining, setRemaining] = React.useState(duration);
  const [running, setRunning] = React.useState(autoStart);

  React.useEffect(() => {
    if (!running) return;
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [running, remaining]);

  const percent = Math.max(0, Math.min(1, remaining / duration));

  return (
    <div className="p-4 flex flex-col items-center">
      {label && <div className="font-semibold mb-2">{label}</div>}
      <div className="text-2xl font-mono mb-2">
        {Math.floor(remaining / 60)
          .toString()
          .padStart(2, "0")}
        :
        {(remaining % 60).toString().padStart(2, "0")}
      </div>
      {showProgress && (
        <div className="w-full bg-gray-200 rounded h-2 mb-2">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${percent * 100}%` }}
          />
        </div>
      )}
      <div className="flex gap-2">
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded"
          onClick={() => setRunning(true)}
          disabled={running || remaining === 0}
        >
          Start
        </button>
        <button
          className="px-2 py-1 bg-gray-400 text-white rounded"
          onClick={() => setRunning(false)}
          disabled={!running}
        >
          Pause
        </button>
        <button
          className="px-2 py-1 bg-gray-200 text-gray-700 rounded"
          onClick={() => {
            setRunning(false);
            setRemaining(duration);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default TimerBlock;
