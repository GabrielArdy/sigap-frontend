'use client'
import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiRefreshCw } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function DataGuruPage() {
  const router = useRouter();
  // State for teacher data
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  
  // State for filters
  const [search, setSearch] = useState('');
  const [jabatanFilter, setJabatanFilter] = useState('semua');
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);
  
  // Example function to fetch teachers - replace with actual API call
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      // In a real app, replace this with API call
      // const response = await fetch('/api/guru');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockData = [
        { id: 1, nip: '197501152005011002', nama: 'Budi Santoso', jabatan: 'Guru' },
        { id: 2, nip: '198603222010012005', nama: 'Siti Rahayu', jabatan: 'Guru' },
        { id: 3, nip: null, nama: 'Ahmad Fauzi', jabatan: 'Guru' },
        { id: 4, nip: '196712102002122001', nama: 'Dewi Kartika', jabatan: 'TU' },
        { id: 5, nip: '198107282008011003', nama: 'Rina Wijaya', jabatan: 'Guru' },
        { id: 6, nip: null, nama: 'Denny Nugraha', jabatan: 'TU' },
        { id: 7, nip: '199205172015031001', nama: 'Putri Handayani', jabatan: 'Guru' },
        { id: 8, nip: null, nama: 'Irwan Setiawan', jabatan: 'Guru' },
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setTeachers(mockData);
        setFilteredTeachers(mockData);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Apply filters whenever search or jabatan filter changes
  useEffect(() => {
    filterTeachers();
  }, [search, jabatanFilter, teachers]);

  // Filter function
  const filterTeachers = () => {
    let results = [...teachers];
    
    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      results = results.filter(teacher => 
        teacher.nama.toLowerCase().includes(searchLower) || 
        (teacher.nip && teacher.nip.includes(searchLower))
      );
    }
    
    // Apply jabatan filter
    if (jabatanFilter !== 'semua') {
      results = results.filter(teacher => teacher.jabatan === jabatanFilter);
    }
    
    setFilteredTeachers(results);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setJabatanFilter('semua');
  };

  // Handle add teacher
  const handleAddTeacher = () => {
    router.push('/admin/teacher/new');
  };

  // Handle edit teacher
  const handleEditTeacher = (id) => {
    // In a real app, navigate to edit form or show modal with id
    Swal.fire({
      title: 'Edit Guru',
      text: `Edit guru dengan ID: ${id}`,
      icon: 'info',
    });
  };

  // Handle delete teacher
  const handleDeleteTeacher = (id) => {
    Swal.fire({
      title: 'Hapus Data',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real app, make API call to delete
        // const deleteTeacher = async () => {
        //   await fetch(`/api/guru/${id}`, { method: 'DELETE' });
        //   fetchTeachers(); // Refresh data
        // };
        // deleteTeacher();
        
        // Mock deletion
        setTeachers(teachers.filter(teacher => teacher.id !== id));
        
        Swal.fire(
          'Terhapus!',
          'Data guru telah dihapus.',
          'success'
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Guru</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola data guru dan staff tata usaha
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleAddTeacher}
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:border-blue-800 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
          >
            <FiPlus className="mr-2" />
            Tambah Guru
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="relative md:col-span-5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-700" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau NIP..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
            />
          </div>
          
          {/* Jabatan filter */}
          <div className="md:col-span-3">
            <div className="flex items-center">
              <FiFilter className="h-5 w-5 text-gray-700 mr-2" />
              <select
                value={jabatanFilter}
                onChange={(e) => setJabatanFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-700"
              >
                <option value="semua">Semua Jabatan</option>
                <option value="Guru">Guru</option>
                <option value="TU">Tata Usaha</option>
              </select>
            </div>
          </div>
          
          {/* Reset button */}
          <div className="md:col-span-4 flex items-center justify-end">
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-medium text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:border-gray-300 focus:ring ring-gray-200 disabled:opacity-25 transition ease-in-out duration-150"
            >
              <FiRefreshCw className="mr-2" />
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Teachers table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIP
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jabatan
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada data guru yang ditemukan
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher, index) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.nip || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.nama}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        teacher.jabatan === 'Guru' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {teacher.jabatan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditTeacher(teacher.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <FiEdit2 className="h-5 w-5" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <FiTrash2 className="h-5 w-5" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - can be implemented for large datasets */}
        {!loading && filteredTeachers.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">1</span> sampai <span className="font-medium">{filteredTeachers.length}</span> dari <span className="font-medium">{filteredTeachers.length}</span> data
                </p>
              </div>
              {/* Pagination controls can be added here if needed */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}