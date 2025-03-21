'use client'
import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { getUsers, deleteUser } from '../../api/user_service';

export default function DataGuruPage() {
  const router = useRouter();
  // State for teacher data
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  
  // State for filters
  const [search, setSearch] = useState('');
  const [jabatanFilter, setJabatanFilter] = useState('semua');
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  // Fetch data when pagination page changes or filters change
  useEffect(() => {
    fetchTeachers();
  }, [pagination.page, jabatanFilter]);
  
  // Function to fetch teachers using the API with pagination and filters
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      // Build filter object for backend
      const filter = {};
      
      if (jabatanFilter !== 'semua') {
        filter.position = jabatanFilter;
      }
      
      if (search.trim()) {
        // For search, we'll send it as a special filter property
        // Backend will implement logic to search in firstName, lastName or ID
        filter.search = search.trim();
      }
      
      // Pass pagination parameters and filters to the API call
      const response = await getUsers(pagination.page, pagination.limit, filter);
      
      if (response && response.success) {
        const teachersData = response.data.map(user => ({
          id: user.userId,  // Keep userId as internal ID
          nip: user.nip || null,  // Use NIP if available, otherwise null (will be displayed as '-')
          nama: `${user.firstName} ${user.lastName}`,
          jabatan: user.position
        }));
        
        setTeachers(teachersData);
        setFilteredTeachers(teachersData);
        
        // Set pagination info from API response
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        console.error('Failed to fetch teachers data');
        Swal.fire({
          title: 'Error',
          text: 'Gagal memuat data guru',
          icon: 'error',
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan saat memuat data',
        icon: 'error',
      });
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      // When search changes, reset to page 1 and fetch with new search term
      setPagination(prev => ({...prev, page: 1}));
      fetchTeachers();
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setJabatanFilter('semua');
    setPagination(prev => ({...prev, page: 1}));
    // fetchTeachers will be called by the useEffect that watches filter changes
  };

  // Handle add teacher
  const handleAddTeacher = () => {
    router.push('/admin/teacher/new');
  };

  // Handle edit teacher
  const handleEditTeacher = (id) => {
    router.push(`/admin/teacher/edit/${id}`);
  };

  // Handle delete teacher with API call
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUser(id);
          fetchTeachers(); // Refresh data after deletion
          
          Swal.fire(
            'Terhapus!',
            'Data guru telah dihapus.',
            'success'
          );
        } catch (error) {
          console.error('Error deleting teacher:', error);
          Swal.fire(
            'Error',
            'Gagal menghapus data guru.',
            'error'
          );
        }
      }
    });
  };

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prevPagination => ({
        ...prevPagination,
        page: newPage
      }));
    }
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
                      {((pagination.page - 1) * pagination.limit) + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.nip || "-"}
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

        {/* Pagination */}
        {!loading && filteredTeachers.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> sampai <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-medium">{pagination.total}</span> data
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Limited page numbers display with ellipsis */}
                  {Array.from({ length: pagination.pages }).map((_, i) => {
                    // Always show first page, last page, current page, and pages around current
                    const pageNumber = i + 1;
                    const showPageNumber = pageNumber === 1 || 
                                         pageNumber === pagination.pages || 
                                         Math.abs(pageNumber - pagination.page) <= 1;
                    
                    // Show ellipsis for gaps
                    if (!showPageNumber) {
                      // Show ellipsis before and after the current page range
                      if (pageNumber === 2 || pageNumber === pagination.pages - 1) {
                        return (
                          <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        );
                      }
                      return null; // Hide other page numbers
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          pagination.page === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}