import React, { useCallback, useState } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (content: string) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileSelect(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="w-full"
        >
          <label className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
            isDragging 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}>
            <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
              <CloudArrowUpIcon className={`w-12 h-12 mb-3 ${
                isDragging ? 'text-primary-500' : 'text-gray-400'
              }`} />
              <p className="mb-2 text-sm text-gray-700">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                Firewall configuration files (.txt, .conf)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".txt,.conf"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}