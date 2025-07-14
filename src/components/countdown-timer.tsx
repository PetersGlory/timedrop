
'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { intervalToDuration, isPast } from 'date-fns';

interface CountdownTimerProps {
  endDate: string;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const targetDate = new Date(endDate);

    const updateTimer = () => {
      if (isPast(targetDate)) {
        setTimeLeft('Market Closed');
        return;
      }

      const duration = intervalToDuration({ start: new Date(), end: targetDate });
      
      const parts = [];
      if (duration.years && duration.years > 0) parts.push(`${duration.years}y`);
      if (duration.months && duration.months > 0) parts.push(`${duration.months}m`);
      if (duration.days && duration.days > 0) parts.push(`${duration.days}d`);
      if (duration.hours && duration.hours > 0) parts.push(`${duration.hours}h`);
      if (duration.minutes && duration.minutes > 0) parts.push(`${duration.minutes}m`);
      if (parts.length < 2 && duration.seconds && duration.seconds > 0) parts.push(`${duration.seconds}s`);

      if (parts.length > 0) {
        setTimeLeft(`Closes in ${parts.slice(0, 3).join(' ')}`);
      } else {
        setTimeLeft('Closing soon');
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [endDate]);

  if (!isClient) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>{timeLeft}</span>
    </div>
  );
}
