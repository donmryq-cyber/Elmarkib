
export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'ذكر' | 'أنثى';
  registrationDate: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
  dateTime: string;
  reason: string;
  completed?: boolean;
}
