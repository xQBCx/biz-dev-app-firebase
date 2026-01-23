-- Add columns for external links and AI analysis to initiative_documents
ALTER TABLE initiative_documents 
ADD COLUMN IF NOT EXISTS link_type text DEFAULT 'uploaded',
ADD COLUMN IF NOT EXISTS external_url text,
ADD COLUMN IF NOT EXISTS ai_analysis jsonb,
ADD COLUMN IF NOT EXISTS suggested_folder_path text,
ADD COLUMN IF NOT EXISTS extraction_status text DEFAULT 'pending';

-- Add comment for documentation
COMMENT ON COLUMN initiative_documents.link_type IS 'Type of document: uploaded, google_drive, external_url';
COMMENT ON COLUMN initiative_documents.external_url IS 'URL for external documents (Google Docs, Sheets, etc.)';
COMMENT ON COLUMN initiative_documents.ai_analysis IS 'AI-generated analysis and extraction results';
COMMENT ON COLUMN initiative_documents.suggested_folder_path IS 'AI-suggested folder path for organization';
COMMENT ON COLUMN initiative_documents.extraction_status IS 'Status of AI extraction: pending, processing, completed, failed';