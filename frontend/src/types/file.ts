export interface File {
  id: string;
  original_filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
  file: string;
} 

export interface StorageMetadata {
  total_files_referenced: number;
  unique_files_stored: number;
  duplicates_prevented: number;
  storage_saved_bytes: number;
  storage_saved_mb: number;
}