import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'cyan';
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  color = 'green',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  const getColor = () => {
    if (color === 'green') {
      if (percentage > 70) return 'bg-green-500';
      if (percentage > 30) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    return colors[color];
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-400">进度</span>
          <span className="text-xs text-gray-300 font-medium">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-700 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
