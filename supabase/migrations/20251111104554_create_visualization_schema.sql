/*
  # Data Visualization Tool Schema

  1. New Tables
    - `datasets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Dataset name
      - `description` (text) - Dataset description
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `data_points`
      - `id` (uuid, primary key)
      - `dataset_id` (uuid, references datasets)
      - `label` (text) - Data point label
      - `value` (numeric) - Data point value
      - `category` (text) - Optional category for grouping
      - `date` (date) - Optional date for time-series data
      - `created_at` (timestamptz)
    
    - `visualizations`
      - `id` (uuid, primary key)
      - `dataset_id` (uuid, references datasets)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Visualization name
      - `chart_type` (text) - Type of chart (bar, line, pie, etc.)
      - `config` (jsonb) - Chart configuration options
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own datasets and visualizations
    - Users can only access data_points from their own datasets
*/

CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES datasets ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  value numeric NOT NULL,
  category text DEFAULT '',
  date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visualizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES datasets ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  chart_type text NOT NULL,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own datasets"
  ON datasets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own datasets"
  ON datasets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own datasets"
  ON datasets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets"
  ON datasets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view data_points from own datasets"
  ON data_points FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM datasets
      WHERE datasets.id = data_points.dataset_id
      AND datasets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert data_points into own datasets"
  ON data_points FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM datasets
      WHERE datasets.id = data_points.dataset_id
      AND datasets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update data_points in own datasets"
  ON data_points FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM datasets
      WHERE datasets.id = data_points.dataset_id
      AND datasets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM datasets
      WHERE datasets.id = data_points.dataset_id
      AND datasets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete data_points from own datasets"
  ON data_points FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM datasets
      WHERE datasets.id = data_points.dataset_id
      AND datasets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own visualizations"
  ON visualizations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visualizations"
  ON visualizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visualizations"
  ON visualizations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own visualizations"
  ON visualizations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_data_points_dataset_id ON data_points(dataset_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_dataset_id ON visualizations(dataset_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_user_id ON visualizations(user_id);