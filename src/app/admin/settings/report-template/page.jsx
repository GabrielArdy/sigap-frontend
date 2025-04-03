'use client'
import { useState, useRef, useEffect } from 'react';
import { FiUser, FiMapPin, FiHome, FiFileText, FiCheck, FiUpload, FiPhone, FiHash, FiEdit } from 'react-icons/fi';
import Swal from 'sweetalert2';
import ReportInfo from '@/app/api/report_info';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';

function TemplateUploadPage() {
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
  const [isEditing, setIsEditing] = useState(false);
  const [dataExists, setDataExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Fetch data on component mount
  useEffect(() => {
    const fetchReportInfo = async () => {
      try {
        setIsLoading(true);
        const data = await ReportInfo.getReportInfo();
        
        if (data && data._id) {
          setDataExists(true);
          // Populate the form with existing data
          setSchoolName(data.schoolName || '');
          setSchoolAddress(data.schoolAddress || '');
          setDistrict(data.schoolDistrict || '');
          setPrincipalName(data.pricipalName || ''); // Note the typo in API: "pricipalName"
          setPrincipalId(data.principalNip || '');
          setPhoneNumber(data.schoolPhone || '');
          setNpsn(data.npsn || '');
          setNss(data.nss || '');
          
          // Set image previews if available
          if (data.schoolEmblem) {
            setSchoolLogoPreview(data.schoolEmblem);
          }
          
          if (data.ministryEmblem) {
            setTutWuriLogoPreview(data.ministryEmblem);
          }
        }
      } catch (error) {
        console.error('Error fetching report information:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Data',
          text: 'Gagal memuat informasi template laporan',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportInfo();
  }, []);

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

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

  // Convert base64 image to file
  const base64ToFile = (dataUrl, filename) => {
    if (!dataUrl) return null;
    
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };

  // Handle file changes
  const handleFileChange = (e, setter, previewSetter, fieldName) => {
    if (!isEditing) return;
    
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
      schoolLogo: !schoolLogoPreview ? 'Logo Sekolah harus diunggah' : '',
      tutWuriLogo: !tutWuriLogoPreview ? 'Logo Tut Wuri harus diunggah' : ''
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
      
      // If we have file objects, use those, otherwise create files from the base64 data
      const schoolLogoFile = schoolLogo || (schoolLogoPreview ? base64ToFile(schoolLogoPreview, 'school_logo.png') : null);
      const tutWuriLogoFile = tutWuriLogo || (tutWuriLogoPreview ? base64ToFile(tutWuriLogoPreview, 'ministry_logo.png') : null);
      
      // Create data object for API
      const reportData = {
        schoolName,
        schoolAddress,
        schoolPhone: phoneNumber,
        schoolDistrict: district,
        npsn,
        nss,
        pricipalName: principalName, // Match the API field name (with typo)
        principalNip: principalId,
        schoolEmblem: schoolLogoPreview,
        ministryEmblem: tutWuriLogoPreview
      };
      
      // Send data to API
      const response = await ReportInfo.createOrUpdateReport(reportData);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Informasi template laporan berhasil disimpan',
      });
      
      // Exit edit mode and set dataExists to true
      setIsEditing(false);
      setDataExists(true);
      
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-700">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Template Laporan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Atur informasi sekolah yang akan ditampilkan pada laporan kehadiran
          </p>
        </div>
        
        {!isEditing && dataExists && (
          <button
            type="button"
            onClick={toggleEditMode}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiEdit className="mr-2 -ml-1 h-5 w-5" />
            Perbarui Informasi
          </button>
        )}
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
                className={`block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${!isEditing && dataExists ? 'bg-gray-100' : ''}`}
                placeholder="Masukkan nama sekolah"
                disabled={!isEditing && dataExists}
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
                className={`block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${!isEditing && dataExists ? 'bg-gray-100' : ''}`}
                placeholder="Masukkan NPSN sekolah"
                disabled={!isEditing && dataExists}
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
                className={`block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${!isEditing && dataExists ? 'bg-gray-100' : ''}`}
                placeholder="Masukkan NSS sekolah"
                disabled={!isEditing && dataExists}
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
                className={`block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${!isEditing && dataExists ? 'bg-gray-100' : ''}`}
                placeholder="Masukkan alamat sekolah"
                disabled={!isEditing && dataExists}
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
                className={`block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${!isEditing && dataExists ? 'bg-gray-100' : ''}`}
                placeholder="Masukkan nomor telepon sekolah"
                disabled={!isEditing && dataExists}
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
                className={`block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${!isEditing && dataExists ? 'bg-gray-100' : ''}`}
                placeholder="Masukkan kabupaten/kota"
                disabled={!isEditing && dataExists}
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
                className={`block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${!isEditing && dataExists ? 'bg-gray-100' : ''}`}
                placeholder="Masukkan nama lengkap kepala sekolah"
                disabled={!isEditing && dataExists}
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
                className={`block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${!isEditing && dataExists ? 'bg-gray-100' : ''}`}
                placeholder="Masukkan NIP kepala sekolah"
                disabled={!isEditing && dataExists}
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
              {(isEditing || !dataExists) && (
                <button
                  type="button"
                  onClick={() => schoolLogoRef.current.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={!isEditing && dataExists}
                >
                  <FiUpload className="mr-2 -ml-1 h-5 w-5" />
                  {schoolLogoPreview ? 'Ganti Logo' : 'Unggah Logo'}
                </button>
              )}
              
              <input
                type="file"
                id="schoolLogo"
                ref={schoolLogoRef}
                onChange={(e) => handleFileChange(e, setSchoolLogo, setSchoolLogoPreview, 'schoolLogo')}
                accept="image/*"
                className="hidden"
                disabled={!isEditing && dataExists}
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
              {(isEditing || !dataExists) && (
                <button
                  type="button"
                  onClick={() => tutWuriLogoRef.current.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={!isEditing && dataExists}
                >
                  <FiUpload className="mr-2 -ml-1 h-5 w-5" />
                  {tutWuriLogoPreview ? 'Ganti Logo' : 'Unggah Logo'}
                </button>
              )}
              
              <input
                type="file"
                id="tutWuriLogo"
                ref={tutWuriLogoRef}
                onChange={(e) => handleFileChange(e, setTutWuriLogo, setTutWuriLogoPreview, 'tutWuriLogo')}
                accept="image/*"
                className="hidden"
                disabled={!isEditing && dataExists}
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
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={toggleEditMode}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Batal
              </button>
            )}
            
            {(isEditing || !dataExists) && (
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
                    {dataExists ? 'Simpan Perubahan' : 'Simpan Informasi'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminAuthWrapper>
      <TemplateUploadPage />
    </AdminAuthWrapper>
  );
}