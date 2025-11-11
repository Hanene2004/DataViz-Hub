import { useState, useEffect } from 'react';
import { supabase, Dataset } from './lib/supabase';
import AuthForm from './components/AuthForm';
import DatasetManager from './components/DatasetManager';
import DataEditor from './components/DataEditor';
import VisualizationPanel from './components/VisualizationPanel';
import { LogOut, TrendingUp } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadDatasets();
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await loadDatasets();
    }
    setLoading(false);
  };

  const loadDatasets = async () => {
    const { data } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setDatasets(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSelectedDataset(null);
    setDatasets([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={checkUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DataViz Studio</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <DatasetManager
              datasets={datasets}
              selectedDataset={selectedDataset}
              onDatasetSelect={setSelectedDataset}
              onDatasetCreated={loadDatasets}
              onDatasetDeleted={() => {
                loadDatasets();
                setSelectedDataset(null);
              }}
            />
          </div>

          <div className="lg:col-span-2">
            {selectedDataset ? (
              <div className="space-y-6">
                <DataEditor
                  dataset={selectedDataset}
                  onDataChanged={() => setDataRefreshTrigger((prev) => prev + 1)}
                />
                <VisualizationPanel
                  dataset={selectedDataset}
                  refreshTrigger={dataRefreshTrigger}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Dataset Selected
                </h3>
                <p className="text-gray-500">
                  Select a dataset from the left or create a new one to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
