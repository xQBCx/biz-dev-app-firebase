-- Tables for Deep Code Integration System

-- Store fetched file contents from external repositories
CREATE TABLE project_code_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_import_id uuid REFERENCES platform_project_imports(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_content text,
  file_size integer,
  file_hash text,
  language text,
  last_fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_import_id, file_path)
);

-- Track integration/merge operations
CREATE TABLE code_integration_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  source_project_id uuid REFERENCES platform_project_imports(id) ON DELETE SET NULL,
  target_project text DEFAULT 'biz-dev-app',
  operation_type text CHECK (operation_type IN ('fetch', 'analyze', 'compare', 'merge', 'import')),
  files_involved text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  progress integer DEFAULT 0,
  result_data jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE project_code_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_integration_operations ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_code_files
CREATE POLICY "Users can view their own code files"
  ON project_code_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own code files"
  ON project_code_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own code files"
  ON project_code_files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own code files"
  ON project_code_files FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for code_integration_operations
CREATE POLICY "Users can view their own operations"
  ON code_integration_operations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own operations"
  ON code_integration_operations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own operations"
  ON code_integration_operations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_project_code_files_project ON project_code_files(project_import_id);
CREATE INDEX idx_project_code_files_user ON project_code_files(user_id);
CREATE INDEX idx_project_code_files_path ON project_code_files(file_path);
CREATE INDEX idx_project_code_files_language ON project_code_files(language);
CREATE INDEX idx_code_integration_operations_user ON code_integration_operations(user_id);
CREATE INDEX idx_code_integration_operations_status ON code_integration_operations(status);