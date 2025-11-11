import { DataPoint } from '../../lib/supabase';

type PieChartProps = {
  data: DataPoint[];
  colors?: string[];
};

export default function PieChart({
  data,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
}: PieChartProps) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 20;

  let currentAngle = -90;
  const slices = data.map((point, index) => {
    const percentage = (point.value / total) * 100;
    const angle = (point.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathD = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius * 0.7;
    const labelX = center + labelRadius * Math.cos((midAngle * Math.PI) / 180);
    const labelY = center + labelRadius * Math.sin((midAngle * Math.PI) / 180);

    currentAngle = endAngle;

    return {
      pathD,
      color: colors[index % colors.length],
      point,
      percentage,
      labelX,
      labelY,
    };
  });

  return (
    <div className="w-full h-full flex items-center justify-center gap-8 p-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-80 h-80">
        {slices.map((slice) => (
          <g key={slice.point.id}>
            <path
              d={slice.pathD}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity"
            >
              <title>{`${slice.point.label}: ${slice.point.value} (${slice.percentage.toFixed(1)}%)`}</title>
            </path>
            {slice.percentage > 5 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-semibold fill-white"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
              >
                {slice.percentage.toFixed(0)}%
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className="flex flex-col gap-2">
        {slices.map((slice) => (
          <div key={slice.point.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm text-gray-700">
              {slice.point.label} ({slice.point.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
