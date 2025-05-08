import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon } from 'lucide-react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db } from '../db/database';

function Upload() {
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      
      if (typeof text !== 'string') return;

      Papa.parse(text, {
        header: true,
        complete: async (results) => {
          const data = results.data as Record<string, string>[];
          
          // Find the address column
          const columns = Object.keys(data[0]);
          const addressColumn = columns.find(col => 
            col.toLowerCase().includes('address')
          );

          if (!addressColumn) {
            toast.error('No address column found in CSV');
            return;
          }

          // Store addresses in database
          try {
            await db.properties.bulkAdd(
              data.map(row => ({
                originalAddress: row[addressColumn],
                dateProcessed: new Date(),
                status: 'pending',
                processedData: null
              }))
            );
            
            toast.success('CSV data uploaded successfully');
            navigate('/results');
          } catch (error) {
            toast.error('Error storing data');
            console.error(error);
          }
        },
        error: (error) => {
          toast.error('Error parsing CSV file');
          console.error(error);
        }
      });
    };
    
    reader.readAsText(file);
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Upload Property Data</h1>
        <p className="text-gray-600">
          Upload a CSV file containing property addresses to process
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12
          flex flex-col items-center justify-center
          cursor-pointer transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-lg text-center text-gray-600">
          {isDragActive
            ? 'Drop the CSV file here'
            : 'Drag and drop a CSV file here, or click to select'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Only CSV files are accepted
        </p>
      </div>
    </div>
  );
}

export default Upload