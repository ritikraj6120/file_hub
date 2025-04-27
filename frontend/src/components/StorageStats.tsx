import { useQuery } from '@tanstack/react-query';
import { fileService } from '../services/fileService';
import { StorageMetadata } from '../types/file';

export const StorageStats = () => {
  const { data: stats, isLoading } = useQuery<StorageMetadata>({
    queryKey: ['storage-metadata'],
    queryFn: () => fileService.getStorageStats(),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse bg-white shadow rounded-lg p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Storage Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto">
        <StatCard
          title="Total Files Referenced"
          value={stats.total_files_referenced}
          description="Total number of file references"
        />
        <StatCard
          title="Unique Files"
          value={stats.unique_files_stored}
          description="Number of unique files stored"
        />
        <StatCard
          title="Duplicates Prevented"
          value={stats.duplicates_prevented}
          description="Number of duplicate uploads prevented"
        />
        <StatCard
          title="Storage Saved"
          value={`${stats.storage_saved_mb.toFixed(2)} MB`}
          description="Total storage space saved"
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
}

const StatCard = ({ title, value, description }: StatCardProps) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
);