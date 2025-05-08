import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { PropertyRecord } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';

function Database() {
  const [records, setRecords] = useState<PropertyRecord[]>([]);
  const { user } = useApp();

  const fetchRecords = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('property_records')
        .select('*')
        .order('date_processed', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      toast.error('Error fetching records');
      console.error(error);
    }
  };

  const clearDatabase = async () => {
    if (!user) return;

    if (window.confirm('Are you sure you want to clear all records?')) {
      try {
        const { error } = await supabase
          .from('property_records')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast.success('Database cleared successfully');
        await fetchRecords();
      } catch (error) {
        toast.error('Error clearing database');
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

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
                  {record.original_address}
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
                  {new Date(record.date_processed).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Database;