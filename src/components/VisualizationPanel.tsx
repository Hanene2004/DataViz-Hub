import { useState, useEffect } from 'react';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { supabase, Dataset, DataPoint } from '../lib/supabase';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';
import PieChart from './charts/PieChart';

type VisualizationPanelProps = {
  dataset: Dataset;
  refreshTrigger: number;
};

export default function VisualizationPanel({ dataset, refreshTrigger }: VisualizationPanelProps) {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  useEffect(() => {
    loadDataPoints();
  }, [dataset.id, refreshTrigger]);

  const loadDataPoints = async () => {
    const { data } = await supabase
      .from('data_points')
      .select('*')
      .eq('dataset_id', dataset.id)
      .order('created_at', { ascending: true });

    if (data) {
      setDataPoints(data);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Visualization - {dataset.name}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Bar
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              chartType === 'line'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LineChartIcon className="w-4 h-4" />
            Line
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              chartType === 'pie'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            Pie
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg min-h-[400px] flex items-center justify-center">
        {dataPoints.length === 0 ? (
          <p className="text-gray-500">Add data points to see visualizations</p>
        ) : (
          <>
            {chartType === 'bar' && <BarChart data={dataPoints} />}
            {chartType === 'line' && <LineChart data={dataPoints} />}
            {chartType === 'pie' && <PieChart data={dataPoints} />}
          </>
        )}
      </div>
    </div>
  );
}
