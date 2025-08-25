
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Users, DollarSign, LogIn, ChevronLeft, PlusCircle, Search, FileText, Settings, Home, BarChart2, UserPlus, ArrowUpRight, Phone, MapPin, CheckCircle, MoreVertical, LogOut, Info, X, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { addPatient, getPatients, updatePatient, deletePatient, addService, getServices, updateService, deleteService, addAppointment, getAppointments, updateAppointmentStatus } from './services/firebaseService';
import { Patient, Service, Appointment } from './types';

// --- Initial Data Setup ---
const initializeDefaultData = async () => {
  try {
    const [existingServices, existingPatients, existingAppointments] = await Promise.all([
      getServices(),
      getPatients(),
      getAppointments()
    ]);
    
    if (existingServices.length === 0) {
      const defaultServices = [
        { name: 'كشف جديد', price: 300 },
        { name: 'استشارة', price: 200 },
        { name: 'متابعة', price: 150 },
        { name: 'قياس ضغط الدم', price: 50 },
        { name: 'جلسة علاج طبيعي', price: 400 },
      ];
      for (const service of defaultServices) {
        await addService(service);
      }
    }
    
    if (existingPatients.length === 0) {
      const dummyPatients = [
        { name: 'أحمد محمود', phone: '01012345678', age: 45, gender: 'ذكر' as const },
        { name: 'فاطمة الزهراء', phone: '01298765432', age: 28, gender: 'أنثى' as const },
        { name: 'محمد علي', phone: '01155566777', age: 62, gender: 'ذكر' as const },
      ];
      for (const patient of dummyPatients) {
        await addPatient(patient);
      }
    }
    
    if (existingAppointments.length === 0) {
      const services = await getServices();
      const patients = await getPatients();
      if (services.length > 0 && patients.length > 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const dummyAppointments = [
          {
            patientId: patients[0].id,
            patientName: patients[0].name,
            serviceId: services[0].id,
            serviceName: services[0].name,
            dateTime: new Date(today.setHours(10, 0)).toISOString(),
            reason: services[0].name
          },
          {
            patientId: patients[1].id,
            patientName: patients[1].name,
            serviceId: services[1].id,
            serviceName: services[1].name,
            dateTime: new Date(tomorrow.setHours(14, 30)).toISOString(),
            reason: services[1].name
          }
        ];
        for (const appointment of dummyAppointments) {
          await addAppointment(appointment);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};




// --- Reusable Components ---
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseClasses = 'px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 border border-slate-300',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-400 border border-red-200',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

interface InputProps {
    id: string;
    label?: string;
    type?: string;
    placeholder?: string;
    icon?: React.ReactElement<{ className?: string }>;
    value: string | number;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const Input: React.FC<InputProps> = ({ id, label, type = 'text', placeholder, icon, value, onChange }) => (
    <div>
        {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 text-right mb-1.5">{label}</label>}
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                {icon && React.cloneElement(icon, { className: "h-5 w-5 text-slate-400" })}
            </div>
            <input
                type={type}
                id={id}
                name={id}
                className="block w-full rounded-lg border border-slate-300 bg-white pr-11 pl-3 py-2.5 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-colors sm:text-sm text-right"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    </div>
);

interface SelectProps {
    id: string;
    label?: string;
    value: string | number | readonly string[] | undefined;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ id, label, value, onChange, children }) => (
    <div>
        {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 text-right mb-1.5">{label}</label>}
        <select 
            id={id} 
            value={value} 
            onChange={onChange} 
            className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm text-right transition-colors"
        >
            {children}
        </select>
    </div>
);


// --- Shared Appointment Scheduler Component ---
const AppointmentScheduler = ({ selectedDate, setSelectedDate, selectedTime, setSelectedTime, appointments }) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const bookedSlots = Array.isArray(appointments)
        ? appointments
            .filter((a) => a.dateTime.split('T')[0] === dateKey)
            .map((a) => new Date(a.dateTime).toTimeString().slice(0, 5))
        : [];
    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];

    const renderCalendar = () => {
        const today = new Date();
        const month = selectedDate.getMonth();
        const year = selectedDate.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <button type="button" onClick={() => setSelectedDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600"/></button>
                    <span className="font-bold text-slate-800 text-lg">{new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(selectedDate)}</span>
                    <button type="button" onClick={() => setSelectedDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><ChevronRight className="w-5 h-5 text-slate-600"/></button>
                </div>
                <div className="grid grid-cols-7 text-center text-sm font-semibold text-slate-500 mb-2">
                    {days.map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 text-center">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                    {Array.from({ length: daysInMonth }).map((_, day) => {
                        const date = day + 1;
                        const currentDateObj = new Date(year, month, date);
                        const isSelected = date === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
                        const isToday = date === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        return (
                            <button type="button" key={date} onClick={() => setSelectedDate(currentDateObj)}
                                className={`p-2 rounded-full w-10 h-10 mx-auto my-1 transition-all duration-200 font-semibold ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-700'} ${isToday && !isSelected ? 'ring-2 ring-indigo-400' : ''} hover:bg-indigo-100 hover:text-indigo-700`}>
                                {date}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="!p-4">
                <h3 className="block text-sm font-medium text-slate-700 text-right mb-2">اختر التاريخ</h3>
                {renderCalendar()}
            </Card>
            <Card className="!p-4">
                <h3 className="block text-sm font-medium text-slate-700 text-right mb-2">اختر الوقت</h3>
                <Input id="customTime" type="time" value={selectedTime || ''} onChange={(e) => setSelectedTime(e.target.value)} />
                <div className="grid grid-cols-3 gap-2 mt-2 max-h-52 overflow-y-auto p-1">
                    {timeSlots.map(time => {
                        const isBooked = bookedSlots.includes(time);
                        const isSelected = selectedTime === time;
                        return (
                            <button type="button" key={time} disabled={isBooked} onClick={() => setSelectedTime(time)}
                                className={`p-2 rounded-md text-sm transition-colors font-semibold ${isBooked ? 'bg-slate-200 text-slate-400 line-through cursor-not-allowed' : ''} ${isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700'}`}>
                                {new Date(`1970-01-01T${time}:00`).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true })}
                            </button>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};


// --- Screen Components ---

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-xl rounded-2xl border border-slate-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-700">Elmarkeb Clinic</h1>
          <p className="mt-2 text-slate-600">أهلاً بك! الرجاء تسجيل الدخول للمتابعة.</p>
        </div>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <Input id="username" label="اسم المستخدم" placeholder="ادخل اسم المستخدم" icon={<User />} value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input id="password" label="كلمة المرور" type="password" placeholder="ادخل كلمة المرور" icon={<LogIn />} value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" variant="primary" className="w-full !py-3">
            تسجيل الدخول
          </Button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ onNavigate, onAddAppointment, patients, appointments, onAppointmentUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(apt => {
        const isToday = apt.dateTime.split('T')[0] === todayKey;
        if (!isToday) return false;
        if (!searchTerm) return true;
        const patient = patients.find(p => p.id === apt.patientId);
        return apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               (patient && patient.phone.includes(searchTerm));
    });
    
    const StatCard = ({ title, value, icon, colorName }) => {
        const colors = {
            indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', iconBg: 'bg-indigo-100' },
            emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100' },
            sky: { text: 'text-sky-600', bg: 'bg-sky-50', iconBg: 'bg-sky-100' },
            amber: { text: 'text-amber-600', bg: 'bg-amber-50', iconBg: 'bg-amber-100' },
        }
        const selectedColor = colors[colorName] || colors.indigo;
        
        return (
            <Card className="relative overflow-hidden">
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`text-sm font-bold ${selectedColor.text}`}>{title}</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${selectedColor.iconBg}`}>
                        {React.cloneElement(icon, { className: `w-6 h-6 ${selectedColor.text}` })}
                    </div>
                </div>
            </Card>
        );
    }
    
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">أهلاً بعودتك يا دكتور!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="مواعيد اليوم" value={todaysAppointments.length} icon={<Calendar />} colorName="indigo" />
                <StatCard title="إجمالي المرضى" value={patients.length} icon={<Users />} colorName="emerald" />
                <StatCard title="مرضى جدد (الأسبوع)" value="3" icon={<UserPlus />} colorName="sky" />
                <StatCard title="نسبة الحضور" value="95%" icon={<CheckCircle />} colorName="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">مواعيد اليوم القادمة</h2>
                            <div className="w-64">
                                <Input 
                                    id="searchTodayAppointment"
                                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                                    icon={<Search />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {todaysAppointments.length > 0 ? todaysAppointments
                                .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                                .map((apt, index) => {
                                const aptTime = new Date(apt.dateTime).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true });
                                return (
                                <div key={index} className={`flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200/80 hover:border-indigo-500 hover:bg-white transition-all duration-200 relative ${apt.completed ? 'opacity-50 line-through' : ''}`}>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="bg-indigo-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                            {index + 1}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                                            checked={apt.completed || false}
                                            onChange={async (e) => {
                                                try {
                                                    await updateAppointmentStatus(apt.id, e.target.checked);
                                                    onAppointmentUpdate();
                                                } catch (error) {
                                                    console.error('Error updating appointment:', error);
                                                }
                                            }}
                                        />
                                        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full flex items-center justify-center w-12 h-12">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-slate-700">{apt.patientName}</span>
                                            <p className="text-sm text-slate-500">{aptTime} - {apt.reason}</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => onNavigate('patientProfile', patients.find(p => p.id === apt.patientId))} variant="secondary" className="px-3 !py-1.5 text-sm">عرض الملف</Button>
                                </div>
                            );
                            }) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 mx-auto text-slate-300"/>
                                    <p className="mt-4 text-slate-500">لا توجد مواعيد لهذا اليوم.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-slate-800">إجراءات سريعة</h2>
                        <div className="flex flex-col space-y-3">
                            <Button onClick={onAddAppointment} variant="primary" className="w-full"><PlusCircle className="w-5 h-5"/><span>حجز موعد جديد</span></Button>
                            <Button onClick={() => onNavigate('addPatient')} variant="secondary" className="w-full"><UserPlus className="w-5 h-5"/><span>إضافة مريض جديد</span></Button>
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-slate-800">آخر نشاط للمرضى</h2>
                        <div className="space-y-4">
                            {patients.slice(0, 3).map(p => (
                                <div key={p.id} className="flex items-center gap-3">
                                    <div className="bg-slate-100 p-2 rounded-full"><User className="h-5 w-5 text-slate-600" /></div>
                                    <p className="text-sm font-medium text-slate-700">{p.name}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const AppointmentsPage = ({ onAddAppointment, appointments, onAppointmentUpdate, patients }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const getWeekDays = (date) => {
        const start = new Date(date);
        const dayOfWeek = start.getDay(); 
        const diff = dayOfWeek === 6 ? 0 : dayOfWeek + 1; // Start week on Saturday
        start.setDate(start.getDate() - diff);
        
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(start);
            day.setDate(day.getDate() + i);
            return day;
        });
    };

    const [week, setWeek] = useState(getWeekDays(new Date()));

    const goToNextWeek = () => setWeek(getWeekDays(new Date(week[6].setDate(week[6].getDate() + 1))));
    const goToPrevWeek = () => setWeek(getWeekDays(new Date(week[0].setDate(week[0].getDate() - 7))));
    const goToToday = () => setWeek(getWeekDays(new Date()));
    
    const filteredAppointments = appointments.filter(apt => {
        if (!searchTerm) return true;
        const patient = patients.find(p => p.id === apt.patientId);
        return apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               (patient && patient.phone.includes(searchTerm));
    });
    
    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">جدول المواعيد</h1>
                <div className="flex items-center gap-2">
                     <Button onClick={goToPrevWeek} variant="secondary" className="p-2.5"><ChevronLeft className="h-5 w-5" /></Button>
                     <Button onClick={goToToday} variant="secondary">هذا الأسبوع</Button>
                     <Button onClick={goToNextWeek} variant="secondary" className="p-2.5"><ChevronRight className="h-5 w-5" /></Button>
                     <div className="w-px h-6 bg-slate-300 mx-2"></div>
                     <Button onClick={onAddAppointment} variant="primary">
                         <PlusCircle className="h-5 w-5" />
                         <span>إضافة موعد</span>
                     </Button>
                </div>
            </div>
            <div className="mb-4 max-w-md">
                <Input 
                    id="searchAppointment"
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    icon={<Search />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                {week.map(day => (
                    <div key={day.toISOString()} className="p-3 text-center font-bold text-slate-700 border-b border-slate-200 border-l border-l-slate-200 first:border-l-0">
                        <span className="text-sm text-slate-500">{day.toLocaleDateString('ar-EG', { weekday: 'short' })}</span>
                        <p className="text-2xl mt-1">{day.getDate()}</p>
                    </div>
                ))}
                
                {week.map((day) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dateKey = day.toISOString().split('T')[0];
                    const appointmentsForDay = filteredAppointments.filter(apt => 
                        apt.dateTime.split('T')[0] === dateKey
                    );

                    return (
                        <div key={day.toISOString()} className={`p-2 space-y-2 relative border-l border-l-slate-200 first:border-l-0 ${isToday ? 'bg-indigo-50' : 'bg-white'} transition-colors`}>
                            <div className="h-full overflow-y-auto">
                                {appointmentsForDay
                                    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                                    .map((apt, idx) => {
                                    const aptTime = new Date(apt.dateTime).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true });
                                    return (
                                    <div key={idx} className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-800 rounded-md p-2 cursor-pointer hover:bg-indigo-200 transition-colors shadow-sm relative">
                                        <div className="absolute top-1 left-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <input 
                                                type="checkbox" 
                                                className="mt-1 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500" 
                                                checked={apt.completed || false}
                                                onChange={async (e) => {
                                                    try {
                                                        await updateAppointmentStatus(apt.id, e.target.checked);
                                                        onAppointmentUpdate();
                                                    } catch (error) {
                                                        console.error('Error updating appointment:', error);
                                                    }
                                                }}
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold text-sm truncate">{apt.patientName}</p>
                                                <p className="text-xs truncate">{apt.reason}</p>
                                                <p className="text-indigo-600 font-semibold text-xs mt-1">{aptTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PatientManagementPage = ({ onNavigate, patients, onPatientUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPatient, setEditingPatient] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', age: '', gender: 'ذكر' });
    
    const filteredPatients = patients.filter(p => 
        p.name.includes(searchTerm) || p.phone.includes(searchTerm) || p.id.includes(searchTerm)
    );
    
    const handleEdit = (patient) => {
        setEditingPatient(patient.id);
        setEditForm({ name: patient.name, phone: patient.phone, age: patient.age.toString(), gender: patient.gender });
    };
    
    const handleSave = async (patientId) => {
        try {
            await updatePatient(patientId, { ...editForm, age: parseInt(editForm.age) });
            setEditingPatient(null);
            onPatientUpdate();
        } catch (error) {
            console.error('Error updating patient:', error);
        }
    };
    
    const handleDelete = async (patientId) => {
        if (confirm('هل أنت متأكد من حذف هذا المريض؟')) {
            try {
                await deletePatient(patientId);
                onPatientUpdate();
            } catch (error) {
                console.error('Error deleting patient:', error);
            }
        }
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">إدارة المرضى</h1>
            <Card>
                <div className="mb-4">
                    <Input 
                        id="searchPatient"
                        label="ابحث عن مريض"
                        placeholder="ابحث بالاسم, رقم الهاتف, أو الكود..."
                        icon={<Search />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="text-slate-600">
                            <tr>
                                <th className="p-4 text-sm font-semibold tracking-wide bg-slate-100 rounded-r-lg">كود المريض</th>
                                <th className="p-4 text-sm font-semibold tracking-wide bg-slate-100">الاسم بالكامل</th>
                                <th className="p-4 text-sm font-semibold tracking-wide bg-slate-100">رقم الهاتف</th>
                                <th className="p-4 text-sm font-semibold tracking-wide bg-slate-100">آخر زيارة</th>
                                <th className="p-4 text-sm font-semibold tracking-wide bg-slate-100 rounded-l-lg">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPatients.map(patient => (
                                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4 text-sm text-slate-500">{patient.id}</td>
                                    <td className="px-5 py-4 text-sm text-slate-800 font-bold">
                                        {editingPatient === patient.id ? (
                                            <input 
                                                value={editForm.name} 
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                                                className="w-full p-1 border rounded text-right"
                                            />
                                        ) : patient.name}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-700">
                                        {editingPatient === patient.id ? (
                                            <input 
                                                value={editForm.phone} 
                                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                                                className="w-full p-1 border rounded text-right"
                                            />
                                        ) : patient.phone}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-700">{new Date(patient.registrationDate).toLocaleDateString('ar-EG')}</td>
                                    <td className="px-5 py-4 flex gap-2">
                                        {editingPatient === patient.id ? (
                                            <>
                                                <Button onClick={() => handleSave(patient.id)} variant="success" className="!px-3 !py-1.5 text-sm">حفظ</Button>
                                                <Button onClick={() => setEditingPatient(null)} variant="secondary" className="!px-3 !py-1.5 text-sm">إلغاء</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button onClick={() => onNavigate('patientProfile', patient)} variant="secondary" className="!px-3 !py-1.5 text-sm">عرض</Button>
                                                <Button onClick={() => handleEdit(patient)} variant="secondary" className="!px-3 !py-1.5 text-sm">تعديل</Button>
                                                <Button onClick={() => handleDelete(patient.id)} variant="danger" className="!px-3 !py-1.5 text-sm">حذف</Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const PatientProfilePage = ({ patient, onNavigate, appointments, services }) => {
    if (!patient) {
        return (
            <div className="p-8">
                <div className="text-center">
                    <p className="text-slate-600">لم يتم العثور على بيانات المريض</p>
                    <Button onClick={() => onNavigate('patients')} variant="primary" className="mt-4">
                        العودة لقائمة المرضى
                    </Button>
                </div>
            </div>
        );
    }
    
    const displayPatient = patient;
    const patientAppointments = appointments
        .filter(apt => apt.patientId === patient.id)
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{displayPatient.name}</h1>
                    <p className="text-slate-500">كود المريض: {displayPatient.id}</p>
                </div>
                <Button onClick={() => onNavigate('patients')} variant="secondary">
                    <ChevronLeft className="h-4 w-4 transform -scale-x-100" />
                    <span>العودة لقائمة المرضى</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-slate-800">المعلومات الشخصية</h2>
                        <div className="space-y-4 text-right text-slate-700">
                            <p><strong className="ml-2 font-semibold text-slate-500">العمر:</strong>{displayPatient.age}</p>
                            <p><strong className="ml-2 font-semibold text-slate-500">الجنس:</strong>{displayPatient.gender}</p>
                            <p><strong className="ml-2 font-semibold text-slate-500">رقم الهاتف:</strong>{displayPatient.phone}</p>
                        </div>
                    </Card>
                     <Card>
                        <h2 className="text-xl font-bold mb-4 text-slate-800">الملفات المرفقة</h2>
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2"/>
                            <p className="text-slate-500 text-sm">لا توجد ملفات مرفقة.</p>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-slate-800">سجل الزيارات</h2>
                        {patientAppointments.length > 0 ? (
                            <div className="relative border-r-2 border-indigo-200 mr-3">
                                {patientAppointments.map((appointment, index) => {
                                    const service = services.find(s => s.id === appointment.serviceId);
                                    const visitDate = new Date(appointment.dateTime);
                                    const isPast = visitDate < new Date();
                                    
                                    return (
                                        <div key={index} className="mb-8 mr-6 relative pl-6">
                                            <div className={`absolute w-5 h-5 rounded-full -right-[11px] top-1 border-4 border-white ${
                                                isPast ? 'bg-emerald-600' : 'bg-indigo-600'
                                            }`}></div>
                                            <p className={`text-sm font-semibold mb-1 ${
                                                isPast ? 'text-emerald-600' : 'text-indigo-600'
                                            }`}>
                                                {visitDate.toLocaleDateString('ar-EG')} - {visitDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <h3 className="font-bold text-lg text-slate-800">{appointment.reason}</h3>
                                            <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                                                <p className="text-sm text-slate-600">
                                                    <strong className="ml-1 font-semibold text-slate-500">الخدمة:</strong>
                                                    {service?.name || appointment.serviceName}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    <strong className="ml-1 font-semibold text-slate-500">التكلفة:</strong>
                                                    {service?.price || 0} ج.م
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    <strong className="ml-1 font-semibold text-slate-500">الحالة:</strong>
                                                    {isPast ? 'تمت الزيارة' : 'موعد قادم'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4"/>
                                <p className="text-slate-500">لا توجد زيارات مسجلة بعد.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

const ServicesPage = ({ services, onServiceUpdate, onServiceAdd }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newService, setNewService] = useState({ name: '', price: '' });
    
    const handleAddService = async () => {
        if (newService.name && newService.price) {
            try {
                await addService({ name: newService.name, price: parseFloat(newService.price) });
                setNewService({ name: '', price: '' });
                setShowAddForm(false);
                onServiceAdd();
            } catch (error) {
                console.error('Error adding service:', error);
            }
        }
    };
    
    const handleDeleteService = async (serviceId: string) => {
        if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
            try {
                await deleteService(serviceId);
                onServiceAdd();
            } catch (error) {
                console.error('Error deleting service:', error);
            }
        }
    };
    
    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">الخدمات والأسعار</h1>
                <Button onClick={() => setShowAddForm(!showAddForm)} variant="primary">
                    <PlusCircle className="h-5 w-5" />
                    <span>إضافة خدمة جديدة</span>
                </Button>
            </div>
            {showAddForm && (
                <Card>
                    <h2 className="text-xl font-bold mb-4 text-slate-800">إضافة خدمة جديدة</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Input 
                            id="serviceName" 
                            label="اسم الخدمة" 
                            value={newService.name} 
                            onChange={(e) => setNewService({...newService, name: e.target.value})} 
                        />
                        <Input 
                            id="servicePrice" 
                            label="السعر (ج.م)" 
                            type="number" 
                            value={newService.price} 
                            onChange={(e) => setNewService({...newService, price: e.target.value})} 
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleAddService} variant="success">إضافة</Button>
                            <Button onClick={() => setShowAddForm(false)} variant="secondary">إلغاء</Button>
                        </div>
                    </div>
                </Card>
            )}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="text-slate-600">
                             <tr>
                                <th className="p-4 text-sm font-semibold tracking-wide bg-slate-100 rounded-r-lg">#</th>
                                <th className="p-4 text-sm font-semibold tracking-wide bg-slate-100">اسم الخدمة</th>
                                <th className="p-4 text-sm font-semibold tracking-wide bg-slate-100">السعر (ج.م)</th>
                                <th className="p-4 text-sm font-semibold tracking-wide bg-slate-100 rounded-l-lg">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {services.map((service, index) => (
                                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4 text-sm text-slate-500">{index + 1}</td>
                                    <td className="px-5 py-4 text-sm text-slate-800 font-bold">{service.name}</td>
                                    <td className="px-5 py-4 text-sm text-slate-700">{service.price.toFixed(2)}</td>
                                    <td className="px-5 py-4 flex gap-2">
                                        <Button onClick={() => onServiceUpdate(service)} variant="secondary" className="!px-3 !py-1.5 text-sm">تعديل</Button>
                                        <Button onClick={() => handleDeleteService(service.id)} variant="danger" className="!px-3 !py-1.5 text-sm">حذف</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const FinancialsPage = ({ appointments, services }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dailyRevenue, setDailyRevenue] = useState(0);
    const [weeklyRevenue, setWeeklyRevenue] = useState(0);
    const [monthlyRevenue, setMonthlyRevenue] = useState(0);

    const calculateRevenue = (appointmentsList, startDate, endDate) => {
        return appointmentsList
            .filter(apt => {
                const aptDate = new Date(apt.dateTime);
                return aptDate >= startDate && aptDate <= endDate;
            })
            .reduce((total, apt) => {
                const service = services.find(s => s.id === apt.serviceId);
                return total + (service?.price || 0);
            }, 0);
    };

    useEffect(() => {
        if (appointments.length > 0 && services.length > 0) {
            // Daily revenue
            const dayStart = new Date(selectedDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(selectedDate);
            dayEnd.setHours(23, 59, 59, 999);
            setDailyRevenue(calculateRevenue(appointments, dayStart, dayEnd));

            // Weekly revenue
            const weekStart = new Date(selectedDate);
            weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            setWeeklyRevenue(calculateRevenue(appointments, weekStart, weekEnd));

            // Monthly revenue
            const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
            setMonthlyRevenue(calculateRevenue(appointments, monthStart, monthEnd));
        }
    }, [selectedDate, appointments, services]);

    const RevenueCard = ({ title, amount, period, icon }) => (
        <Card>
            <div className="flex items-start justify-between">
                <div className="text-right">
                    <p className="text-slate-500 font-semibold">{title}</p>
                    <p className="text-3xl font-bold my-1 text-emerald-600">{amount.toLocaleString()} ج.م</p>
                    {period && <p className="text-sm text-slate-400">{period}</p>}
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                    {icon}
                </div>
            </div>
        </Card>
    );

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">التقارير المالية</h1>
            
            <Card className="max-w-xs">
                <Input 
                    id="financialDate"
                    label="اختر يوماً لعرض الإيرادات"
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RevenueCard 
                    title="إيرادات اليوم المحدد" 
                    amount={dailyRevenue} 
                    period={selectedDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    icon={<TrendingUp className="w-6 h-6"/>}
                />
                <RevenueCard 
                    title="إجمالي إيرادات الأسبوع" 
                    amount={weeklyRevenue} 
                    period="هذا الأسبوع" 
                    icon={<BarChart2 className="w-6 h-6"/>} 
                />
                <RevenueCard 
                    title="إجمالي إيرادات الشهر" 
                    amount={monthlyRevenue} 
                    period="هذا الشهر" 
                    icon={<DollarSign className="w-6 h-6"/>} 
                />
            </div>
        </div>
    );
};

const AddPatientPage = ({ services, onNavigate, onPatientAdd, appointments }) => {
    const [formData, setFormData] = useState({
        patientName: '', patientPhone: '', patientAge: '', gender: 'ذكر',
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date().toTimeString().slice(0, 5));
    const [selectedService, setSelectedService] = useState(null);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleServiceChange = (e) => {
        const serviceId = e.target.value;
        const service = services.find(s => s.id === serviceId);
        setSelectedService(service);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const patientData = {
                name: formData.patientName,
                phone: formData.patientPhone,
                age: parseInt(formData.patientAge),
                gender: formData.gender as 'ذكر' | 'أنثى',
                registrationDate: new Date().toISOString()
            };
            
            const patientId = await addPatient(patientData);
            
            if (selectedService && selectedDate && selectedTime) {
                const appointmentDateTime = new Date(selectedDate);
                const [hours, minutes] = selectedTime.split(':');
                appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
                
                await addAppointment({
                    patientId,
                    patientName: formData.patientName,
                    serviceId: selectedService.id,
                    serviceName: selectedService.name,
                    dateTime: appointmentDateTime.toISOString(),
                    reason: selectedService.name
                });
            }
            
            onPatientAdd();
            onNavigate('dashboard');
        } catch (error) {
            console.error('Error adding patient:', error);
        }
    };

    const isReadyForSummary = formData.patientName && selectedDate && selectedTime && selectedService;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">إضافة مريض جديد</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-slate-200">
                    <fieldset className="pt-8 first:pt-0">
                        <legend className="text-xl font-bold mb-4 text-slate-700">1. معلومات المريض</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <Input id="patientName" label="الاسم بالكامل" placeholder="ادخل اسم المريض" icon={<User />} value={formData.patientName} onChange={handleChange} />
                            <Input id="patientPhone" label="رقم الهاتف" placeholder="ادخل رقم الهاتف" icon={<Phone />} value={formData.patientPhone} onChange={handleChange} />
                            <Input id="patientAge" label="العمر" type="number" placeholder="ادخل العمر" value={formData.patientAge} onChange={handleChange} />
                            <Select id="gender" label="الجنس" value={formData.gender} onChange={handleChange}>
                                <option>ذكر</option>
                                <option>أنثى</option>
                            </Select>
                        </div>
                    </fieldset>

                    <fieldset className="pt-8 first:pt-0">
                        <legend className="text-xl font-bold mb-4 text-slate-700">2. حجز الموعد الأول (اختياري)</legend>
                        <AppointmentScheduler 
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            selectedTime={selectedTime}
                            setSelectedTime={setSelectedTime}
                            appointments={appointments}
                        />
                         <div className="mt-4">
                            <Select id="appointmentType" label="نوع الكشف" value={selectedService?.id || ''} onChange={handleServiceChange}>
                                <option value="">اختر نوع الكشف...</option>
                                {services.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name} - {service.price} ج.م
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </fieldset>
                    
                    {isReadyForSummary && (
                        <div className="!mt-6 bg-indigo-50 border-r-4 border-indigo-500 p-4 rounded-lg space-y-2 text-right">
                            <h3 className="font-bold text-indigo-800">ملخص الحجز</h3>
                            <p className="text-sm text-slate-700"><strong className="font-semibold">المريض:</strong> {formData.patientName}</p>
                            <p className="text-sm text-slate-700"><strong className="font-semibold">التاريخ:</strong> {selectedDate.toLocaleDateString('ar-EG')}</p>
                            <p className="text-sm text-slate-700"><strong className="font-semibold">الوقت:</strong> {new Date(`1970-01-01T${selectedTime}:00`).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true })}</p>
                            <p className="text-sm text-slate-700"><strong className="font-semibold">الخدمة:</strong> {selectedService.name}</p>
                            <p className="text-lg font-bold text-indigo-700"><strong className="font-semibold text-sm text-slate-700">التكلفة:</strong> {selectedService.price} ج.م</p>
                        </div>
                    )}


                    <div className="flex justify-start gap-4 pt-8">
                        <Button type="submit" variant="success" disabled={!formData.patientName || !formData.patientPhone}>حفظ المريض</Button>
                        <Button onClick={() => onNavigate('dashboard')} variant="secondary">إلغاء</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const AppointmentModal = ({ isOpen, onClose, services, patients, onAppointmentAdd, appointments }) => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date().toTimeString().slice(0, 5));
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        if (searchTerm) {
            setSearchResults(
                patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, patients]);

    const resetState = () => {
        setSelectedPatient(null);
        setSearchTerm('');
        setSearchResults([]);
        setSelectedDate(new Date());
        setSelectedTime(new Date().toTimeString().slice(0, 5));
        setSelectedService(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };
    
    const handleConfirm = async () => {
        if (!isReadyForSummary) return;
        
        try {
            const appointmentDateTime = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':');
            appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
            
            await addAppointment({
                patientId: selectedPatient.id,
                patientName: selectedPatient.name,
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                dateTime: appointmentDateTime.toISOString(),
                reason: selectedService.name
            });
            
            onAppointmentAdd();
            handleClose();
        } catch (error) {
            console.error('Error adding appointment:', error);
        }
    };
    
    if (!isOpen) return null;

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setSearchTerm(patient.name);
        setSearchResults([]);
    };
    
    const handleServiceChange = (e) => {
        const serviceId = e.target.value;
        const service = services.find(s => s.id === serviceId);
        setSelectedService(service);
    };

    const isReadyForSummary = selectedPatient && selectedDate && selectedTime && selectedService;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
                <div className="relative p-6 max-h-[90vh] overflow-y-auto">
                    <button onClick={handleClose} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors z-10">
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">حجز موعد جديد</h2>
                    <div className="space-y-6">
                        <fieldset>
                            <legend className="block text-sm font-medium text-slate-700 text-right mb-2">1. اختر المريض</legend>
                            {selectedPatient ? (
                                <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-6 w-6 text-emerald-600"/>
                                        <span className="font-bold text-lg text-emerald-800">{selectedPatient.name}</span>
                                    </div>
                                    <button onClick={() => { setSelectedPatient(null); setSearchTerm(''); }} className="text-sm text-indigo-600 hover:underline">تغيير</button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Input id="patientSearch" placeholder="ابحث بالاسم أو رقم الهاتف..." icon={<Search />} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    {searchResults.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                            {searchResults.map(p => (
                                                <li key={p.id} onClick={() => handlePatientSelect(p)} className="p-3 hover:bg-indigo-50 cursor-pointer text-right">
                                                    <p className="font-semibold">{p.name}</p>
                                                    <p className="text-sm text-slate-500">{p.phone}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </fieldset>

                        <fieldset>
                             <legend className="block text-sm font-medium text-slate-700 text-right mb-2">2. اختر التاريخ والوقت</legend>
                            <AppointmentScheduler 
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate}
                                selectedTime={selectedTime}
                                setSelectedTime={setSelectedTime}
                                appointments={appointments}
                            />
                        </fieldset>

                        <fieldset>
                             <legend className="block text-sm font-medium text-slate-700 text-right mb-2">3. اختر الخدمة</legend>
                            <Select id="appointmentTypeModal" value={selectedService?.id || ''} onChange={handleServiceChange}>
                                <option value="">اختر نوع الكشف...</option>
                                {services.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name} - {service.price} ج.م
                                    </option>
                                ))}
                            </Select>
                        </fieldset>
                        
                        {isReadyForSummary && (
                            <div className="bg-indigo-50 border-r-4 border-indigo-500 p-4 rounded-lg space-y-2 text-right">
                                <h3 className="font-bold text-indigo-800 flex items-center justify-end gap-2"><Info className="w-5 h-5"/><span>ملخص الحجز</span></h3>
                                <p className="text-sm text-slate-700"><strong className="font-semibold">المريض:</strong> {selectedPatient.name}</p>
                                <p className="text-sm text-slate-700"><strong className="font-semibold">التاريخ:</strong> {selectedDate.toLocaleDateString('ar-EG')}</p>
                                <p className="text-sm text-slate-700"><strong className="font-semibold">الوقت:</strong> {new Date(`1970-01-01T${selectedTime}:00`).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true })}</p>
                                <p className="text-sm text-slate-700"><strong className="font-semibold">الخدمة:</strong> {selectedService.name}</p>
                                <p className="text-lg font-bold text-indigo-700"><strong className="font-semibold text-sm text-slate-700">التكلفة:</strong> {selectedService.price} ج.م</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-slate-50 p-4 flex justify-start gap-3 rounded-b-xl border-t border-slate-200">
                    <Button onClick={handleConfirm} variant="success" disabled={!isReadyForSummary}>
                        تأكيد الحجز
                    </Button>
                    <Button onClick={handleClose} variant="secondary">إلغاء</Button>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [pageData, setPageData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.documentElement.dir = 'rtl';
        loadData();
    }, []);
    
    const loadData = async () => {
        try {
            setLoading(true);
            await initializeDefaultData();
            const [patientsData, servicesData, appointmentsData] = await Promise.all([
                getPatients(),
                getServices(),
                getAppointments()
            ]);
            setPatients(patientsData);
            setServices(servicesData);
            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleServiceUpdate = async (service: Service) => {
        console.log('Edit service:', service);
    };
    
    const handleDeleteService = async (serviceId: string) => {
        try {
            await deleteService(serviceId);
            setServices(services.filter(s => s.id !== serviceId));
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
    };

    const handleNavigate = (page, data = null) => {
        setCurrentPage(page);
        setPageData(data);
    };

    const renderPage = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">جاري التحميل...</p>
                    </div>
                </div>
            );
        }
        
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard onNavigate={handleNavigate} onAddAppointment={() => setIsModalOpen(true)} patients={patients} appointments={appointments} onAppointmentUpdate={loadData} />;
            case 'appointments':
                return <AppointmentsPage onAddAppointment={() => setIsModalOpen(true)} appointments={appointments} onAppointmentUpdate={loadData} patients={patients} />;
            case 'patients':
                return <PatientManagementPage onNavigate={handleNavigate} patients={patients} onPatientUpdate={loadData} />;
            case 'patientProfile':
                return <PatientProfilePage patient={pageData} onNavigate={handleNavigate} appointments={appointments} services={services} />;
            case 'services':
                return <ServicesPage services={services} onServiceUpdate={handleServiceUpdate} onServiceAdd={loadData} />;
            case 'financials':
                return <FinancialsPage appointments={appointments} services={services} />;
            case 'addPatient':
                return <AddPatientPage services={services} onNavigate={handleNavigate} onPatientAdd={loadData} appointments={appointments} />;
            default:
                return <Dashboard onNavigate={handleNavigate} onAddAppointment={() => setIsModalOpen(true)} patients={patients} appointments={appointments} />;
        }
    };

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const NavLink = ({ icon, label, page }) => {
        const isActive = currentPage === page;
        return (
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigate(page); }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors relative ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
                {icon}
                <span>{label}</span>
                 {isActive && <div className="absolute left-0 h-6 w-1 bg-indigo-300 rounded-r-full"></div>}
            </a>
        );
    }

    return (
        <div className="flex h-screen bg-slate-100">
            <AppointmentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                services={services}
                patients={patients}
                onAppointmentAdd={loadData}
                appointments={appointments}
            />
            <aside className="w-64 bg-slate-800 text-white flex flex-col p-4">
                <div className="text-center my-4">
                    <h1 className="text-2xl font-bold text-white">Elmarkeb Clinic</h1>
                </div>
                <nav className="flex-grow space-y-2 mt-8">
                    <NavLink icon={<Home className="w-5 h-5"/>} label="الرئيسية" page="dashboard" />
                    <NavLink icon={<Calendar className="w-5 h-5"/>} label="المواعيد" page="appointments" />
                    <NavLink icon={<Users className="w-5 h-5"/>} label="المرضى" page="patients" />
                    <NavLink icon={<DollarSign className="w-5 h-5"/>} label="الخدمات والأسعار" page="services" />
                    <NavLink icon={<BarChart2 className="w-5 h-5"/>} label="التقارير المالية" page="financials" />
                </nav>
                <div className="mt-auto border-t border-slate-700 pt-4">
                    <div className="flex items-center gap-3 p-2">
                        <img src="https://placehold.co/40x40/E2E8F0/475569?text=Dr" alt="User" className="rounded-full" />
                        <div>
                            <p className="font-semibold text-white">د. أحمد المركب</p>
                            <p className="text-xs text-slate-400">طبيب عام</p>
                        </div>
                        <button className="mr-auto text-slate-400 hover:text-white"><LogOut className="w-5 h-5"/></button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;
