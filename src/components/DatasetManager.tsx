import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { supabase, Dataset, DataPoint } from '../lib/supabase';

type DatasetManagerProps = {
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  onDatasetSelect: (dataset: Dataset) => void;
  onDatasetCreated: () => void;
  onDatasetDeleted: () => void;
};

export default function DatasetManager({
  datasets,
  selectedDataset,
  onDatasetSelect,
  onDatasetCreated,
  onDatasetDeleted,
}: DatasetManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [newDatasetDescription, setNewDatasetDescription] = useState('');

  const createDataset = async () => {
    if (!newDatasetName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('datasets')
      .insert([
        {
          user_id: user.id,
          name: newDatasetName,
          description: newDatasetDescription,
        },
      ]);

    if (!error) {
      setNewDatasetName('');
      setNewDatasetDescription('');
      setIsCreating(false);
      onDatasetCreated();
    }
  };

  const deleteDataset = async (id: string) => {
    const { error } = await supabase.from('datasets').delete().eq('id', id);

    if (!error) {
      onDatasetDeleted();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Datasets</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Dataset
        </button>
      </div>

      {isCreating && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Dataset name"
            value={newDatasetName}
            onChange={(e) => setNewDatasetName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={newDatasetDescription}
            onChange={(e) => setNewDatasetDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={createDataset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewDatasetName('');
                setNewDatasetDescription('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {datasets.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No datasets yet. Create one to get started!
          </p>
        ) : (
          datasets.map((dataset) => (
            <div
              key={dataset.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedDataset?.id === dataset.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onDatasetSelect(dataset)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{dataset.name}</h3>
                  {dataset.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {dataset.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Created {new Date(dataset.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this dataset and all its data?')) {
                      deleteDataset(dataset.id);
                    }
                  }}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
