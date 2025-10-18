import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  documentType: string;
  onUpload: (file: File) => void;
  isUploaded?: boolean;
  isVerified?: boolean;
  uploadedFileName?: string;
  error?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  onUpload,
  isUploaded = false,
  isVerified = false,
  uploadedFileName,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(uploadedFileName || '');
  const [localError, setLocalError] = useState(error || '');

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    // Reset error
    setLocalError('');
    
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Please upload a PDF or image file (JPEG, PNG)');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setLocalError('File size should be less than 5MB');
      return;
    }
    
    // Set file name and trigger upload
    setFileName(file.name);
    onUpload(file);
  };

  const getStatusColor = () => {
    if (localError || error) return 'text-error';
    if (isVerified) return 'text-success';
    if (isUploaded) return 'text-secondary';
    return 'text-gray-400';
  };

  return (
    <div className="mb-4">
      <div className="text-sm font-medium mb-1">{documentType}</div>
      
      {!isUploaded ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            id={`file-${documentType}`}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          <label
            htmlFor={`file-${documentType}`}
            className="flex flex-col items-center cursor-pointer"
          >
            <Upload size={24} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Drag & drop or click to upload
            </p>
            <p className="text-xs text-gray-500">
              Supports: PDF, JPEG, PNG (Max: 5MB)
            </p>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3">
              {error || localError ? (
                <AlertCircle size={20} className="text-error" />
              ) : isVerified ? (
                <Check size={20} className="text-success" />
              ) : (
                <Upload size={20} className="text-secondary" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium truncate max-w-[200px]">
                {fileName}
              </div>
              <div className={`text-xs ${getStatusColor()}`}>
                {error || localError
                  ? error || localError
                  : isVerified
                  ? 'Verified'
                  : 'Uploaded'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setFileName('');
              setLocalError('');
              onUpload(new File([], ''));
            }}
            className="p-1 text-gray-400 hover:text-error"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;