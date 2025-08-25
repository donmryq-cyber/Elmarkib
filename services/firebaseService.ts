import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { db, auth } from "../firebase";
import { Patient, Service, Appointment } from "../types";

// Authentication
export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Patients
export const addPatient = async (patient: Omit<Patient, 'id'>) => {
  const docRef = await addDoc(collection(db, "patients"), {
    ...patient,
    registrationDate: Timestamp.now()
  });
  return docRef.id;
};

export const getPatients = async (): Promise<Patient[]> => {
  const querySnapshot = await getDocs(collection(db, "patients"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    registrationDate: doc.data().registrationDate?.toDate?.()?.toISOString?.() || new Date().toISOString()
  } as Patient));
};

export const updatePatient = async (id: string, patient: Partial<Patient>) => {
  await updateDoc(doc(db, "patients", id), patient);
};

export const deletePatient = async (id: string) => {
  await deleteDoc(doc(db, "patients", id));
};

// Services
export const addService = async (service: Omit<Service, 'id'>) => {
  const docRef = await addDoc(collection(db, "services"), service);
  return docRef.id;
};

export const getServices = async (): Promise<Service[]> => {
  const querySnapshot = await getDocs(collection(db, "services"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Service));
};

export const updateService = async (id: string, service: Partial<Service>) => {
  await updateDoc(doc(db, "services", id), service);
};

export const deleteService = async (id: string) => {
  await deleteDoc(doc(db, "services", id));
};

// Appointments
export const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
  const docRef = await addDoc(collection(db, "appointments"), {
    ...appointment,
    dateTime: Timestamp.fromDate(new Date(appointment.dateTime))
  });
  return docRef.id;
};

export const getAppointments = async (): Promise<Appointment[]> => {
  const querySnapshot = await getDocs(collection(db, "appointments"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    dateTime: doc.data().dateTime?.toDate?.()?.toISOString?.() || new Date().toISOString()
  } as Appointment));
};

export const getAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const q = query(
    collection(db, "appointments"),
    where("dateTime", ">=", Timestamp.fromDate(startOfDay)),
    where("dateTime", "<=", Timestamp.fromDate(endOfDay))
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    dateTime: doc.data().dateTime?.toDate?.()?.toISOString?.() || new Date().toISOString()
  } as Appointment));
};

export const updateAppointmentStatus = async (id: string, completed: boolean) => {
  await updateDoc(doc(db, "appointments", id), { completed });
};