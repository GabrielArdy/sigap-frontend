'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import AuthWrapper from '@/components/AuthWrapper';
import 'react-calendar/dist/Calendar.css';
import { FaUserCircle, FaCalendarAlt, FaFileAlt, FaClipboardList, FaChevronLeft } from 'react-icons/fa';
import LeaveRequestService from '@/app/api/leave_request';

function LeaveRequestForm() {
  const router = useRouter();
  // State for form fields
  const [requestType, setRequestType] = useState('leave'); // 'leave' or 'sick'
  const [userData, setUserData] = useState({ userId: '', firstName: '', lastName: '' });
  const [selectedDates, setSelectedDates] = useState(null);
  const [reason, setReason] = useState('');
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRangeSelection, setIsRangeSelection] = useState(false);
  const [documentBase64, setDocumentBase64] = useState('');

  // Function to convert image to base64
  const processImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        try {
          resolve(reader.result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Load user data from localStorage on component mount
  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserData({
          userId: user.userId || '',
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        });
      } else {
        setError('User data not found. Please log in again.');
      }
    } catch (err) {
      setError('Error loading user data: ' + err.message);
      console.error('Error loading user data:', err);
    }
  }, []);

  // Handle date selection based on request type
  const handleDateChange = (value) => {
    setSelectedDates(value);
    setError('');
  };

  // Toggle between single day and range selection
  const toggleDateSelectionMode = () => {
    setSelectedDates(null); // Reset selected dates when changing mode
    setIsRangeSelection(!isRangeSelection);
  };

  // Set min and max date constraints based on request type
  const getDateConstraints = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requestType === 'leave') {
      // For leave requests: today and future dates
      return {
        minDate: today,
        maxDate: null
      };
    } else {
      // For sick confirmation: past dates and today
      const pastLimit = new Date();
      pastLimit.setDate(pastLimit.getDate() - 30); // Allow up to 30 days in the past
      return {
        minDate: pastLimit,
        maxDate: today
      };
    }
  };

  // Handle file input change with updated validation
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size exceeds 2MB limit');
        e.target.value = null;
        return;
      }
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        e.target.value = null;
        return;
      }
      
      try {
        // Convert file to base64 with data URI prefix
        const dataUri = await processImageToBase64(file);
        setDocumentBase64(dataUri);
        setSupportingDocument(file);
        setError('');
      } catch (err) {
        console.error('Error processing file:', err);
        setError('Failed to process image file');
        e.target.value = null;
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!selectedDates) {
      setError('Please select date(s)');
      return;
    }
    
    if (!reason.trim()) {
      setError('Please provide a reason');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Prepare request data - extract base64 part without the data URI prefix for backend
      const base64Only = documentBase64 ? documentBase64.split(',')[1] || '' : '';
      
      const requestData = {
        requestType: requestType,
        requesterId: userData.userId,
        requestedStartDate: Array.isArray(selectedDates) 
          ? selectedDates[0].toISOString() 
          : selectedDates.toISOString(),
        requestedEndDate: Array.isArray(selectedDates) 
          ? selectedDates[1].toISOString() 
          : selectedDates.toISOString(),
        description: reason,
        attachment: base64Only // Send only the base64 part to the backend
      };
      
      console.log('Submitting request with attachment:', documentBase64 ? 'Base64 image included' : 'No attachment');
      
      // Submit request to backend
      const response = await LeaveRequestService.createNewRequest(requestData);
      
      if (response.status === 'success' || response.success) {
        setSuccess('Leave request submitted successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/leave-request');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to submit request');
      }
    } catch (err) {
      setError('Error submitting request: ' + (err.message || 'Unknown error'));
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date display
  const formatDateRange = (dates) => {
    if (!dates) return '';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    if (Array.isArray(dates)) {
      const start = dates[0].toLocaleDateString('id-ID', options);
      const end = dates[1].toLocaleDateString('id-ID', options);
      return `${start} - ${end}`;
    } else {
      return dates.toLocaleDateString('id-ID', options);
    }
  };

  // Toggle between leave types
  const handleRequestTypeChange = (type) => {
    setRequestType(type);
    setSelectedDates(null); // Reset selected dates when changing type
  };

  const { minDate, maxDate } = getDateConstraints();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 text-slate-700">
      {/* Header with back button */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/home')}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Back to home"
          >
            <FaChevronLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold flex items-center">
            <FaClipboardList className="mr-2" /> Pengajuan Izin
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex flex-col gap-6 max-w-md">
        {/* Form Container */}
        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-sky-100">
          <form onSubmit={handleSubmit}>
            {/* Request Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Pengajuan</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRequestTypeChange('leave')}
                  className={`py-3 px-4 rounded-lg border text-center transition-all ${
                    requestType === 'leave'
                      ? 'bg-blue-50 border-blue-500 text-blue-600 font-medium'
                      : 'bg-white border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Pengajuan Izin
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestTypeChange('sick')}
                  className={`py-3 px-4 rounded-lg border text-center transition-all ${
                    requestType === 'sick'
                      ? 'bg-blue-50 border-blue-500 text-blue-600 font-medium'
                      : 'bg-white border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Konfirmasi Sakit
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {requestType === 'leave'
                  ? 'Pengajuan izin hanya untuk hari ini dan yang akan datang.'
                  : 'Konfirmasi sakit untuk hari ini dan tanggal yang telah lewat.'}
              </p>
            </div>
            
            {/* User Profile Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-lg">
                <div className="bg-sky-100 p-3 rounded-full">
                  <FaUserCircle className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Nama Guru</p>
                  <p className="font-medium">
                    {userData.firstName} {userData.lastName}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Date Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Tanggal {requestType === 'leave' ? 'Izin' : 'Sakit'}
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={toggleDateSelectionMode}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <span className="mr-1">{isRangeSelection ? 'Pilih Satu Tanggal' : 'Pilih Rentang Tanggal'}</span>
                    <FaCalendarAlt />
                  </button>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3 shadow-sm">
                {/* Calendar styling improvements */}
                <style jsx global>{`
                  .react-calendar {
                    width: 100%;
                    border: none;
                    font-family: inherit;
                  }
                  .react-calendar__navigation {
                    height: 44px;
                    margin-bottom: 0.5em;
                  }
                  .react-calendar__navigation button {
                    min-width: 44px;
                    background: none;
                    font-size: 1rem;
                    border-radius: 8px;
                  }
                  .react-calendar__navigation button:enabled:hover,
                  .react-calendar__navigation button:enabled:focus {
                    background-color: #e6f0fd;
                  }
                  .react-calendar__month-view__weekdays {
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: #64748b;
                    margin-bottom: 0.5em;
                  }
                  .react-calendar__month-view__weekdays__weekday {
                    padding: 0.5em;
                  }
                  .react-calendar__month-view__days__day {
                    border-radius: 8px;
                    height: 40px;
                  }
                  .react-calendar__tile {
                    padding: 0;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                  }
                  .react-calendar__tile:enabled:hover,
                  .react-calendar__tile:enabled:focus {
                    background-color: #e6f0fd;
                  }
                  .react-calendar__tile--now {
                    background-color: #fff7e6;
                  }
                  .react-calendar__tile--active,
                  .react-calendar__tile--rangeStart,
                  .react-calendar__tile--rangeEnd {
                    background-color: #3b82f6;
                    color: white;
                  }
                  .react-calendar__tile--rangeStart {
                    border-top-right-radius: 0;
                    border-bottom-right-radius: 0;
                  }
                  .react-calendar__tile--rangeEnd {
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                  }
                  .react-calendar__tile--rangeBetween {
                    background-color: #dbeafe;
                    color: #1e40af;
                    border-radius: 0;
                  }
                `}</style>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDates}
                  selectRange={isRangeSelection}
                  minDate={minDate}
                  maxDate={maxDate}
                  className="w-full rounded-lg border-0 shadow-none"
                  tileClassName="text-sm font-medium rounded-md hover:bg-blue-50"
                  prevLabel="‹"
                  nextLabel="›"
                  prev2Label={null}
                  next2Label={null}
                />
              </div>
              {selectedDates && (
                <div className="bg-blue-50 text-blue-700 rounded-lg px-4 py-3 text-sm flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  <span>{formatDateRange(selectedDates)}</span>
                </div>
              )}
            </div>
            
            {/* Reason */}
            <div className="mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">
                Alasan
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder={`Jelaskan alasan ${requestType === 'leave' ? 'izin' : 'sakit'} Anda...`}
                required
              />
            </div>
            
            {/* Supporting Document */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dokumen Pendukung (Opsional)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-50">
                <input
                  type="file"
                  id="document"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <label htmlFor="document" className="cursor-pointer">
                  <FaFileAlt className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                  <div className="text-sm font-medium text-blue-600">Klik untuk mengunggah</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Hanya gambar (Max. 2MB)
                  </p>
                </label>
                {supportingDocument && (
                  <div className="mt-3 text-sm bg-blue-50 rounded-lg p-2 text-blue-700">
                    {supportingDocument.name}
                    {documentBase64 && (
                      <div className="mt-2">
                        <img 
                          src={documentBase64} 
                          alt="Preview" 
                          className="max-h-32 mx-auto rounded" 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 text-center p-3 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Success message */}
            {success && (
              <div className="mb-4 text-center p-3 bg-green-50 text-green-600 rounded-lg">
                {success}
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                text-white py-4 px-6 rounded-xl shadow-md transition-all 
                flex items-center justify-center transform hover:translate-y-[-2px] 
                hover:shadow-lg active:translate-y-0 duration-300 
                ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent mr-3"></span>
                  <span>Memproses...</span>
                </>
              ) : (
                'Ajukan Permohonan'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function LeaveRequestPage() {
  return (
    <AuthWrapper>
      <LeaveRequestForm />
    </AuthWrapper>
  );
}