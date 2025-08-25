
import React from 'react';
import { useParams } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext';
import { User, Phone, Cake, VenetianMask, Calendar, Upload, FileText } from 'lucide-react';

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPatientById, getVisitsForPatient, getServiceById } = useClinic();

  if (!id) {
    return <div className="text-center p-8">معرف المريض غير موجود.</div>;
  }

  const patient = getPatientById(id);
  const visits = getVisitsForPatient(id);

  if (!patient) {
    return <div className="text-center p-8">لم يتم العثور على المريض.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-start gap-6">
        <img
          className="h-24 w-24 rounded-full object-cover border-4 border-sky-200"
          src={`https://i.pravatar.cc/150?u=${patient.id}`}
          alt={patient.name}
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{patient.name}</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-gray-600">
            <div className="flex items-center"><Phone className="h-4 w-4 ml-2 text-sky-500" /> {patient.phone}</div>
            <div className="flex items-center"><Cake className="h-4 w-4 ml-2 text-sky-500" /> {patient.dateOfBirth}</div>
            <div className="flex items-center"><VenetianMask className="h-4 w-4 ml-2 text-sky-500" /> {patient.gender}</div>
            <div className="flex items-center"><Calendar className="h-4 w-4 ml-2 text-sky-500" /> مسجل منذ {patient.registrationDate}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">سجل الزيارات</h2>
        <div className="space-y-6">
          {visits.length > 0 ? visits.map(visit => {
            const service = getServiceById(visit.serviceId);
            return (
              <div key={visit.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${service?.color}`}>{service?.name}</span>
                    <span className="text-sm text-gray-500">{visit.date}</span>
                </div>
                <div className="mt-4">
                    <h3 className="font-semibold text-gray-700 mb-2">ملاحظات الزيارة:</h3>
                    <textarea 
                        readOnly 
                        className="w-full p-2 bg-gray-50 border rounded-md text-gray-600" 
                        rows={3}
                        defaultValue={visit.notes}
                    />
                </div>
              </div>
            );
          }) : <p className="text-gray-500">لا يوجد سجل زيارات لهذا المريض.</p>}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">الملفات المرفقة</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">اسحب وأفلت الملفات هنا أو انقر للتصفح</p>
            <input type="file" className="hidden" />
            <button className="mt-4 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors">
                رفع ملف
            </button>
        </div>
        <div className="mt-6 space-y-3">
            {/* Dummy file list */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                    <FileText className="h-5 w-5 text-sky-500 ml-3"/>
                    <span className="text-sm font-medium text-gray-700">نتائج_تحليل_الدم.pdf</span>
                </div>
                <span className="text-xs text-gray-500">1.2 MB</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
