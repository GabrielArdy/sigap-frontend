'use client';
import { useState, useEffect } from 'react';
import { 
  FiMail, 
  FiSearch, 
  FiRefreshCw, 
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';
import { useRouter } from 'next/navigation';
import LeaveRequestService from '@/app/api/leave_request';

function LeaveRequestPage() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch leave requests from backend
  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await LeaveRequestService.getAllRequests();
      if (response.success) {
        // Transform API response to match our component's data structure
        const transformedRequests = response.data.map(req => ({
          id: req.requestId,
          employee: req.fullName,
          type: req.requestType === 'sick' ? 'Sakit' : 'Izin',
          status: req.approvalStatus || 'Pending',
          isRead: req.isOpen, // Corrected: isOpen means it has been read
          submitDate: req.requestedAt,
          approverComment: req.approverComment || '-' // Add approver comment
        }));
        
        // Sort requests: prioritize unread requests first, then by date
        transformedRequests.sort((a, b) => {
          // First priority: unread status (isRead = false comes first)
          if (!a.isRead && b.isRead) return -1;
          if (a.isRead && !b.isRead) return 1;
          
          // Second priority: date (newer requests come first)
          return new Date(b.submitDate) - new Date(a.submitDate);
        });
        
        setLeaveRequests(transformedRequests);
      } else {
        setError('Failed to fetch leave requests');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleRequestClick = async (request) => {
    try {
      // Get user info from localStorage for userId
      const userString = localStorage.getItem('user');
      let userId = null;
      
      if (userString) {
        const user = JSON.parse(userString);
        userId = user.userId;
      }
      
      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      // First call: Mark the request as read/open
      await LeaveRequestService.changeStatusRequest(request.id, {
        isOpen: true,
        userId: userId
      });
      
      // Update the read status locally
      if (!request.isRead) {
        const updatedRequests = leaveRequests.map(req => 
          req.id === request.id ? { ...req, isRead: true } : req
        );
        setLeaveRequests(updatedRequests);
      }
      
      // Navigate to detail page
      router.push(`/admin/leave-request/${request.id}`);
    } catch (error) {
      console.error("Error updating request status:", error);
      // Still navigate to the detail page even if status update fails
      router.push(`/admin/leave-request/${request.id}`);
    }
  };

  const handleRefresh = () => {
    fetchLeaveRequests();
  };

  const unreadCount = leaveRequests.filter(req => !req.isRead).length;

  // Filter leave requests based on search query
  const filteredRequests = leaveRequests.filter(req =>
    req.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Helper to format date as requested
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      // Format as DD MMM for dates within 7 days
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('id-ID', { month: 'short' });
      return `${day} ${month}`;
    } else {
      // Format as DD/MM/YYYY for older dates
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengajuan Izin</h1>
        <p className="mt-1 text-sm text-gray-500">
          Daftar pengajuan izin dari seluruh karyawan
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center">
          <div className="relative">
            <div className="absolute -top-2 -right-2 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full h-5 w-5">
              {unreadCount}
            </div>
            <FiMail className="w-5 h-5 text-gray-500" />
          </div>
          <span className="ml-3 text-sm text-gray-600">{unreadCount} permintaan belum dibaca</span>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="p-2 rounded-full hover:bg-gray-100" 
            onClick={handleRefresh}
          >
            <FiRefreshCw className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FiTrash2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FiSearch className="w-5 h-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Cari pengajuan izin..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>{error}</p>
          <button 
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            onClick={handleRefresh}
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          {/* Leave requests list - now full width */}
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hidden md:block">
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Guru</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Pengajuan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pengajuan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr 
                        key={request.id} 
                        className={`hover:bg-gray-50 ${!request.isRead ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`text-sm ${!request.isRead ? 'font-bold' : 'font-medium'} text-gray-900`}>
                              {request.employee}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${!request.isRead ? 'font-bold' : ''} text-gray-500`}>
                          {request.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${!request.isRead ? 'font-bold' : ''} text-gray-500`}>
                          {formatDate(request.submitDate)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${!request.isRead ? 'font-bold' : ''} text-gray-500 max-w-xs truncate`}>
                          {request.approverComment}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRequestClick(request)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <FiEye className="w-4 h-4 mr-1" />
                            <span>Lihat</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada pengajuan izin yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Responsive view for mobile */}
          <div className="md:hidden">
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <li 
                      key={request.id}
                      className={`cursor-pointer hover:bg-gray-50 transition-colors 
                        ${!request.isRead ? 'border-l-4 border-blue-500' : ''}`}
                    >
                      <div className="px-4 py-3" onClick={() => handleRequestClick(request)}>
                        <div className="flex justify-between">
                          <span className={`text-sm ${!request.isRead ? 'font-bold' : 'font-medium'} text-gray-900`}>
                            {request.employee}
                          </span>
                          <span className={`text-xs ${!request.isRead ? 'font-bold' : ''} text-gray-500`}>
                            {formatDate(request.submitDate)}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <p className={`text-sm ${!request.isRead ? 'font-bold' : ''} text-gray-700`}>
                            {request.type}
                          </p>
                          <span className={`inline-flex text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        {/* Display approver comment in mobile view */}
                        {request.approverComment !== '-' && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-600">Catatan:</p>
                            <p className={`text-sm ${!request.isRead ? 'font-semibold' : ''} text-gray-700 truncate`}>
                              {request.approverComment}
                            </p>
                          </div>
                        )}
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestClick(request);
                            }}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <FiEye className="w-4 h-4 mr-1" />
                            <span>Lihat</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-5 text-center text-gray-500">
                    Tidak ada pengajuan izin yang ditemukan.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function LeaveRequestAdmin() {
  return (
    <AdminAuthWrapper>
      <LeaveRequestPage />
    </AdminAuthWrapper>
  );
}
