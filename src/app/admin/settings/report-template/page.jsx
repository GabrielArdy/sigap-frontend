'use client'
import { useState } from 'react';
import { FiUpload, FiFile, FiUser, FiFileText, FiX, FiCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';
// Fix the import path - use relative path instead of alias
import DragDropFilePicker from '../../../../components/DragDropFilePicker';

export default function TemplateUploadPage() {
  // Form state
  const [excelFile, setExcelFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [principalName, setPrincipalName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Preview state
  const [excelPreview, setExcelPreview] = useState('');
  const [signaturePreview, setSignaturePreview] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({
    excelFile: '',
    principalName: '',
    signatureFile: ''
  });

  // Handle Excel file change
  const handleExcelChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.name.endsWith('.xlsx')) {
      setErrors({...errors, excelFile: 'Hanya file Excel (.xlsx) yang diperbolehkan'});
      return;
    }
    
    // Clear previous error if any
    setErrors({...errors, excelFile: ''});
    
    // Set file to state
    setExcelFile(file);
    
    // Create preview text
    setExcelPreview(file.name);
  };

  // Handle signature file change
  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrors({...errors, signatureFile: 'Hanya file JPG atau PNG yang diperbolehkan'});
      return;
    }
    
    // Clear previous error if any
    setErrors({...errors, signatureFile: ''});
    
    // Set file to state
    setSignatureFile(file);
    
    // Create preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setSignaturePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle principal name change
  const handlePrincipalNameChange = (e) => {
    const value = e.target.value;
    setPrincipalName(value);
    
    // Validate name
    if (!value.trim()) {
      setErrors({...errors, principalName: 'Nama Kepala Sekolah harus diisi'});
    } else {
      setErrors({...errors, principalName: ''});
    }
  };

  // Remove files
  const removeExcelFile = () => {
    setExcelFile(null);
    setExcelPreview('');
  };

  const removeSignatureFile = () => {
    setSignatureFile(null);
    setSignaturePreview('');
  };

  // Form validation before submit
  const validateForm = () => {
    const newErrors = {
      excelFile: !excelFile ? 'Template Excel harus diupload' : '',
      principalName: !principalName.trim() ? 'Nama Kepala Sekolah harus diisi' : '',
      signatureFile: !signatureFile ? 'Tanda tangan harus diupload' : ''
    };
    
    setErrors(newErrors);
    
    // Check if form is valid (no errors)
    return !Object.values(newErrors).some(error => error);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'Silakan lengkapi semua field yang diperlukan',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create form data for submission
      const formData = new FormData();
      formData.append('excelTemplate', excelFile);
      formData.append('principalName', principalName);
      formData.append('signatureFile', signatureFile);
      
      // Here you would normally send the formData to your API
      // const response = await fetch('/api/upload-template', {
      //   method: 'POST',
      //   body: formData
      // });
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Template berhasil diupload',
      });
      
      // Reset form after successful submission
      setExcelFile(null);
      setSignatureFile(null);
      setPrincipalName('');
      setExcelPreview('');
      setSignaturePreview('');
      
    } catch (error) {
      console.error('Error uploading template:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat mengupload template',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Template Laporan</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload template Excel untuk format laporan kehadiran
        </p>
      </div>
      
      {/* Upload form */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Excel file upload */}
          <div>
            <label htmlFor="excelTemplate" className="block text-sm font-medium text-gray-700 mb-1">
              File Template Excel <span className="text-red-500">*</span>
            </label>
            
            <DragDropFilePicker
              id="excelTemplate"
              accept=".xlsx"
              icon={FiFile}
              label="template"
              description="Hanya file XLSX yang diperbolehkan"
              filePreview={excelPreview}
              onChange={handleExcelChange}
              onRemove={removeExcelFile}
              error={errors.excelFile}
            />
          </div>
          
          {/* Principal name */}
          <div>
            <label htmlFor="principalName" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kepala Sekolah <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="principalName"
                name="principalName"
                value={principalName}
                onChange={handlePrincipalNameChange}
                className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Masukkan nama lengkap kepala sekolah"
              />
            </div>
            {errors.principalName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.principalName}
              </p>
            )}
          </div>
          
          {/* Signature file upload */}
          <div>
            <label htmlFor="signatureFile" className="block text-sm font-medium text-gray-700 mb-1">
              File Tanda Tangan <span className="text-red-500">*</span>
            </label>
            
            <DragDropFilePicker
              id="signatureFile"
              accept="image/jpeg,image/png"
              icon={FiUpload}
              label="tanda tangan"
              description="File JPG atau PNG, maks 2MB"
              filePreview={signaturePreview ? true : ""}
              onChange={handleSignatureChange}
              onRemove={removeSignatureFile}
              error={errors.signatureFile}
              previewComponent={signaturePreview && (
                <div className="mt-1 flex flex-col sm:flex-row sm:items-center p-4 border border-gray-300 rounded-md bg-gray-50">
                  <div className="w-40 h-20 bg-white border rounded-md overflow-hidden mb-3 sm:mb-0 sm:mr-4">
                    <img 
                      src={signaturePreview} 
                      alt="Preview tanda tangan"
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Tanda Tangan Kepala Sekolah
                    </p>
                    <p className="text-xs text-gray-500">
                      Tanda tangan akan digunakan pada laporan
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeSignatureFile}
                    className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:bg-gray-100"
                  >
                    <span className="sr-only">Remove file</span>
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              )}
            />
          </div>
          
          {/* Instructions panel */}
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheck className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Petunjuk Upload Template
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Template harus dalam format Excel (.xlsx)</li>
                    <li>Tanda tangan dalam format JPG atau PNG</li>
                    <li>Nama kepala sekolah akan ditampilkan pada laporan</li>
                    <li>Sistem akan menggabungkan data kehadiran dengan template yang diupload</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengupload...
                </>
              ) : (
                <>
                  <FiUpload className="mr-2 -ml-1 h-5 w-5" />
                  Upload Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}