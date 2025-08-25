
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Patient, Service, Appointment, Visit } from '../types';

interface ClinicContextType {
  patients: Patient[];
  services: Service[];
  appointments: Appointment[];
  visits: Map<string, Visit[]>;
  getPatientById: (id: string) => Patient | undefined;
  getServiceById: (id: string) => Service | undefined;
  getAppointmentsForDate: (date: Date) => Appointment[];
  getVisitsForPatient: (patientId: string) => Visit[];
  addPatient: (patient: Omit<Patient, 'id' | 'registrationDate'>) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  addService: (service: Omit<Service, 'id'>) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

// Initial mock data
const initialPatients: Patient[] = [
  { id: '1', name: 'أحمد محمود', phone: '01012345678', dateOfBirth: '1985-05-15', gender: 'ذكر', registrationDate: '2023-01-10' },
  { id: '2', name: 'فاطمة الزهراء', phone: '01298765432', dateOfBirth: '1992-11-20', gender: 'أنثى', registrationDate: '2023-02-22' },
  { id: '3', name: 'خالد سعيد', phone: '01155566677', dateOfBirth: '1978-03-30', gender: 'ذكر', registrationDate: '2023-03-05' },
];

const initialServices: Service[] = [
  { id: 's1', name: 'استشارة', price: 300, color: 'bg-blue-200 text-blue-800' },
  { id: 's2', name: 'متابعة', price: 150, color: 'bg-green-200 text-green-800' },
  { id: 's3', name: 'فحص شامل', price: 500, color: 'bg-purple-200 text-purple-800' },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const initialAppointments: Appointment[] = [
  { id: 'a1', patientId: '1', serviceId: 's1', dateTime: new Date(today.setHours(10, 0, 0, 0)).toISOString() },
  { id: 'a2', patientId: '2', serviceId: 's2', dateTime: new Date(today.setHours(11, 30, 0, 0)).toISOString() },
  { id: 'a3', patientId: '3', serviceId: 's1', dateTime: new Date(today.setHours(14, 0, 0, 0)).toISOString() },
  { id: 'a4', patientId: '1', serviceId: 's2', dateTime: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString() },
];

const initialVisits = new Map<string, Visit[]>([
  ['1', [
    { id: 'v1', date: '2023-01-10', serviceId: 's1', notes: 'يعاني المريض من صداع نصفي. تم وصف العلاج اللازم.', attachments: [] },
    { id: 'v2', date: '2023-02-15', serviceId: 's2', notes: 'تحسن ملحوظ في الحالة. يستمر على نفس العلاج.', attachments: [] }
  ]],
  ['2', [
    { id: 'v3', date: '2023-02-22', serviceId: 's1', notes: 'شكوى من آلام في المفاصل. طلب تحاليل.', attachments: [] }
  ]]
]);


export const ClinicProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [visits, setVisits] = useState<Map<string, Visit[]>>(initialVisits);

  const getPatientById = (id: string) => patients.find(p => p.id === id);
  const getServiceById = (id: string) => services.find(s => s.id === id);
  const getVisitsForPatient = (patientId: string) => visits.get(patientId) || [];
  
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(app => {
        const appDate = new Date(app.dateTime);
        return appDate.getFullYear() === date.getFullYear() &&
               appDate.getMonth() === date.getMonth() &&
               appDate.getDate() === date.getDate();
    }).sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'registrationDate'>) => {
    const newPatient: Patient = {
        ...patientData,
        id: (patients.length + 1).toString(),
        registrationDate: new Date().toISOString().split('T')[0]
    };
    setPatients(prev => [...prev, newPatient]);
  };

  const addAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
        ...appointmentData,
        id: `a${appointments.length + 1}`
    };
    setAppointments(prev => [...prev, newAppointment]);
  };
  
  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
        ...serviceData,
        id: `s${services.length + 1}`,
        color: 'bg-yellow-200 text-yellow-800' // Default color for new services
    };
    setServices(prev => [...prev, newService]);
  }

  return (
    <ClinicContext.Provider value={{ patients, services, appointments, visits, getPatientById, getServiceById, getAppointmentsForDate, getVisitsForPatient, addPatient, addAppointment, addService }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
