import React, { useEffect, useState } from 'react';
import { RefreshCw, Play, CheckSquare, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { PropertyRecord } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';

function Results() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [records, setRecords] = useState<PropertyRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
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
      setSelectedRecords(new Set()); // Clear selections when refreshing
      setCurrentPage(1); // Reset to first page when refreshing
    } catch (error) {
      toast.error('Error fetching records');
      console.error(error);
    }
  };

  const processPendingRecords = async () => {
    if (isProcessing || !user || selectedRecords.size === 0) return;
    
    setIsProcessing(true);
    
    try {
      const selectedPendingRecords = records.filter(
        record => record.status === 'pending' && selectedRecords.has(record.id)
      );

      if (selectedPendingRecords.length === 0) {
        toast.error('No pending records selected');
        setIsProcessing(false);
        return;
      }

      // Process records in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < selectedPendingRecords.length; i += batchSize) {
        const batch = selectedPendingRecords.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (record) => {
            try {
              // TODO: Replace with actual PubRec API call
              const response = await fetch('https://api.pubrec.com/property', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  // Add your API key here
                },
                body: JSON.stringify({ address: record.original_address })
              });

              const data = await response.json();
              
              const { error: updateError } = await supabase
                .from('property_records')
                .update({
                  processed_data: data,
                  status: 'processed',
                  date_processed: new Date().toISOString()
                })
                .eq('id', record.id);

              if (updateError) throw updateError;
            } catch (error) {
              const { error: errorUpdateError } = await supabase
                .from('property_records')
                .update({
                  status: 'error',
                  error_message: error instanceof Error ? error.message : 'Unknown error',
                  date_processed: new Date().toISOString()
                })
                .eq('id', record.id);

              if (errorUpdateError) console.error(errorUpdateError);
            }
          })
        );

        toast.success(`Processed ${Math.min((i + batchSize), selectedPendingRecords.length)} of ${selectedPendingRecords.length} records`);
      }
      
      toast.success('Selected records processed successfully');
      await fetchRecords();
    } catch (error) {
      toast.error('Error processing records');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  const pendingRecordsOnPage = currentRecords.filter(r => r.status === 'pending');
  const allPendingOnPageSelected = pendingRecordsOnPage.length > 0 && 
    pendingRecordsOnPage.every(r => selectedRecords.has(r.id));

  const toggleRecord = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const toggleAllOnPage = () => {
    const newSelected = new Set(selectedRecords);
    if (allPendingOnPageSelected) {
      pendingRecordsOnPage.forEach(r => newSelected.delete(r.id));
    } else {
      pendingRecordsOnPage.forEach(r => newSelected.add(r.id));
    }
    setSelectedRecords(newSelected);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Processing Results</h1>
          <p className="text-gray-600 mt-2">
            {records.filter(r => r.status === 'pending').length} records pending processing
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className="btn-primary flex items-center gap-2"
            onClick={processPendingRecords}
            disabled={isProcessing || selectedRecords.size === 0}
          >
            <Play className="w-5 h-5" />
            {isProcessing ? 'Processing...' : `Process Selected (${selectedRecords.size})`}
          </button>
          <button
            className="btn-outline flex items-center gap-2"
            onClick={fetchRecords}
            disabled={isProcessing}
          >
            <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-4">
            {pendingRecordsOnPage.length > 0 && (
              <button
                onClick={toggleAllOnPage}
                className="btn-outline flex items-center gap-2 text-sm"
              >
                {allPendingOnPageSelected ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {allPendingOnPageSelected ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="input text-sm py-1 px-2"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {record.status === 'pending' && (
                      <button
                        onClick={() => toggleRecord(record.id)}
                        className="mr-3"
                      >
                        {selectedRecords.has(record.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {record.original_address}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    badge text-xs
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {record.status === 'processed' && record.processed_data && (
                    <details className="text-gray-600">
                      <summary className="cursor-pointer hover:text-blue-600">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(record.processed_data, null, 2)}
                      </pre>
                    </details>
                  )}
                  {record.status === 'error' && (
                    <span className="text-red-600">{record.error_message}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t">
          <div className="flex-1 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{indexOfFirstRecord + 1}</span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(indexOfLastRecord, records.length)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{records.length}</span>
              {' '}results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-outline py-1 px-2 text-sm disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-outline py-1 px-2 text-sm disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;