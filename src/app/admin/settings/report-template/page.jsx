'use client'
import { useState, useRef } from 'react';
import { FiUser, FiMapPin, FiHome, FiFileText, FiCheck, FiUpload, FiPhone, FiHash } from 'react-icons/fi';
import Swal from 'sweetalert2';
// We don't need DragDropFilePicker anymore as we're using text inputs

export default function TemplateUploadPage() {
  // Form state for text inputs
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [principalId, setPrincipalId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [npsn, setNpsn] = useState('');
  const [nss, setNss] = useState('');
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [tutWuriLogo, setTutWuriLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for file inputs
  const schoolLogoRef = useRef(null);
  const tutWuriLogoRef = useRef(null);
  
  // Validation state
  const [errors, setErrors] = useState({
    schoolName: '',
    schoolAddress: '',
    district: '',
    principalName: '',
    principalId: '',
    phoneNumber: '',
    npsn: '',
    nss: '',
    schoolLogo: '',
    tutWuriLogo: ''
  });

  // Handle image preview
  const [schoolLogoPreview, setSchoolLogoPreview] = useState('');
  const [tutWuriLogoPreview, setTutWuriLogoPreview] = useState('');

  // Handle input changes with validation
  const handleInputChange = (e, setter, fieldName) => {
    const value = e.target.value;
    setter(value);
    
    // Validate field
    if (!value.trim()) {
      setErrors({...errors, [fieldName]: `${fieldName} harus diisi`});
    } else {
      setErrors({...errors, [fieldName]: ''});
    }
  };

  // Handle file changes
  const handleFileChange = (e, setter, previewSetter, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors({...errors, [fieldName]: 'File harus berupa gambar (JPG, PNG, atau GIF)'});
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({...errors, [fieldName]: 'Ukuran file maksimal 2MB'});
        return;
      }
      
      setter(file);
      setErrors({...errors, [fieldName]: ''});
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewSetter(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form validation before submit
  const validateForm = () => {
    const newErrors = {
      schoolName: !schoolName.trim() ? 'Nama Sekolah harus diisi' : '',
      schoolAddress: !schoolAddress.trim() ? 'Alamat Sekolah harus diisi' : '',
      district: !district.trim() ? 'Kabupaten/Kota harus diisi' : '',
      principalName: !principalName.trim() ? 'Nama Kepala Sekolah harus diisi' : '',
      principalId: !principalId.trim() ? 'NIP Kepala Sekolah harus diisi' : '',
      phoneNumber: !phoneNumber.trim() ? 'Nomor Telepon harus diisi' : '',
      npsn: !npsn.trim() ? 'NPSN harus diisi' : '',
      nss: !nss.trim() ? 'NSS harus diisi' : '',
      schoolLogo: !schoolLogo ? 'Logo Sekolah harus diunggah' : '',
      tutWuriLogo: !tutWuriLogo ? 'Logo Tut Wuri harus diunggah' : ''
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
      // Create data object for submission
      const formData = new FormData();
      formData.append('schoolName', schoolName);
      formData.append('schoolAddress', schoolAddress);
      formData.append('district', district);
      formData.append('principalName', principalName);
      formData.append('principalId', principalId);
      formData.append('phoneNumber', phoneNumber);
      formData.append('npsn', npsn);
      formData.append('nss', nss);
      formData.append('schoolLogo', schoolLogo);
      formData.append('tutWuriLogo', tutWuriLogo);
      
      // Here you would normally send the data to your API
      // const response = await fetch('/api/report-template', {
      //   method: 'POST',
      //   body: formData
      // });
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Informasi template laporan berhasil disimpan',
      });
      
    } catch (error) {
      console.error('Error saving template information:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat menyimpan informasi template',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Template Laporan</h1>
        <p className="mt-1 text-sm text-gray-500">
          Atur informasi sekolah yang akan ditampilkan pada laporan kehadiran
        </p>
      </div>
      
      {/* Input form */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Name */}
          <div>
            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Sekolah <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiHome className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                value={schoolName}
                onChange={(e) => handleInputChange(e, setSchoolName, 'Nama Sekolah')}
                className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Masukkan nama sekolah"
              />
            </div>
            {errors.schoolName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.schoolName}
              </p>
            )}
          </div>
          
          {/* NPSN */}
          <div>
            <label htmlFor="npsn" className="block text-sm font-medium text-gray-700 mb-1">
              NPSN <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiHash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="npsn"
                name="npsn"
                value={npsn}
                onChange={(e) => handleInputChange(e, setNpsn, 'NPSN')}
                className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Masukkan NPSN sekolah"
              />
            </div>
            {errors.npsn && (
              <p className="mt-1 text-sm text-red-600">
                {errors.npsn}
              </p>
            )}
          </div>
          
          {/* NSS */}
          <div>
            <label htmlFor="nss" className="block text-sm font-medium text-gray-700 mb-1">
              NSS <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiHash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="nss"
                name="nss"
                value={nss}
                onChange={(e) => handleInputChange(e, setNss, 'NSS')}
                className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Masukkan NSS sekolah"
              />
            </div>
            {errors.nss && (
              <p className="mt-1 text-sm text-red-600">
                {errors.nss}
              </p>
            )}
          </div>
          
          {/* School Address */}
          <div>
            <label htmlFor="schoolAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Sekolah <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="schoolAddress"
                name="schoolAddress"
                value={schoolAddress}
                onChange={(e) => handleInputChange(e, setSchoolAddress, 'Alamat Sekolah')}
                className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Masukkan alamat sekolah"
              />
            </div>
            {errors.schoolAddress && (
              <p className="mt-1 text-sm text-red-600">
                {errors.schoolAddress}
              </p>
            )}
          </div>
          
          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => handleInputChange(e, setPhoneNumber, 'Nomor Telepon')}
                className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Masukkan nomor telepon sekolah"
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phoneNumber}
              </p>
            )}
          </div>
          
          {/* District */}
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
              Kabupaten/Kota <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="district"
                name="district"
                value={district}
                onChange={(e) => handleInputChange(e, setDistrict, 'Kabupaten/Kota')}
                className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Masukkan kabupaten/kota"
              />
            </div>
            {errors.district && (
              <p className="mt-1 text-sm text-red-600">
                {errors.district}
              </p>
            )}
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
                onChange={(e) => handleInputChange(e, setPrincipalName, 'Nama Kepala Sekolah')}
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
          
          {/* Principal ID */}
          <div>
            <label htmlFor="principalId" className="block text-sm font-medium text-gray-700 mb-1">
              NIP Kepala Sekolah <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="principalId"
                name="principalId"
                value={principalId}
                onChange={(e) => handleInputChange(e, setPrincipalId, 'NIP Kepala Sekolah')}
                className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Masukkan NIP kepala sekolah"
              />
            </div>
            {errors.principalId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.principalId}
              </p>
            )}
          </div>
          
          {/* School Logo */}
          <div>
            <label htmlFor="schoolLogo" className="block text-sm font-medium text-gray-700 mb-1">
              Logo Sekolah <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <button
                type="button"
                onClick={() => schoolLogoRef.current.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiUpload className="mr-2 -ml-1 h-5 w-5" />
                {schoolLogo ? 'Ganti Logo' : 'Unggah Logo'}
              </button>
              
              <input
                type="file"
                id="schoolLogo"
                ref={schoolLogoRef}
                onChange={(e) => handleFileChange(e, setSchoolLogo, setSchoolLogoPreview, 'schoolLogo')}
                accept="image/*"
                className="hidden"
              />
              
              {schoolLogoPreview && (
                <div className="relative w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                  <img 
                    src={schoolLogoPreview} 
                    alt="Logo Sekolah" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {schoolLogo && (
                <span className="text-sm text-gray-500">
                  {schoolLogo.name}
                </span>
              )}
            </div>
            {errors.schoolLogo && (
              <p className="mt-1 text-sm text-red-600">
                {errors.schoolLogo}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG, atau GIF. Ukuran maksimal: 2MB</p>
          </div>
          
          {/* Tut Wuri Logo */}
          <div>
            <label htmlFor="tutWuriLogo" className="block text-sm font-medium text-gray-700 mb-1">
              Logo Tut Wuri <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <button
                type="button"
                onClick={() => tutWuriLogoRef.current.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiUpload className="mr-2 -ml-1 h-5 w-5" />
                {tutWuriLogo ? 'Ganti Logo' : 'Unggah Logo'}
              </button>
              
              <input
                type="file"
                id="tutWuriLogo"
                ref={tutWuriLogoRef}
                onChange={(e) => handleFileChange(e, setTutWuriLogo, setTutWuriLogoPreview, 'tutWuriLogo')}
                accept="image/*"
                className="hidden"
              />
              
              {tutWuriLogoPreview && (
                <div className="relative w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                  <img 
                    src={tutWuriLogoPreview} 
                    alt="Logo Tut Wuri" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {tutWuriLogo && (
                <span className="text-sm text-gray-500">
                  {tutWuriLogo.name}
                </span>
              )}
            </div>
            {errors.tutWuriLogo && (
              <p className="mt-1 text-sm text-red-600">
                {errors.tutWuriLogo}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG, atau GIF. Ukuran maksimal: 2MB</p>
          </div>
          
          {/* Instructions panel */}
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheck className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Petunjuk Pengisian Informasi
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Isi semua informasi sekolah dengan benar</li>
                    <li>Informasi ini akan digunakan pada header laporan kehadiran</li>
                    <li>Logo sekolah dan logo Tut Wuri akan ditampilkan pada header laporan</li>
                    <li>Nama dan NIP kepala sekolah akan ditampilkan pada bagian tanda tangan laporan</li>
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
                  Menyimpan...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2 -ml-1 h-5 w-5" />
                  Simpan Informasi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}