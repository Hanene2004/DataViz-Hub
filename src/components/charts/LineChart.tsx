import { DataPoint } from '../../lib/supabase';

type LineChartProps = {
  data: DataPoint[];
  color?: string;
};

export default function LineChart({ data, color = '#3b82f6' }: LineChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue;

  const width = 800;
  const height = 300;
  const padding = 40;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
    const y = range > 0
      ? height - padding - ((point.value - minValue) / range) * (height - padding * 2)
      : height / 2;
    return { x, y, point };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-4xl"
        style={{ maxHeight: '400px' }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + ratio * (height - padding * 2);
          const value = maxValue - ratio * range;
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={y + 5}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {value.toFixed(0)}
              </text>
            </g>
          );
        })}

        <path
          d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill="url(#lineGradient)"
        />

        <path d={pathD} fill="none" stroke={color} strokeWidth="3" />

        {points.map(({ x, y, point }) => (
          <g key={point.id}>
            <circle cx={x} cy={y} r="5" fill={color} className="hover:r-7 transition-all" />
            <title>{`${point.label}: ${point.value}`}</title>
          </g>
        ))}

        {points.map(({ x, point }, index) => (
          <text
            key={point.id}
            x={x}
            y={height - padding + 20}
            textAnchor="middle"
            className="text-xs fill-gray-700"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
