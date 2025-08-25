
import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Plus, Edit, Trash } from 'lucide-react';
import type { Service } from '../types';

const Services: React.FC = () => {
  const { services, addService } = useClinic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(0);

  const handleAddService = () => {
    if (newServiceName && newServicePrice > 0) {
      addService({ name: newServiceName, price: newServicePrice, color: '' });
      setNewServiceName('');
      setNewServicePrice(0);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">الخدمات والتسعير</h1>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors">
          <Plus className="h-5 w-5 ml-2" />
          خدمة جديدة
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">اسم الخدمة</th>
              <th scope="col" className="px-6 py-3">السعر (ج.م)</th>
              <th scope="col" className="px-6 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {service.name}
                </th>
                <td className="px-6 py-4">{service.price.toFixed(2)}</td>
                <td className="px-6 py-4 flex items-center gap-4">
                  <button className="text-blue-600 hover:text-blue-800"><Edit className="h-4 w-4"/></button>
                  <button className="text-red-600 hover:text-red-800"><Trash className="h-4 w-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">إضافة خدمة جديدة</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">اسم الخدمة</label>
                <input
                  type="text"
                  id="serviceName"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                <input
                  type="number"
                  id="servicePrice"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">إلغاء</button>
              <button onClick={handleAddService} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700">إضافة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
