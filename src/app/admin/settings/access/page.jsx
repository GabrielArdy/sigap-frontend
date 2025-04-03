'use client'
import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiSave, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { getAllAdminAccessData, updateAdminAccessData } from '@/app/api/user_service';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';

function AdminAccessPage() {
  // State for users data and pagination
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Form state for adding new user
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    isAdmin: false
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Sort and filter users whenever the original list or search query changes
  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchQuery]);

  // Update pagination when filtered users change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filteredUsers, itemsPerPage]);

  // Function to fetch users from the API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllAdminAccessData();
      
      if (response.success) {
        setUsers(response.data);
      } else {
        throw new Error('Failed to fetch admin users');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load users data',
      });
    }
  };

  // Filter and sort users
  const filterAndSortUsers = () => {
    let filtered = [...users];
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
      );
    }
    
    // Sort: admins first, then alphabetically by name
    filtered.sort((a, b) => {
      // First by admin status (admins first)
      if (a.isAdmin !== b.isAdmin) {
        return a.isAdmin ? -1 : 1;
      }
      // Then alphabetically by name
      return a.fullName.localeCompare(b.fullName);
    });
    
    setFilteredUsers(filtered);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Toggle admin status
  const toggleAdminStatus = async (userId) => {
    try {
      const userIndex = users.findIndex(u => u.userId === userId);
      if (userIndex === -1) return;
      
      const updatedUsers = [...users];
      const newAdminStatus = !updatedUsers[userIndex].isAdmin;
      
      // Make API call to update admin status
      const response = await updateAdminAccessData(userId, newAdminStatus);
      
      if (response && response.success) {
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          isAdmin: newAdminStatus
        };
        
        setUsers(updatedUsers);
        
        Swal.fire({
          icon: 'success',
          title: 'Updated',
          text: `Admin access ${newAdminStatus ? 'granted to' : 'revoked from'} ${updatedUsers[userIndex].fullName}`,
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        throw new Error('Failed to update admin status');
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update admin status',
      });
    }
  };

  // Handle adding new user
  const handleAddUser = async () => {
    // Validate form
    if (!newUser.email || !newUser.fullName) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Email and full name are required',
      });
      return;
    }

    if (!validateEmail(newUser.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a valid email address',
      });
      return;
    }

    try {
      // In a real app, make API call:
      // const response = await fetch('/api/admin/users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newUser)
      // });
      // const data = await response.json();
      
      // Mock adding new user
      const newUserId = Math.random().toString(36).substring(2, 15);
      const addedUser = {
        userId: newUserId,
        ...newUser
      };
      
      setUsers([...users, addedUser]);
      setShowAddModal(false);
      setNewUser({
        email: '',
        fullName: '',
        isAdmin: false
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'User added successfully',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error adding user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add user',
      });
    }
  };

  // Email validation helper
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Navigation
  const goToPreviousPage = () => {
    setCurrentPage(page => Math.max(page - 1, 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Akses Admin</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola pengguna yang memiliki akses admin
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akses Admin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : getCurrentPageItems().length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada data user yang ditemukan
                  </td>
                </tr>
              ) : (
                getCurrentPageItems().map((user, index) => {
                  // Calculate the real index based on pagination
                  const realIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  
                  return (
                    <tr key={user.userId} className={`${user.isAdmin ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {realIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {/* Toggle switch */}
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => toggleAdminStatus(user.userId)}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                              user.isAdmin ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                            role="switch"
                            aria-checked={user.isAdmin}
                          >
                            <span 
                              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                user.isAdmin ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`ml-2 text-xs font-medium ${user.isAdmin ? 'text-blue-700' : 'text-gray-500'}`}>
                            {user.isAdmin ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredUsers.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)}</span>{" "}
                  sampai <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span>{" "}
                  dari <span className="font-medium">{filteredUsers.length}</span> user
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 
                      ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                  <span className="ml-1">Previous</span>
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages 
                      ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1">Next</span>
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Tambah User
                    </h3>
                    <div className="mt-4 space-y-4">
                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                      
                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                          Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          value={newUser.fullName}
                          onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Nama lengkap"
                          required
                        />
                      </div>
                      
                      {/* Admin Access */}
                      <div className="flex items-center">
                        <input
                          id="isAdmin"
                          type="checkbox"
                          checked={newUser.isAdmin}
                          onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isAdmin" className="ml-2 block text-sm font-medium text-gray-700">
                          Berikan akses admin
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddUser}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Tambahkan
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AdminAuthWrapper>
        <AdminAccessPage />
    </AdminAuthWrapper>
  );
}