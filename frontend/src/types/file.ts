export interface FileType {
    id: string;
    file: string;
    original_filename: string;
    file_type: string;
    size: number;
    uploaded_at: string;
    hash: string;
    reference_count: number;
}

export interface StorageMetadata {
    total_files_referenced: number;
    unique_files_stored: number;
    duplicates_prevented: number;
    storage_saved_mb: number;
}

