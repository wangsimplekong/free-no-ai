import React from 'react';

interface CircularProgressProps {
  value: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  value,
  color = 'blue'
}) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - value) / 100) * circumference;

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className={`${colorClasses[color]} transition-all duration-1000 ease-out`}
        />
      </svg>
      <span className={`absolute text-xl font-semibold ${colorClasses[color]}`}>
        {value}%
      </span>
    </div>
  );
};