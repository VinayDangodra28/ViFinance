import React, { useState, useEffect } from 'react';

export default function CalendarView({ items, darkMode, onDeleteClick }) {
  const [viewType, setViewType] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recurringItems, setRecurringItems] = useState([]);

  // Process recurring items to show in calendar
  useEffect(() => {
    const processedItems = items.filter(item => item.recurring).flatMap(item => {
      const result = [];
      const startDate = new Date(item.date);
      const endDate = item.recurring.hasEndDate ? new Date(item.recurring.endDate) : new Date(2100, 0, 1);
      let currentDate = new Date(startDate);

      // Only process future occurrences
      while (currentDate <= endDate) {
        if (currentDate >= new Date()) {
          result.push({
            ...item,
            date: new Date(currentDate).toISOString(),
            isRecurring: true,
            originalDate: item.date
          });
        }

        if (item.recurring.type === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
          currentDate.setDate(item.recurring.dayOfMonth || startDate.getDate());
        } else {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          currentDate.setDate(item.recurring.dayOfMonth || startDate.getDate());
        }
      }

      return result;
    });

    setRecurringItems(processedItems);
  }, [items]);

  const groupedItems = [...items, ...recurringItems].reduce((acc, item) => {
    const date = new Date(item.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = {};
    }
    if (!acc[year][month][day]) {
      acc[year][month][day] = {
        expenses: 0,
        income: 0,
        items: []
      };
    }

    if (item.type === 'debit') {
      acc[year][month][day].expenses += item.amount;
    } else {
      acc[year][month][day].income += item.amount;
    }
    acc[year][month][day].items.push(item);

    return acc;
  }, {});

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  const navigateMonth = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const navigateYear = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(newDate.getFullYear() + delta);
    setSelectedDate(newDate);
  };

  // Get all transactions for the current month
  const getCurrentMonthTransactions = () => {
    const transactions = [];
    const monthData = groupedItems[currentYear]?.[currentMonth] || {};
    
    Object.entries(monthData).forEach(([day, data]) => {
      data.items.forEach(item => {
        transactions.push({
          ...item,
          day: parseInt(day)
        });
      });
    });

    return transactions.sort((a, b) => a.day - b.day);
  };

  // Helper function to safely get monthly totals
  const getMonthlyTotals = (year, month) => {
    const monthData = groupedItems[year]?.[month] || {};
    const totals = {
      income: 0,
      expenses: 0
    };

    Object.values(monthData).forEach(day => {
      totals.income += day.income || 0;
      totals.expenses += day.expenses || 0;
    });

    return totals;
  };

  return (
    <div className="space-y-6 w-full">
      {/* View Controls - grouped and spaced for proximity */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            onClick={() => setViewType('monthly')}
            className={`${viewType === 'monthly' ? `btn-primary${darkMode ? '-dark' : ''} ring-2 ring-blue-400 scale-105` : `btn-secondary${darkMode ? '-dark' : ''} opacity-80`} text-base sm:text-lg`}
            aria-pressed={viewType === 'monthly'}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewType('yearly')}
            className={`${viewType === 'yearly' ? `btn-primary${darkMode ? '-dark' : ''} ring-2 ring-blue-400 scale-105` : `btn-secondary${darkMode ? '-dark' : ''} opacity-80`} text-base sm:text-lg`}
            aria-pressed={viewType === 'yearly'}
          >
            Yearly
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => viewType === 'monthly' ? navigateMonth(-1) : navigateYear(-1)}
            className={`btn-secondary${darkMode ? '-dark' : ''} p-2`}
            aria-label="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {viewType === 'monthly'
              ? `${months[currentMonth]} ${currentYear}`
              : currentYear}
          </span>
          <button
            onClick={() => viewType === 'monthly' ? navigateMonth(1) : navigateYear(1)}
            className={`btn-secondary${darkMode ? '-dark' : ''} p-2`}
            aria-label="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {viewType === 'monthly' ? (
        <div className="space-y-6 w-full">
          {/* Monthly Summary - grouped and spaced for proximity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
            <div className={`$${
              darkMode 
                ? 'bg-gradient-to-r from-green-900/50 to-green-800/50' 
                : 'bg-gradient-to-r from-green-50 to-green-100'
            } backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/20 w-full`}>
              <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Income</p>
              <p className="text-xl sm:text-2xl font-bold text-green-500">
                ₹{Object.values(groupedItems[currentYear]?.[currentMonth] || {}).reduce((sum, day) => sum + (day.income || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className={`$${
              darkMode 
                ? 'bg-gradient-to-r from-red-900/50 to-red-800/50' 
                : 'bg-gradient-to-r from-red-50 to-red-100'
            } backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/20 w-full`}>
              <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Expenses</p>
              <p className="text-xl sm:text-2xl font-bold text-red-500">
                ₹{Object.values(groupedItems[currentYear]?.[currentMonth] || {}).reduce((sum, day) => sum + (day.expenses || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Transactions List - grouped and spaced for proximity */}
          <div className="space-y-3 sm:space-y-4 w-full">
            {getCurrentMonthTransactions().map(item => (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-4 rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-1 $${
                  darkMode
                    ? item.type === 'credit'
                      ? 'bg-gradient-to-r from-green-900/50 to-green-800/50'
                      : 'bg-gradient-to-r from-red-900/50 to-red-800/50'
                    : item.type === 'credit'
                    ? 'bg-gradient-to-r from-green-50 to-green-100'
                    : 'bg-gradient-to-r from-red-50 to-red-100'
                } backdrop-blur-sm border border-gray-200/20 w-full`}
              >
                <div className="flex items-center space-x-3 sm:space-x-4 w-full">
                  <div className={`p-2 rounded-lg ${
                    darkMode
                      ? item.type === 'credit' ? 'bg-green-800' : 'bg-red-800'
                      : item.type === 'credit' ? 'bg-green-200' : 'bg-red-200'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 20 20" fill="currentColor">
                      {item.type === 'credit' ? (
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold sm:font-bold text-base sm:text-xl truncate text-important ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.note}</p>
                    <span className={`text-secondary ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Due: {new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <p className={`text-important ${item.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>₹{item.amount.toLocaleString()}</p>
                  <button
                    onClick={() => onDeleteClick(item)}
                    className="p-2 rounded-full text-red-400 hover:text-red-500 bg-transparent hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Delete transaction"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {months.map((month, index) => {
            const { income, expenses } = getMonthlyTotals(currentYear, index);
            return (
              <div
                key={month}
                className={`$${
                  darkMode 
                    ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
                    : 'bg-gradient-to-r from-white/50 to-gray-50/50'
                } backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/20 w-full`}>
                <h4 className={`font-bold text-lg sm:text-xl mb-2 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{month}</h4>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Income</span>
                    <span className="font-semibold sm:font-bold text-green-500 text-base sm:text-lg">₹{income.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Expenses</span>
                    <span className="font-semibold sm:font-bold text-red-500 text-base sm:text-lg">₹{expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200/20">
                    <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Net</span>
                    <span className={`font-semibold sm:font-bold text-base sm:text-lg ${
                      income - expenses >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      ₹{(income - expenses).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}