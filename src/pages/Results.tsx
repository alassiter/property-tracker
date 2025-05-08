import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, PropertyRecord } from '../db/database';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

function Results() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const records = useLiveQuery(
    () => db.properties.orderBy('dateProcessed').reverse().toArray()
  );

  const processPendingRecords = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const pendingRecords = await db.properties
      .where('status')
      .equals('pending')
      .toArray();

    try {
      // Process records in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < pendingRecords.length; i += batchSize) {
        const batch = pendingRecords.slice(i, i + batchSize);
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
                body: JSON.stringify({ address: record.originalAddress })
              });

              const data = await response.json();
              
              await db.properties.update(record.id!, {
                processedData: data,
                status: 'processed'
              });
            } catch (error) {
              await db.properties.update(record.id!, {
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          })
        );
      }
      
      toast.success('All records processed successfully');
    } catch (error) {
      toast.error('Error processing records');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (records?.some(r => r.status === 'pending')) {
      processPendingRecords();
    }
  }, [records]);

  if (!records) {
    return <div className="text-center py-12">Loading...</div>;
  }

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
        {records.map((record: PropertyRecord) => (
          <div key={record.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{record.originalAddress}</h3>
                <p className="text-sm text-gray-500">
                  Processed: {new Date(record.dateProcessed).toLocaleString()}
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
                {JSON.stringify(record.processedData, null, 2)}
              </pre>
            )}
            
            {record.status === 'error' && (
              <p className="text-red-600">{record.errorMessage}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Results