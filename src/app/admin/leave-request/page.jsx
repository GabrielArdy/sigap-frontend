'use client';
import { useState } from 'react';
import { 
  FiMail, 
  FiSearch, 
  FiRefreshCw, 
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';
import { useRouter } from 'next/navigation';

// Dummy data for leave requests
const initialLeaveRequests = [
  {
    id: 1,
    employee: 'John Doe',
    department: 'Engineering',
    type: 'Sick Leave',
    startDate: '2023-11-10',
    endDate: '2023-11-12',
    reason: 'Medical appointment and recovery',
    status: 'Pending',
    isRead: false,
    submitDate: '2023-11-05'
  },
  {
    id: 2,
    employee: 'Jane Smith',
    department: 'HR',
    type: 'Annual Leave',
    startDate: '2023-11-15',
    endDate: '2023-11-20',
    reason: 'Family vacation',
    status: 'Pending',
    isRead: false,
    submitDate: '2023-11-01'
  },
  {
    id: 3,
    employee: 'Mike Johnson',
    department: 'Marketing',
    type: 'Personal Leave',
    startDate: '2023-11-08',
    endDate: '2023-11-09',
    reason: 'Personal matters',
    status: 'Pending',
    isRead: true,
    submitDate: '2023-10-30'
  },
  {
    id: 4,
    employee: 'Sarah Williams',
    department: 'Finance',
    type: 'Sick Leave',
    startDate: '2023-11-11',
    endDate: '2023-11-13',
    reason: 'Fever and flu',
    status: 'Pending',
    isRead: true,
    submitDate: '2023-11-02'
  },
  {
    id: 5,
    employee: 'Robert Chen',
    department: 'IT',
    type: 'Annual Leave',
    startDate: '2023-12-01',
    endDate: '2023-12-10',
    reason: 'Year-end vacation',
    status: 'Pending',
    isRead: false,
    submitDate: '2023-11-06'
  }
];

function LeaveRequestPage() {
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleRequestClick = (request) => {
    // Update the read status
    if (!request.isRead) {
      const updatedRequests = leaveRequests.map(req => 
        req.id === request.id ? { ...req, isRead: true } : req
      );
      setLeaveRequests(updatedRequests);
    }
    
    // Navigate to detail page instead of showing details inline
    router.push(`/admin/leave-request/${request.id}`);
  };

  const unreadCount = leaveRequests.filter(req => !req.isRead).length;

  // Filter leave requests based on search query
  const filteredRequests = leaveRequests.filter(req =>
    req.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.department.toLowerCase().includes(searchQuery.toLowerCase())
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
          <button className="p-2 rounded-full hover:bg-gray-100">
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
      
      {/* Leave requests list - now full width */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                {/* Removed department column */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
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
                        <div className="text-sm font-medium text-gray-900">
                          {request.employee}
                        </div>
                      </div>
                    </td>
                    {/* Removed department cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.startDate} - {request.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.submitDate).toLocaleDateString()}
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
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
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
                      <span className={`text-sm font-medium text-gray-900 ${!request.isRead ? 'font-bold' : ''}`}>
                        {request.employee}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(request.submitDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-700">
                        {request.type}: {request.startDate} - {request.endDate}
                      </p>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className={`inline-flex text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
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
