import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  onClick,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    gray: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  };

  const iconBgClass = colorClasses[color] || colorClasses.blue;

  return (
    <div
      onClick={onClick}
      className={`card p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>

          {trend && (
            <div className="mt-2 flex items-center text-sm">
              {trend === 'up' ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 dark:text-green-400">
                    +{trendValue}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-red-600 dark:text-red-400">
                    -{trendValue}%
                  </span>
                </>
              )}
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                vs last month
              </span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl ${iconBgClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
