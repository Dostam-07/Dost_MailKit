import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const target = new Date(targetDate).getTime();
        const now = new Date().getTime();
        const difference = target - now;
        
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const seconds = Math.floor((difference / 1000) % 60);

          setTimeLeft({
            days: String(days).padStart(2, '0'),
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
          });
        } else {
          setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        }
      } catch (err) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3 md:gap-5">
      <div className="flex flex-col items-center">
        <div className="bg-ink border border-gold/20 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl shadow-inner-lg">
          <span className="text-xl md:text-2xl font-mono font-black text-gold tracking-tighter">{timeLeft.days}</span>
        </div>
        <span className="text-[7px] md:text-[9px] font-mono font-bold text-gold/60 mt-2 uppercase tracking-[0.2em]">Days</span>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="bg-ink border border-gold/20 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl shadow-inner-lg">
          <span className="text-xl md:text-2xl font-mono font-black text-gold tracking-tighter">{timeLeft.hours}</span>
        </div>
        <span className="text-[7px] md:text-[9px] font-mono font-bold text-gold/60 mt-2 uppercase tracking-[0.2em]">Hours</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-ink border border-gold/20 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl shadow-inner-lg">
          <span className="text-xl md:text-2xl font-mono font-black text-gold tracking-tighter">{timeLeft.minutes}</span>
        </div>
        <span className="text-[7px] md:text-[9px] font-mono font-bold text-gold/60 mt-2 uppercase tracking-[0.2em]">Mins</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-ink border border-gold/20 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl shadow-inner-lg">
          <span className="text-xl md:text-2xl font-mono font-black text-gold tracking-tighter">{timeLeft.seconds}</span>
        </div>
        <span className="text-[7px] md:text-[9px] font-mono font-bold text-gold/60 mt-2 uppercase tracking-[0.2em]">Secs</span>
      </div>
    </div>
  );
};
