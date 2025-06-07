import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage({ accounts, darkMode }) {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month'); // month, quarter, year
  const [selectedAccount, setSelectedAccount] = useState('all');

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, acc) => {
    const accountBalance = acc.transactions.reduce((accSum, trans) => {
      return accSum + (trans.type === 'credit' ? trans.amount : -trans.amount);
    }, 0);
    return sum + accountBalance;
  }, 0);

  // Calculate monthly income and expenses
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const data = {
      income: new Array(12).fill(0),
      expenses: new Array(12).fill(0),
    };

    accounts.forEach(account => {
      account.transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          if (transaction.type === 'credit') {
            data.income[month] += transaction.amount;
          } else {
            data.expenses[month] += transaction.amount;
          }
        }
      });
    });

    return { months, data };
  };

  // Calculate category-wise expenses
  const getCategoryData = () => {
    const categories = {};
    accounts.forEach(account => {
      account.transactions.forEach(transaction => {
        if (transaction.type === 'debit') {
          const category = transaction.category || 'Uncategorized';
          categories[category] = (categories[category] || 0) + transaction.amount;
        }
      });
    });

    return {
      labels: Object.keys(categories),
      data: Object.values(categories),
    };
  };

  // Calculate account-wise distribution
  const getAccountDistribution = () => {
    return {
      labels: accounts.map(acc => acc.name),
      data: accounts.map(acc => {
        const balance = acc.transactions.reduce((sum, trans) => {
          return sum + (trans.type === 'credit' ? trans.amount : -trans.amount);
        }, 0);
        return balance;
      }),
    };
  };

  // Prepare chart data
  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const accountData = getAccountDistribution();

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? 'white' : 'black',
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: darkMode ? 'white' : 'black',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: darkMode ? 'white' : 'black',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className={`px-4 py-2 rounded-xl transition-all duration-200 ${
            darkMode
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'bg-blue-500 text-white hover:bg-blue-400'
          }`}
        >
          Back to Accounts
        </button>
        <div className="flex flex-wrap gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-4 py-2 rounded-xl ${
              darkMode
                ? 'bg-gray-800 text-white border-gray-700'
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className={`px-4 py-2 rounded-xl ${
              darkMode
                ? 'bg-gray-800 text-white border-gray-700'
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
          >
            <option value="all">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50' 
            : 'bg-gradient-to-r from-blue-50 to-blue-100'
        } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
          <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Balance</p>
          <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ₹{Math.abs(totalBalance).toLocaleString()}
          </p>
        </div>
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-r from-green-900/50 to-green-800/50' 
            : 'bg-gradient-to-r from-green-50 to-green-100'
        } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
          <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Income</p>
          <p className="text-2xl font-bold text-green-500">
            ₹{monthlyData.data.income.reduce((a, b) => a + b, 0).toLocaleString()}
          </p>
        </div>
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-r from-red-900/50 to-red-800/50' 
            : 'bg-gradient-to-r from-red-50 to-red-100'
        } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
          <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Expenses</p>
          <p className="text-2xl font-bold text-red-500">
            ₹{monthlyData.data.expenses.reduce((a, b) => a + b, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Income vs Expenses */}
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
            : 'bg-gradient-to-r from-white/50 to-gray-50/50'
        } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Income vs Expenses
          </h3>
          <div className="h-80">
            <Line
              data={{
                labels: monthlyData.months,
                datasets: [
                  {
                    label: 'Income',
                    data: monthlyData.data.income,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                  },
                  {
                    label: 'Expenses',
                    data: monthlyData.data.expenses,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Category-wise Expenses */}
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
            : 'bg-gradient-to-r from-white/50 to-gray-50/50'
        } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Category-wise Expenses
          </h3>
          <div className="h-80">
            <Doughnut
              data={{
                labels: categoryData.labels,
                datasets: [
                  {
                    data: categoryData.data,
                    backgroundColor: [
                      'rgba(239, 68, 68, 0.8)',
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(139, 92, 246, 0.8)',
                    ],
                  },
                ],
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Account Distribution */}
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
            : 'bg-gradient-to-r from-white/50 to-gray-50/50'
        } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Account Distribution
          </h3>
          <div className="h-80">
            <Bar
              data={{
                labels: accountData.labels,
                datasets: [
                  {
                    label: 'Balance',
                    data: accountData.data,
                    backgroundColor: accountData.data.map(value => 
                      value >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                    ),
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Monthly Savings */}
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
            : 'bg-gradient-to-r from-white/50 to-gray-50/50'
        } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Savings
          </h3>
          <div className="h-80">
            <Line
              data={{
                labels: monthlyData.months,
                datasets: [
                  {
                    label: 'Savings',
                    data: monthlyData.data.income.map((income, index) => income - monthlyData.data.expenses[index]),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
            : 'bg-gradient-to-r from-white/50 to-gray-50/50'
        } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Key Insights
          </h3>
          <ul className="space-y-3">
            <li className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="text-green-500">•</span>
              <span>Highest spending month: {monthlyData.months[monthlyData.data.expenses.indexOf(Math.max(...monthlyData.data.expenses))]}</span>
            </li>
            <li className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="text-green-500">•</span>
              <span>Highest income month: {monthlyData.months[monthlyData.data.income.indexOf(Math.max(...monthlyData.data.income))]}</span>
            </li>
            <li className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="text-green-500">•</span>
              <span>Average monthly savings: ₹{(monthlyData.data.income.reduce((a, b) => a + b, 0) - monthlyData.data.expenses.reduce((a, b) => a + b, 0)) / 12}</span>
            </li>
          </ul>
        </div>

        <div className={`${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
            : 'bg-gradient-to-r from-white/50 to-gray-50/50'
        } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recommendations
          </h3>
          <ul className="space-y-3">
            <li className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="text-blue-500">•</span>
              <span>Consider setting up automatic savings for better financial planning</span>
            </li>
            <li className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="text-blue-500">•</span>
              <span>Review your recurring expenses to identify potential savings</span>
            </li>
            <li className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="text-blue-500">•</span>
              <span>Track your spending patterns to optimize your budget</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 