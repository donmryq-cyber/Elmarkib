
import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Patients: React.FC = () => {
  const { patients } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">قائمة المرضى</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="ابحث بالاسم أو رقم الهاتف..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors whitespace-nowrap">
            <Plus className="h-5 w-5 ml-2" />
            مريض جديد
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">الاسم</th>
              <th scope="col" className="px-6 py-3">رقم الهاتف</th>
              <th scope="col" className="px-6 py-3">تاريخ الميلاد</th>
              <th scope="col" className="px-6 py-3">الجنس</th>
              <th scope="col" className="px-6 py-3">تاريخ التسجيل</th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {patient.name}
                </th>
                <td className="px-6 py-4">{patient.phone}</td>
                <td className="px-6 py-4">{patient.dateOfBirth}</td>
                <td className="px-6 py-4">{patient.gender}</td>
                <td className="px-6 py-4">{patient.registrationDate}</td>
                <td className="px-6 py-4 text-left">
                  <Link to={`/patients/${patient.id}`} className="font-medium text-sky-600 hover:underline">
                    عرض الملف
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {filteredPatients.length === 0 && (
          <p className="text-center text-gray-500 py-10">لم يتم العثور على مرضى.</p>
       )}
    </div>
  );
};

export default Patients;
