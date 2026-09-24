CREATE TABLE IF NOT EXISTS processing_jobs (
  id uuid PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('queued','processing','completed','failed')),
  original_filename text NOT NULL,
  input_mime_type text NOT NULL,
  input_size_bytes bigint NOT NULL CHECK (input_size_bytes > 0),
  input_storage_key text NOT NULL UNIQUE,
  output_storage_key text UNIQUE,
  output_width integer,
  output_height integer,
  output_size_bytes bigint,
  error_code text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS processing_jobs_status_idx ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS processing_jobs_expiry_idx ON processing_jobs(expires_at);
