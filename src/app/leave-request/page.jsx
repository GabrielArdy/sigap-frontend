'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaPlus, FaClipboardList, FaCalendarAlt, FaCheck, FaTimes, FaClock, FaUserCircle } from 'react-icons/fa';
import AuthWrapper from '@/components/AuthWrapper';
import LeaveRequestService from '@/app/api/leave_request';

function LeaveRequestList() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Get user from localStorage
        const userString = localStorage.getItem('user');
        if (!userString) {
          setError('User not found in localStorage');
          setLoading(false);
          return;
        }
        
        const user = JSON.parse(userString);
        const userId = user.userId;
        
        // Fetch data from the API
        const response = await LeaveRequestService.getRequestByUserId(userId);
        
        if (response && response.success) {
          // Map API data to the format expected by the UI
          const formattedData = response.data.map(item => ({
            id: item.requestId,
            type: item.requestType,
            startDate: new Date(item.requestedStartDate),
            endDate: new Date(item.requestedEndDate),
            reason: item.description,
            status: item.approvalStatus.toLowerCase(),
            createdAt: new Date(item.requestedAt),
            // Only include reviewedBy if not pending
            reviewedBy: item.approvalStatus.toLowerCase() !== 'pending' ? {
              name: item.approverName,
              date: new Date(item.updatedAt)
            } : null
          }));
          
          setRequests(formattedData);
        } else {
          setError('Failed to fetch leave requests');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching requests: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheck className="text-green-500" />;
      case 'rejected':
        return <FaTimes className="text-red-500" />;
      case 'pending':
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 text-slate-700">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/home')}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <FaChevronLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold flex items-center">
            <FaClipboardList className="mr-2" /> Pengajuan Izin
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex flex-col gap-6 max-w-md">
        {/* Create New Button */}
        <button
          onClick={() => router.push('/leave-request/new')}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white 
                   py-4 px-6 rounded-xl shadow-md transition-all flex items-center justify-center
                   transform hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 duration-300"
        >
          <FaPlus className="mr-2" />
          <span>Buat Pengajuan Baru</span>
        </button>

        {/* Request List */}
        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-sky-100">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-500" /> Riwayat Pengajuan
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-3 border-b-3 border-blue-500"></div>
              <p className="mt-3 text-slate-600">Memuat data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
              <p>{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>Belum ada pengajuan izin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/leave-request/${request.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${request.type === 'sick' ? 'bg-red-100' : 'bg-blue-100'} mr-3`}>
                        <FaCalendarAlt className={`${request.type === 'sick' ? 'text-red-500' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {request.type === 'sick' ? 'Konfirmasi Sakit' : 'Pengajuan Izin'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Diajukan: {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">
                        {request.status === 'approved' ? 'Disetujui' : 
                         request.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                      </span>
                    </span>
                  </div>
                  
                  <div className="pl-11">
                    <div className="text-sm mb-1">
                      <span className="font-medium">Tanggal: </span>
                      {formatDate(request.startDate)}
                      {request.startDate.getTime() !== request.endDate.getTime() && 
                        ` - ${formatDate(request.endDate)}`}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-1">{request.reason}</p>
                    
                    {/* Improved reviewer information */}
                    {request.reviewedBy && (
                      <div className="mt-3 pt-2 border-t border-slate-200 text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-100 rounded-full p-1.5">
                            <FaUserCircle className="text-slate-500 text-sm" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Ditinjau oleh:</p>
                            <p className="text-sm font-medium">{request.reviewedBy.name}</p>
                            <p className="text-xs text-slate-400">{formatDate(request.reviewedBy.date)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LeaveRequestListPage() {
  return (
    <AuthWrapper>
      <LeaveRequestList />
    </AuthWrapper>
  );
}
