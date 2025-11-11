import { DataPoint } from '../../lib/supabase';

type BarChartProps = {
  data: DataPoint[];
  colors?: string[];
};

export default function BarChart({ data, colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'] }: BarChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue;

  return (
    <div className="w-full h-full flex items-end gap-2 p-4">
      {data.map((point, index) => {
        const height = range > 0 ? ((point.value - minValue) / range) * 100 : 50;
        const color = colors[index % colors.length];

        return (
          <div key={point.id} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center" style={{ height: '300px' }}>
              <div
                className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 relative group"
                style={{
                  height: `${height}%`,
                  backgroundColor: color,
                  minHeight: '20px',
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {point.value}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-700 text-center font-medium truncate w-full px-1">
              {point.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
