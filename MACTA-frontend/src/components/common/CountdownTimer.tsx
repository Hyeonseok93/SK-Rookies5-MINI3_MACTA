import { useEffect, useState } from 'react';
import { getServerNow } from '../../utils/format';

interface CountdownTimerProps {
  endTime: Date;
  className?: string;
  showSeconds?: boolean;
}

export function CountdownTimer({ endTime, className = '', showSeconds = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = getServerNow().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        setTimeLeft('ENDED');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (showSeconds) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [endTime, showSeconds]);

  return <span className={className}>{timeLeft}</span>;
}
