"use client";
import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  target: Date | string;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ target }) => {
  const targetDate = typeof target === "string" ? new Date(target) : target;
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, targetDate.getTime() - Date.now()),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, targetDate.getTime() - Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft <= 0) {
    return (
      <span className="text-green-600 font-bold text-xl">سفر شروع شد!</span>
    );
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  // Choose face/emoji and bg color based on remaining time
  return (
    <span
      className={`text-2xl font-bold text-primary-700 bg-purple-100 px-2 py-1 rounded-xl shadow flex items-center align-sub gap-3`}
    >
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
};

export default CountdownTimer;
