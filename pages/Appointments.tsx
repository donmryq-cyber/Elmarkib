import React, { useState, useEffect, useRef } from 'react';
import { useClinic } from '../context/ClinicContext';
import { ChevronRight, ChevronLeft, Clock, Plus } from 'lucide-react';

const Appointments: React.FC = () => {
  const { 
    getAppointmentsForDate, 
    getPatientById, 
    getServiceById,
    patients,
    services,
    addAppointment
  } = useClinic();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [error, setError] = useState('');
  const patientSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      // Focus the first form element for better accessibility
      setTimeout(() => patientSelectRef.current?.focus(), 100);
    }
  }, [isModalOpen]);

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const startOfWeek = new Date(currentDate);
  // Set start of the week to Saturday
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() - 1);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const resetForm = () => {
    setSelectedPatient('');
    setSelectedService('');
    setAppointmentDate('');
    setAppointmentTime('');
    setError('');
    setIsSubmitting(false);
  };

  const handleModalOpen = (date: Date = new Date()) => {
    const now = new Date();
    const appointmentDateToSet = date;

    const isToday = appointmentDateToSet.toDateString() === now.toDateString();
    const defaultTime = isToday ? now.toTimeString().slice(0, 5) : '09:00';

    const formattedDate = appointmentDateToSet.toISOString().split('T')[0];
    
    setAppointmentDate(formattedDate);
    setAppointmentTime(defaultTime);
    setError('');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!selectedPatient || !selectedService || !appointmentDate || !appointmentTime) {
      setError('يرجى ملء جميع الحقول لحجز الموعد.');
      return;
    }

    const selectedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    
    // Prevent booking in the past.
    if (selectedDateTime < new Date()) {
        setError('لا يمكن حجز موعد في وقت قد مضى.');
        return;
    }

    const dateTimeISO = selectedDateTime.toISOString();
    
    setIsSubmitting(true);
    // Use a short timeout to provide visual feedback, as state update is synchronous
    setTimeout(() => {
        addAppointment({
          patientId: selectedPatient,
          serviceId: selectedService,
          dateTime: dateTimeISO,
        });
        handleModalClose();
    }, 500);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">المواعيد</h1>
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className="flex-grow md:flex-grow-0 flex items-center justify-end gap-2 md:gap-4">
              <button onClick={handlePrevWeek} className="p-2 rounded-md hover:bg-gray-200 transition-colors"><ChevronRight className="h-5 w-5" /></button>
              <button onClick={handleToday} className="px-4 py-2 text-sm font-medium text-sky-700 bg-sky-100 rounded-md hover:bg-sky-200 transition-colors">
                اليوم
              </button>
              <span className="text-lg font-semibold text-gray-700 hidden md:inline">
                {currentDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={handleNextWeek} className="p-2 rounded-md hover:bg-gray-200 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
            </div>
            <button 
              onClick={() => handleModalOpen()}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors whitespace-nowrap">
              <Plus className="h-5 w-5 ml-2" />
              حجز موعد
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-r border-gray-200">
          {weekDays.map(day => (
            <div key={day.toISOString()} className="text-center font-semibold py-2 border-b border-l border-gray-200 bg-gray-50">
              <p>{day.toLocaleDateString('ar-EG', { weekday: 'long' })}</p>
              <p className="text-gray-500 font-normal">{day.getDate()}</p>
            </div>
          ))}
          {weekDays.map(day => {
            const appointments = getAppointmentsForDate(day);
            return (
              <div 
                key={day.toISOString()} 
                className="h-96 border-b border-l border-gray-200 p-2 space-y-2 overflow-y-auto transition-colors hover:bg-sky-50 cursor-pointer"
                onClick={() => handleModalOpen(day)}
              >
                {appointments.map(app => {
                  const patient = getPatientById(app.patientId);
                  const service = getServiceById(app.serviceId);
                  return (
                    <div key={app.id} className={`p-2 rounded-md text-sm ${service?.color || 'bg-gray-200 text-gray-800'}`}>
                      <p className="font-bold">{patient?.name}</p>
                      <p>{service?.name}</p>
                      <div className="flex items-center text-xs mt-1">
                        <Clock className="h-3 w-3 ml-1" />
                        {new Date(app.dateTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
          onClick={handleModalClose}
        >
          <div 
            className="bg-white rounded-lg p-8 w-full max-w-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">حجز موعد جديد</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">المريض</label>
                  <select
                    id="patient"
                    ref={patientSelectRef}
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="" disabled>اختر مريضاً...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">الخدمة</label>
                  <select
                    id="service"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="" disabled>اختر خدمة...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                      <input
                        type="date"
                        id="date"
                        value={appointmentDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">الوقت</label>
                      <input
                        type="time"
                        id="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                </div>
              </div>
              
              {error && <p className="text-sm text-red-600 mt-4 text-center">{error}</p>}

              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={handleModalClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">إلغاء</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'جاري الحجز...' : 'حجز الموعد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Appointments;
