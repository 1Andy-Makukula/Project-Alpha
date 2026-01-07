import React from 'react';

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
  height?: number;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, height = 256 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const minRevenue = Math.min(...data.map(d => d.revenue), 0);
  const range = maxRevenue - minRevenue || 1;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Revenue Trend</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-kithly-primary to-kithly-accent"></div>
            <span className="text-xs text-gray-600">Revenue</span>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>ZMK {maxRevenue.toFixed(0)}</span>
          <span>ZMK {(maxRevenue * 0.75).toFixed(0)}</span>
          <span>ZMK {(maxRevenue * 0.5).toFixed(0)}</span>
          <span>ZMK {(maxRevenue * 0.25).toFixed(0)}</span>
          <span>ZMK 0</span>
        </div>

        {/* Chart Area */}
        <div className="ml-16 h-full relative">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-full border-t border-gray-200"></div>
            ))}
          </div>

          {/* Bars */}
          <div className="relative h-full flex items-end justify-between gap-2 px-4">
            {data.map((point, index) => {
              const heightPercent = ((point.revenue - minRevenue) / range) * 85;

              return (
                <div
                  key={index}
                  className="relative flex flex-col items-center flex-1 h-full justify-end group"
                >
                  {/* Bar */}
                  <div
                    className="w-full max-w-[50px] bg-gradient-to-t from-kithly-primary via-kithly-accent to-orange-300 rounded-t-lg transition-all duration-500 hover:brightness-110 cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      <div className="font-semibold">{point.date}</div>
                      <div className="text-green-300">ZMK {point.revenue.toFixed(2)}</div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>

                  {/* Label */}
                  <span className="text-xs text-gray-600 mt-3 font-medium truncate max-w-full">
                    {point.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
