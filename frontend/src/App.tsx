import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import StorageStats from "./components/StorageStats";

function App() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Abnormal Security - File Hub
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            File management system
                        </p>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8">
                    <div className="px-4 py-3 sm:px-0">
                        <div className="space-y-4">
                            <StorageStats />
                            <div className="bg-white shadow sm:rounded-lg">
                                <FileUpload
                                    onUploadSuccess={handleUploadSuccess}
                                />
                            </div>
                            <div className="bg-white shadow sm:rounded-lg">
                                <FileList key={refreshKey} />
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="bg-white shadow mt-8">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-sm text-gray-500">
                            © 2024 File Hub. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: "#4aed88",
                            color: "#fff",
                        },
                    },
                    error: {
                        duration: 3000,
                        style: {
                            background: "#ff4b4b",
                            color: "#fff",
                        },
                    },
                }}
            />
        </>
    );
}

export default App;
