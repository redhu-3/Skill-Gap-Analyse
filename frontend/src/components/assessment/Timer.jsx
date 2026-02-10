import { useEffect, useState } from "react";

const Timer = ({ initialTime, onTimeUp }) => {
  const [time, setTime] = useState(initialTime);

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

  const min = Math.floor(time / 60);
  const sec = time % 60;

  return (
    <div className="text-right font-bold text-lg">
      ⏱ {min}:{sec.toString().padStart(2, "0")}
    </div>
  );
};

export default Timer;
