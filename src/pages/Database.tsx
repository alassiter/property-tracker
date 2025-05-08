import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function Database() {
  const records = useLiveQuery(
    () => db.properties.orderBy('dateProcessed').reverse().toArray()
  );

  const clearDatabase = async () => {
    if (window.confirm('Are you sure you want to clear all records?')) {
      try {
        await db.properties.clear();
        toast.success('Database cleared successfully');
      } catch (error) {
        toast.error('Error clearing database');
        console.error(error);
      }
    }
  };

  if (!records) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Database Records</h1>
        <button
          className="btn flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
          onClick={clearDatabase}
        >
          <Trash2 className="w-5 h-5" />
          Clear Database
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Processed
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.originalAddress}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    badge
                    ${record.status === 'processed' ? 'badge-teal' : ''}
                    ${record.status === 'pending' ? 'badge-blue' : ''}
                    ${record.status === 'error' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(record.dateProcessed).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Database