import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { PropertyRecord } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';

function Results() {
  const [isProcessing, setIsProcessing] = useState(false);
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

  const processPendingRecords = async () => {
    if (isProcessing || !user) return;
    
    setIsProcessing(true);
    
    try {
      const { data: pendingRecords, error: fetchError } = await supabase
        .from('property_records')
        .select('*')
        .eq('status', 'pending');

      if (fetchError) throw fetchError;

      // Process records in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < (pendingRecords?.length || 0); i += batchSize) {
        const batch = pendingRecords?.slice(i, i + batchSize) || [];
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
      }
      
      toast.success('All records processed successfully');
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

  useEffect(() => {
    if (records.some(r => r.status === 'pending')) {
      processPendingRecords();
    }
  }, [records]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Processing Results</h1>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={processPendingRecords}
          disabled={isProcessing}
        >
          <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-6">
        {records.map((record) => (
          <div key={record.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{record.original_address}</h3>
                <p className="text-sm text-gray-500">
                  Processed: {new Date(record.date_processed).toLocaleString()}
                </p>
              </div>
              <span className={`
                badge
                ${record.status === 'processed' ? 'badge-teal' : ''}
                ${record.status === 'pending' ? 'badge-blue' : ''}
                ${record.status === 'error' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {record.status}
              </span>
            </div>
            
            {record.status === 'processed' && (
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                {JSON.stringify(record.processed_data, null, 2)}
              </pre>
            )}
            
            {record.status === 'error' && (
              <p className="text-red-600">{record.error_message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Results;