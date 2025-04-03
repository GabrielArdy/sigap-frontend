'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiX, FiPaperclip } from 'react-icons/fi';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';
import Swal from 'sweetalert2';
import Image from 'next/image';

// Using the same dummy data from the list page with added document URLs
const leaveRequests = [
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
    submitDate: '2023-11-05',
    employeeId: 'EMP001',
    position: 'Software Engineer',
    details: 'Need to see a doctor for a persistent cough and then rest.',
    documentUrl: 'https://cdn.pixabay.com/photo/2020/07/14/13/07/icon-5404125_1280.png'
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
    submitDate: '2023-11-01',
    employeeId: 'EMP002',
    position: 'HR Manager',
    details: 'Annual family trip that was planned months in advance.',
    documentUrl: null
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
    submitDate: '2023-10-30',
    employeeId: 'EMP003',
    position: 'Marketing Specialist',
    details: 'Need to attend to some urgent family matters.'
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
    submitDate: '2023-11-02',
    employeeId: 'EMP004',
    position: 'Financial Analyst',
    details: 'Coming down with a fever and need time to recover.'
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
    submitDate: '2023-11-06',
    employeeId: 'EMP005',
    position: 'IT Support Specialist',
    details: 'End of year vacation to visit family overseas.'
  }
];

function LeaveRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    // Simulate API fetch with a small delay
    const timer = setTimeout(() => {
      const foundRequest = leaveRequests.find(req => req.id === Number(id));
      setRequest(foundRequest);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'Approved') {
      Swal.fire({
        title: 'Setujui Pengajuan',
        html: `
          <p>Anda akan menyetujui pengajuan izin dari <strong>${request.employee}</strong>.</p>
          <p class="mt-2 text-sm">Tambahkan komentar (opsional):</p>
          <textarea id="approverComment" class="w-full p-2 mt-1 border rounded text-sm" placeholder="Masukkan komentar Anda di sini..."></textarea>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Setujui',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const commentInput = Swal.getPopup().querySelector('#approverComment').value;
          setComment(commentInput);
          return commentInput;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          completeStatusChange(newStatus, result.value);
        }
      });
    } else if (newStatus === 'Rejected') {
      Swal.fire({
        title: 'Tolak Pengajuan',
        html: `
          <p>Anda akan menolak pengajuan izin dari <strong>${request.employee}</strong>.</p>
          <p class="mt-2 text-sm text-red-600">Berikan alasan penolakan:</p>
          <textarea id="approverComment" class="w-full p-2 mt-1 border rounded text-sm" placeholder="Berikan alasan penolakan..." required></textarea>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Tolak',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const commentInput = Swal.getPopup().querySelector('#approverComment').value;
          if (!commentInput) {
            Swal.showValidationMessage('Alasan penolakan wajib diisi');
            return false;
          }
          setComment(commentInput);
          return commentInput;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          completeStatusChange(newStatus, result.value);
        }
      });
    }
  };

  const completeStatusChange = (newStatus, commentText) => {
    setRequest(prev => ({
      ...prev,
      status: newStatus,
      approverComment: commentText
    }));
    setStatusUpdate(newStatus);
    
    // Show success message
    Swal.fire({
      title: newStatus === 'Approved' ? 'Pengajuan Disetujui' : 'Pengajuan Ditolak',
      text: newStatus === 'Approved' 
        ? 'Pengajuan izin berhasil disetujui' 
        : 'Pengajuan izin berhasil ditolak',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
    
    // In a real app, this would be an API call
    // For now, just show the status change locally
    setTimeout(() => {
      // Navigate back after update (simulating success)
      router.push('/admin/leave-request');
    }, 2500);
  };

  // Calculate leave duration in days
  const calculateDuration = () => {
    if (!request) return 0;
    
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the start day
    
    return diffDays;
  };

  // Open the image modal
  const openImageModal = () => {
    if (request?.documentUrl) {
      setIsImageModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">Pengajuan izin tidak ditemukan</h2>
        <p className="mt-2 text-gray-600">Pengajuan dengan ID {id} tidak tersedia.</p>
        <button
          onClick={() => router.push('/admin/leave-request')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <FiArrowLeft className="mr-2" /> Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status update banner */}
      {statusUpdate && (
        <div className={`rounded-md p-4 ${
          statusUpdate === 'Approved' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {statusUpdate === 'Approved' ? (
                <FiCheck className="h-5 w-5 text-green-400" />
              ) : (
                <FiX className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Pengajuan izin telah {statusUpdate === 'Approved' ? 'disetujui' : 'ditolak'}
              </p>
              {comment && (
                <p className="text-sm mt-1">Komentar: {comment}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pengajuan Izin</h1>
          <p className="mt-1 text-sm text-gray-500">
            Informasi lengkap pengajuan izin karyawan
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/leave-request')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 text-gray-700"
        >
          <FiArrowLeft className="mr-2" /> Kembali
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {request.employee} - {request.type}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Diajukan pada {new Date(request.submitDate).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </dd>
            </div>
            
            <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ID Karyawan</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{request.employeeId}</dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Departemen</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{request.department}</dd>
            </div>
            
            <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Posisi</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{request.position}</dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Jenis Izin</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{request.type}</dd>
            </div>
            
            <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tanggal Mulai</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(request.startDate).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tanggal Selesai</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(request.endDate).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Durasi</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {calculateDuration()} hari
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Alasan</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{request.reason}</dd>
            </div>
            
            <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Dokumen Pendukung</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {request.documentUrl ? (
                  <button 
                    onClick={openImageModal} 
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none"
                  >
                    <FiPaperclip className="mr-1" />
                    Lihat Dokumen
                  </button>
                ) : (
                  <span className="text-gray-500 italic">Tidak ada dokumen pendukung</span>
                )}
              </dd>
            </div>
            
            {request.approverComment && (
              <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Komentar Approver</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{request.approverComment}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {request.status === 'Pending' && (
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-end">
          <button
            onClick={() => handleStatusChange('Rejected')}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FiX className="mr-2" /> Tolak Pengajuan
          </button>
          <button
            onClick={() => handleStatusChange('Approved')}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiCheck className="mr-2" /> Setujui Pengajuan
          </button>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && request?.documentUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg max-w-3xl w-full mx-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Dokumen Pendukung</h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex justify-center">
              <div className="relative w-full h-[60vh]">
                <img
                  src={request.documentUrl}
                  alt="Document"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeaveRequestDetail() {
  return (
    <AdminAuthWrapper>
      <LeaveRequestDetailPage />
    </AdminAuthWrapper>
  );
}
