'use client'
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { getUserById, updateUser } from '../../../../api/user_service';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';

function EditTeacherPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nip: '',
    position: 'Guru',
  });

  // Fetch teacher data on component mount
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const response = await getUserById(id);
        
        if (response && response.success) {
          const { data } = response;
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            nip: data.nip || '',
            position: data.position || 'Guru',
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Gagal memuat data guru',
            icon: 'error',
          });
          router.push('/admin/teacher');
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        Swal.fire({
          title: 'Error',
          text: 'Gagal memuat data guru',
          icon: 'error',
        });
        router.push('/admin/teacher');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeacherData();
    }
  }, [id, router]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName) {
      Swal.fire({
        title: 'Validasi Error',
        text: 'Nama depan dan belakang harus diisi',
        icon: 'error',
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await updateUser(id, formData);
      
      if (response && response.success) {
        Swal.fire({
          title: 'Sukses',
          text: 'Data guru berhasil diperbarui',
          icon: 'success',
        }).then(() => {
          router.push('/admin/teacher');
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Gagal memperbarui data guru',
          icon: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan saat memperbarui data',
        icon: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel and return to teachers list
  const handleCancel = () => {
    router.push('/admin/teacher');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-5">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
          <p className="text-gray-700">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Data Guru</h1>
          <p className="mt-1 text-sm text-gray-500">
            Perbarui informasi guru dan staff
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-medium text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:border-gray-300 focus:ring ring-gray-200 mr-2"
          >
            <FiArrowLeft className="mr-2" />
            Kembali
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Depan */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Nama Depan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
              />
            </div>
            
            {/* Nama Belakang */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nama Belakang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
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
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                placeholder="Kosongkan jika tidak ada"
              />
            </div>
            
            {/* Jabatan */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Jabatan <span className="text-red-500">*</span>
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
              >
                <option value="Guru">Guru</option>
                <option value="TU">Tata Usaha</option>
              </select>
            </div>
          </div>
          
          {/* Submit button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {submitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page({ params }) {
  return (
    <AdminAuthWrapper>
      <EditTeacherPage params={params} />
    </AdminAuthWrapper>
  );
}
