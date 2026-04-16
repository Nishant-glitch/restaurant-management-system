import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiDownload } from 'react-icons/fi';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { Table } from '../types';

export const QROrdering: React.FC = () => {
  const [tables] = useState<Table[]>(storage.get<Table[]>(STORAGE_KEYS.TABLES, []));

  const downloadQR = (tableNumber: number) => {
    const canvas = document.getElementById(`qr-${tableNumber}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `table-${tableNumber}-qr.png`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Ordering System</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Generate QR codes for contactless ordering</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map(table => {
          const orderUrl = `${window.location.origin}/order/${table.id}`;
          
          return (
            <div key={table.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Table {table.number}
                </h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCodeSVG
                    id={`qr-${table.number}`}
                    value={orderUrl}
                    size={180}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 mb-4">
                  Scan to order
                </p>
                <button
                  onClick={() => downloadQR(table.number)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Download QR</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
          📱 How it works
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <li>• Print and place QR codes on each table</li>
          <li>• Customers scan QR to open digital menu</li>
          <li>• Orders are sent directly to kitchen display</li>
          <li>• No app installation required!</li>
        </ul>
      </div>
    </div>
  );
};
