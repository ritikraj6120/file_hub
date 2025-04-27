import { useQuery } from "@tanstack/react-query";
import { fileService } from "../services/fileService";
import {
    DocumentDuplicateIcon,
    DocumentIcon,
    ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const StorageStats = () => {
    const {
        data: statsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["storage-metadata"],
        queryFn: fileService.getStorageStats,
    });

    const statsItems = [
        {
            name: "Total Files Uploaded",
            value: statsData?.total_files_referenced || 0,
            icon: DocumentIcon,
        },
        {
            name: "Unique Files",
            value: statsData?.unique_files_stored || 0,
            icon: DocumentDuplicateIcon,
        },
        {
            name: "Storage Saved",
            value: `${(statsData?.storage_saved_mb || 0).toFixed(3)} MB`,
            icon: ArrowTrendingUpIcon,
        },
        {
            name: "Duplicates Prevented",
            value: statsData?.duplicates_prevented || 0,
            icon: DocumentDuplicateIcon,
        },
    ];

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-20 bg-gray-200 rounded"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border-l-4 border-red-400 p-3">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                Failed to load storage statistics
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
                Storage Statistics
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsItems.map((item) => (
                    <div
                        key={item.name}
                        className="bg-white overflow-hidden shadow rounded-lg"
                    >
                        <div className="p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <item.icon
                                        className="h-6 w-6 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="ml-4 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {item.name}
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">
                                                {item.value}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StorageStats;
