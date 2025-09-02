import React from 'react';
import { journalEntries } from '../data/journalEntries';

const SimpleCalendar: React.FC = () => {
  return (
    <div className="p-4">
      
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Journal Entries ({journalEntries.length})</h2>
        
        <div className="space-y-4">
          {journalEntries.slice(0, 3).map((entry, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <img
                  src={entry.imgUrl}
                  alt="Journal entry"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{entry.date}</h3>
                  <p className="text-sm text-gray-600">Rating: ⭐ {entry.rating}</p>
                  <p className="text-sm text-gray-500">{entry.categories[0]}</p>
                </div>
              </div>
              <p className="mt-2 text-gray-700">{entry.description}</p>
            </div>
          ))}
        </div>
        
        
      </div>
    </div>
  );
};

export default SimpleCalendar;


