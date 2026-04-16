import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiClock, FiUser, FiPhone } from 'react-icons/fi';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { sampleTables } from '../utils/sampleData';
import { Table, Booking } from '../types';
import { format, addDays } from 'date-fns';

export const TableBooking: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  useEffect(() => {
    const savedTables = storage.get<Table[]>(STORAGE_KEYS.TABLES, []);
    if (savedTables.length === 0) {
      storage.set(STORAGE_KEYS.TABLES, sampleTables);
      setTables(sampleTables);
    } else {
      setTables(savedTables);
    }
    setBookings(storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS, []));
  }, []);

  const addTable = (number: number, seats: number) => {
    const newTable: Table = {
      id: Date.now().toString(),
      number,
      seats,
      status: 'available',
    };
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    storage.set(STORAGE_KEYS.TABLES, updatedTables);
  };

  const updateTableStatus = (tableId: string, status: Table['status']) => {
    const updatedTables = tables.map(t =>
      t.id === tableId ? { ...t, status } : t
    );
    setTables(updatedTables);
    storage.set(STORAGE_KEYS.TABLES, updatedTables);
  };

  const deleteTable = (tableId: string) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      const updatedTables = tables.filter(t => t.id !== tableId);
      setTables(updatedTables);
      storage.set(STORAGE_KEYS.TABLES, updatedTables);
    }
  };

  const createBooking = (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    storage.set(STORAGE_KEYS.BOOKINGS, updatedBookings);
    
    // Update table status
    updateTableStatus(booking.tableId, 'reserved');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Table Booking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage tables and reservations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => setShowTableModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <>
          {/* Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 transition-all cursor-pointer ${
                  table.status === 'available'
                    ? 'border-green-300 dark:border-green-700 hover:border-green-500'
                    : table.status === 'occupied'
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-yellow-300 dark:border-yellow-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🪑</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Table {table.number}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {table.seats} seats
                  </p>
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        table.status === 'available'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : table.status === 'occupied'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                      }`}
                    >
                      {table.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    {table.status === 'available' && (
                      <button
                        onClick={() => {
                          setSelectedTable(table);
                          setShowBookingModal(true);
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Reserve
                      </button>
                    )}
                    {table.status === 'occupied' && (
                      <button
                        onClick={() => updateTableStatus(table.id, 'available')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Free
                      </button>
                    )}
                    <button
                      onClick={() => deleteTable(table.id)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Calendar View */
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDays(new Date(), i);
              const dateStr = format(date, 'yyyy-MM-dd');
              const dayBookings = bookings.filter(b => b.date === dateStr);
              
              return (
                <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  {dayBookings.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No bookings</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dayBookings.map(booking => (
                        <div
                          key={booking.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Table {tables.find(t => t.id === booking.tableId)?.number}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {booking.customerName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {booking.customerPhone}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                🕐 {booking.timeSlot} • {booking.guests} guests
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                  : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showTableModal && (
        <TableModal
          onClose={() => setShowTableModal(false)}
          onAdd={addTable}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedTable && (
        <BookingModal
          table={selectedTable}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedTable(null);
          }}
          onCreate={createBooking}
        />
      )}
    </div>
  );
};

const TableModal: React.FC<{
  onClose: () => void;
  onAdd: (number: number, seats: number) => void;
}> = ({ onClose, onAdd }) => {
  const [number, setNumber] = useState('');
  const [seats, setSeats] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(parseInt(number), parseInt(seats));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Table</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Table Number
            </label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Seats
            </label>
            <input
              type="number"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookingModal: React.FC<{
  table: Table;
  onClose: () => void;
  onCreate: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
}> = ({ table, onClose, onCreate }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [timeSlot, setTimeSlot] = useState('12:00 PM');
  const [guests, setGuests] = useState(table.seats.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      tableId: table.id,
      customerName,
      customerPhone,
      date,
      timeSlot,
      guests: parseInt(guests),
    });
    onClose();
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM',
    '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
    '09:00 PM', '10:00 PM', '11:00 PM',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Book Table {table.number}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiUser className="inline mr-2" />
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiPhone className="inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiCalendar className="inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiClock className="inline mr-2" />
              Time Slot
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Guests
            </label>
            <input
              type="number"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              max={table.seats}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
