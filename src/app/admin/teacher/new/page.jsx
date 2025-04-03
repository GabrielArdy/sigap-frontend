'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import AuthService from '../../../api/auth_service';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';

function AddTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    nip: '',
    position: 'Guru'
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generate password based on business rules
  const generatePassword = (nip, email) => {
    // If NIP exists, use it as password
    if (nip && nip.trim() !== '') {
      return nip;
    }
    
    // Otherwise, use the email prefix (part before @)
    if (email && email.includes('@')) {
      return email.split('@')[0];
    }
    
    // Fallback to a random string + current timestamp (should never reach here if validation is proper)
    return `DefaultPwd${Date.now().toString().slice(-6)}`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate required fields
      const requiredFields = ['email', 'firstName', 'lastName', 'position'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        Swal.fire({
          title: 'Error',
          text: `Field berikut harus diisi: ${missingFields.join(', ')}`,
          icon: 'error',
        });
        setLoading(false);
        return;
      }

      // Validate email format
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        Swal.fire({
          title: 'Error',
          text: 'Format email tidak valid',
          icon: 'error',
        });
        setLoading(false);
        return;
      }

      // Prepare data for registration according to business rules
      const password = generatePassword(formData.nip, formData.email);
      
      const registerData = {
        email: formData.email,
        password, // Either NIP or email prefix
        firstName: formData.firstName,
        lastName: formData.lastName,
        nip: formData.nip || null, // Allow empty NIP
        role: "user", // Default role as per business rule
        position: formData.position
      };

      // Call register API
      const response = await AuthService.register(registerData);
      
      if (response && response.success) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data guru berhasil ditambahkan',
          icon: 'success',
        }).then(() => {
          router.push('/admin/teacher'); // Redirect back to teachers list
        });
      } else {
        // Handle API error response
        const errorMessage = response.message || 'Terjadi kesalahan saat menambahkan data guru';
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
        });
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan pada server',
        icon: 'error',
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
          <h1 className="text-2xl font-bold text-gray-900">Tambah Data Guru</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tambahkan data guru atau staff tata usaha baru
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => router.push('/admin/teacher')}
            className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:border-gray-300 focus:ring ring-gray-200 disabled:opacity-25 transition ease-in-out duration-150"
          >
            <FiArrowLeft className="mr-2" />
            Kembali
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Nama Depan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nama Belakang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                required
              />
            </div>

            {/* NIP */}
            <div>
              <label htmlFor="nip" className="block text-sm font-medium text-gray-700">
                NIP
              </label>
              <input
                type="text"
                name="nip"
                id="nip"
                value={formData.nip}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                placeholder="Opsional"
              />
              <p className="mt-1 text-xs text-gray-500">
                NIP akan digunakan sebagai password default jika diisi
              </p>
            </div>

            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Jabatan <span className="text-red-500">*</span>
              </label>
              <select
                name="position"
                id="position"
                value={formData.position}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                required
              >
                <option value="Guru">Guru</option>
                <option value="TU">Tata Usaha</option>
              </select>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Bagian sebelum @ pada email akan digunakan sebagai password default jika NIP tidak diisi
              </p>
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Wajib diisi
            </p>
          </div>

          {/* Password Info */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Informasi Password:</strong> Password default akan diatur berdasarkan NIP jika diisi, atau menggunakan bagian email sebelum tanda @.
                </p>
              </div>
            </div>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:border-blue-800 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminAuthWrapper>
      <AddTeacherPage />
    </AdminAuthWrapper>
  );
}
