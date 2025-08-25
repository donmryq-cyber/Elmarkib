
import React from 'react';
import { Users, Calendar, Stethoscope, Clock, Plus } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div className="mr-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { patients, getAppointmentsForDate, getPatientById, getServiceById } = useClinic();
  const today = new Date();
  const todaysAppointments = getAppointmentsForDate(today);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-600 mt-1">نظرة سريعة على نشاط العيادة اليوم.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<Calendar className="h-6 w-6 text-blue-600" />} title="مواعيد اليوم" value={todaysAppointments.length} color="bg-blue-100" />
        <StatCard icon={<Users className="h-6 w-6 text-green-600" />} title="إجمالي المرضى" value={patients.length} color="bg-green-100" />
        <StatCard icon={<Stethoscope className="h-6 w-6 text-purple-600" />} title="المرضى القادمون" value={todaysAppointments.slice(0, 5).length} color="bg-purple-100" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">المواعيد القادمة اليوم</h2>
          {todaysAppointments.length > 0 ? (
            <div className="space-y-4">
              {todaysAppointments.slice(0, 5).map(app => {
                const patient = getPatientById(app.patientId);
                const service = getServiceById(app.serviceId);
                return (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full object-cover mr-4" src={`https://i.pravatar.cc/150?u=${patient?.id}`} alt={patient?.name} />
                      <div>
                        <p className="font-semibold text-gray-800">{patient?.name}</p>
                        <p className={`text-sm font-medium px-2 py-0.5 rounded-full inline-block ${service?.color}`}>{service?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{new Date(app.dateTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">لا توجد مواعيد قادمة اليوم.</p>
          )}
        </div>

        <div className="lg:w-1/3 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
          <div className="space-y-4">
            <Link to="/patients" className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700 transition-colors">
              <Plus className="h-5 w-5 ml-2" />
              إضافة مريض جديد
            </Link>
            <Link to="/appointments" className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors">
              <Plus className="h-5 w-5 ml-2" />
              حجز موعد جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
