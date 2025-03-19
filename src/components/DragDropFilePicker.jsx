"use client";
import React, { useState, useRef } from 'react';
import { FiX } from 'react-icons/fi';

const DragDropFilePicker = ({
  id,
  accept,
  icon: Icon,
  label,
  description,
  filePreview,
  previewType = "text",
  previewComponent,
  onChange,
  onRemove,
  error
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange({ target: { files: e.dataTransfer.files } });
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="w-full">
      {!filePreview ? (
        <div 
          className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 border-dashed'} rounded-lg transition-colors duration-200`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            id={id}
            name={id}
            className="sr-only"
            accept={accept}
            onChange={onChange}
          />
          
          <div className="space-y-1 text-center">
            <Icon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <button 
                type="button"
                className="relative bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                onClick={handleButtonClick}
              >
                <span>Upload {label}</span>
              </button>
              <p className="pl-1">atau drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          
          {dragActive && (
            <div 
              className="absolute inset-0 rounded-lg bg-blue-100 bg-opacity-30 flex items-center justify-center"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <p className="text-blue-700 font-medium">Lepaskan file di sini...</p>
            </div>
          )}
        </div>
      ) : (
        previewComponent || (
          <div className="mt-1 flex items-center p-4 border border-gray-300 rounded-md bg-gray-50">
            <Icon className="h-8 w-8 text-blue-500 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {filePreview}
              </p>
              <p className="text-xs text-gray-500">
                {label}
              </p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="ml-4 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:bg-gray-100"
            >
              <span className="sr-only">Remove file</span>
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default DragDropFilePicker;
