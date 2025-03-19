'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function AddTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    nip: '',
    position: 'Guru',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For NIP field, only allow numeric input
    if (name === 'nip' && value !== '' && !/^\d*$/.test(value)) {
      return; // Do not update state if input is not numeric
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = 'Nama depan wajib diisi';
    }
    
    // NIP validation (if provided)
    if (formData.nip && !/^\d+$/.test(formData.nip)) {
      newErrors.nip = 'NIP hanya boleh berisi angka';
    }
    
    // Set errors and return validity status
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Prepare the payload
    const payload = {
      email: formData.email,
      password: formData.nip || formData.email.split('@')[0], // Default from NIP or email prefix
      role: 'user', // Hidden field - always 'user'
      position: formData.position,
      firstName: formData.firstName,
      lastName: formData.lastName || '',
      nip: formData.nip || null
    };
    
    try {
      // In a real app, this would be an API call
      console.log('Submitting data:', payload);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data guru berhasil ditambahkan',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        router.push('/admin/teacher');
      });
    } catch (error) {
      console.error('Error adding teacher:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menambahkan data guru',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Guru Baru</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tambahkan data guru atau staff tata usaha baru
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => router.push('/admin/teacher')}
            className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:border-gray-400 focus:ring ring-gray-200 disabled:opacity-25 transition ease-in-out duration-150"
          >
            <FiArrowLeft className="mr-2" />
            Kembali
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email and First Name (Row 1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Nama Depan<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
          </div>

          {/* Last Name and NIP (Row 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nama Belakang
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* NIP (Optional) */}
            <div>
              <label htmlFor="nip" className="block text-sm font-medium text-gray-700">
                NIP (Opsional)
              </label>
              <input
                type="text"
                name="nip"
                id="nip"
                placeholder="Masukkan angka saja"
                value={formData.nip}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.nip ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.nip && (
                <p className="mt-1 text-sm text-red-500">{errors.nip}</p>
              )}
            </div>
          </div>

          {/* Position (Row 3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Jabatan<span className="text-red-500">*</span>
              </label>
              <select
                name="position"
                id="position"
                value={formData.position}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Guru">Guru</option>
                <option value="TU">Tata Usaha</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/admin/teacher')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    <span>Simpan</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mt-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Catatan:</h3>
            <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
              <li>Password guru akan otomatis dibuat dari NIP jika ada</li>
              <li>Jika NIP tidak ada, password akan menggunakan bagian email sebelum tanda @</li>
              <li>Semua guru memiliki role "user" secara default</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}
