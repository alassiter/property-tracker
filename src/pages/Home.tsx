import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Database, BarChart } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Upload CSV',
      description: 'Upload your property data CSV file with addresses',
      icon: Upload,
      action: () => navigate('/upload'),
      color: 'bg-blue-900'
    },
    {
      title: 'View Database',
      description: 'Access your processed property records',
      icon: Database,
      action: () => navigate('/database'),
      color: 'bg-teal-600'
    },
    {
      title: 'View Results',
      description: 'Analyze your property data results',
      icon: BarChart,
      action: () => navigate('/results'),
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Property Data Processing
        </h1>
        <p className="text-xl text-gray-600">
          Upload your property data and get detailed information from PubRec
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="card hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-200"
            onClick={feature.action}
          >
            <div className={`${feature.color} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home