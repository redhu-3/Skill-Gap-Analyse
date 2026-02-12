import { useEffect, useState } from "react";

const Timer = ({ initialTime, onTimeUp, resetKey }) => {
  const [time, setTime] = useState(initialTime);

  // Reset timer whenever initialTime or resetKey changes
  useEffect(() => {
    setTime(initialTime);
  }, [initialTime, resetKey]);

  useEffect(() => {
    if (time <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTime((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time, onTimeUp]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  const display =
    hours > 0
      ? `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      : `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;

  return <div className="text-right font-bold text-lg">⏱ {display}</div>;
};

export default Timer;
