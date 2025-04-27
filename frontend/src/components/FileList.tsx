import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fileService } from "../services/fileService";
import { FileType } from "../types/file";
import { DocumentIcon, TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { toast } from 'react-hot-toast';

const FileList = () => {
    // State variables in camelCase
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [fileType, setFileType] = useState("");
    const [minSize, setMinSize] = useState<string>("");
    const [maxSize, setMaxSize] = useState<string>("");
    const [uploadDate, setUploadDate] = useState("");
    const [sizeError, setSizeError] = useState<string>("");

    const queryClient = useQueryClient();

    const validateSizeInputs = () => {
        const minBytes = minSize ? parseInt(minSize) * 1024 : undefined;
        const maxBytes = maxSize ? parseInt(maxSize) * 1024 : undefined;

        if (minSize && parseInt(minSize) < 0) {
            setSizeError("Minimum size cannot be negative");
            return false;
        }

        if (maxSize && parseInt(maxSize) < 0) {
            setSizeError("Maximum size cannot be negative");
            return false;
        }

        if (minBytes && maxBytes && minBytes > maxBytes) {
            setSizeError("Minimum size cannot be greater than maximum size");
            return false;
        }

        setSizeError("");
        return true;
    };

    // useQuery hook with proper camelCase naming
    const {
        data: filesData,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["files", currentPage],
        queryFn: () => {
            if (minSize || maxSize) {
                if (!validateSizeInputs()) {
                    return Promise.reject(new Error(sizeError));
                }
            }
            
            return fileService.getFiles({
                search: searchQuery,
                fileType,
                minSize: minSize ? parseInt(minSize) * 1024 : undefined, // Convert KB to bytes
                maxSize: maxSize ? parseInt(maxSize) * 1024 : undefined, // Convert KB to bytes
                uploadDate,
                page: currentPage,
            });
        },
        enabled: !sizeError, // Disable the query if there are size validation errors
    });

    // Mutations with proper camelCase naming
    const deleteMutation = useMutation({
        mutationFn: fileService.deleteFile,
        onSuccess: () => {
            toast.success('File deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['storage-metadata'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to delete file');
        },
    });

    const downloadMutation = useMutation({
        mutationFn: ({
            fileUrl,
            filename,
        }: {
            fileUrl: string;
            filename: string;
        }) => fileService.downloadFile(fileUrl, filename),
    });

    // Handler functions in camelCase
    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const handleDownload = async (fileUrl: string, filename: string) => {
        try {
            await downloadMutation.mutateAsync({ fileUrl, filename });
        } catch (err) {
            console.error("Download error:", err);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (filesData?.pages || 1)) {
            setCurrentPage(newPage);
        }
    };

    const handleSizeChange = (value: string, isMin: boolean) => {
        if (isMin) {
            setMinSize(value);
        } else {
            setMaxSize(value);
        }
        setSizeError(""); // Clear error when input changes
    };

    const handleApplyFilters = () => {
        if (validateSizeInputs()) {
            refetch();
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                {error instanceof Error ? error.message : 'Failed to load files. Please try again.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Search Bar */}
            <div className="flex flex-col space-y-4">
                <div className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border rounded px-2 py-1"
                    />
                    <select
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="">All Types</option>
                        <option value="image/png">PNG</option>
                        <option value="image/jpeg">JPEG</option>
                        <option value="application/pdf">PDF</option>
                    </select>
                    <div className="flex space-x-4">
                        <input
                            type="number"
                            placeholder="Min Size (KB)"
                            value={minSize}
                            onChange={(e) => handleSizeChange(e.target.value, true)}
                            className={`border rounded px-2 py-1 ${sizeError && 'border-red-500'}`}
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Max Size (KB)"
                            value={maxSize}
                            onChange={(e) => handleSizeChange(e.target.value, false)}
                            className={`border rounded px-2 py-1 ${sizeError && 'border-red-500'}`}
                            min="0"
                        />
                    </div>
                    <input
                        type="date"
                        placeholder="Upload Date"
                        value={uploadDate}
                        onChange={(e) => setUploadDate(e.target.value)}
                        className="border rounded px-2 py-1"
                    />
                    <button
                        onClick={handleApplyFilters}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
                {sizeError && (
                    <div className="text-red-500 text-sm">
                        {sizeError}
                    </div>
                )}
            </div>
            
            {/* Uploaded Files Section */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Uploaded Files
            </h2>
            {!filesData || filesData.results.length === 0 ? (
                <div className="text-center py-12">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No files
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by uploading a file
                    </p>
                </div>
            ) : (
                <div className="mt-6 flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                        {filesData.results.map((file: FileType) => (
                            <li key={file.id} className="py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <DocumentIcon className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.original_filename}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {file.file_type} •{" "}
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Uploaded{" "}
                                            {new Date(
                                                file.uploaded_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                handleDownload(
                                                    file.file,
                                                    file.original_filename
                                                )
                                            }
                                            disabled={
                                                downloadMutation.isPending
                                            }
                                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                            Download
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(file.id)
                                            }
                                            disabled={deleteMutation.isPending}
                                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            <TrashIcon className="h-4 w-4 mr-1" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {/* Pagination Controls */}
            {filesData && filesData.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-center border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    Page {currentPage} of {filesData.pages}
                                </span>
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === filesData.pages}
                                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() =>
                                        handlePageChange(filesData.pages)
                                    }
                                    disabled={currentPage === filesData.pages}
                                    className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Last
                                </button>
                            </nav>
                        </div>
                    </div>
                    {/* Mobile pagination */}
                    <div className="flex sm:hidden justify-center w-full">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 mx-2">
                            {currentPage} / {filesData.pages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === filesData.pages}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileList;
