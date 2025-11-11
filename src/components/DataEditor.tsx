import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { supabase, Dataset, DataPoint } from '../lib/supabase';

type DataEditorProps = {
  dataset: Dataset;
  onDataChanged: () => void;
};

export default function DataEditor({ dataset, onDataChanged }: DataEditorProps) {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPoint, setNewPoint] = useState({
    label: '',
    value: '',
    category: '',
  });

  useEffect(() => {
    loadDataPoints();
  }, [dataset.id]);

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

  const addDataPoint = async () => {
    if (!newPoint.label.trim() || !newPoint.value.trim()) return;

    const { error } = await supabase.from('data_points').insert([
      {
        dataset_id: dataset.id,
        label: newPoint.label,
        value: parseFloat(newPoint.value),
        category: newPoint.category,
      },
    ]);

    if (!error) {
      setNewPoint({ label: '', value: '', category: '' });
      setIsAdding(false);
      loadDataPoints();
      onDataChanged();
    }
  };

  const deleteDataPoint = async (id: string) => {
    const { error } = await supabase.from('data_points').delete().eq('id', id);

    if (!error) {
      loadDataPoints();
      onDataChanged();
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    const points: Array<{ dataset_id: string; label: string; value: number; category: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const [label, value, category = ''] = lines[i].split(',').map(s => s.trim());
      if (label && value && !isNaN(parseFloat(value))) {
        points.push({
          dataset_id: dataset.id,
          label,
          value: parseFloat(value),
          category,
        });
      }
    }

    if (points.length > 0) {
      const { error } = await supabase.from('data_points').insert(points);
      if (!error) {
        loadDataPoints();
        onDataChanged();
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Data Points - {dataset.name}
        </h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Point
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              placeholder="Label"
              value={newPoint.label}
              onChange={(e) => setNewPoint({ ...newPoint, label: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Value"
              value={newPoint.value}
              onChange={(e) => setNewPoint({ ...newPoint, value: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Category (optional)"
              value={newPoint.category}
              onChange={(e) => setNewPoint({ ...newPoint, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addDataPoint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewPoint({ label: '', value: '', category: '' });
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {dataPoints.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No data points yet. Add some data to create visualizations!
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Label</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataPoints.map((point) => (
                <tr key={point.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{point.label}</td>
                  <td className="py-3 px-4 text-gray-900">{point.value}</td>
                  <td className="py-3 px-4 text-gray-600">{point.category || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm('Delete this data point?')) {
                          deleteDataPoint(point.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
