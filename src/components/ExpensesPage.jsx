import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';

export default function ExpensesPage({ accounts, updateExpenses, deleteExpense, addTransaction, darkMode }) {
  const navigate = useNavigate();
  
  // State for one-time expenses/income
  const [expenseData, setExpenseData] = useState({
    title: '',
    amount: '',
    dueDate: '',
    type: 'expense',
    frequency: 'one-time',
    accountId: '',
    status: 'pending'
  });

  // State for recurring items
  const [recurringData, setRecurringData] = useState({
    amount: '',
    note: '',
    type: 'debit',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    recurringType: 'monthly',
    hasEndDate: false,
    endDate: '',
    autoProcess: false,
    autoDebitCredit: false,
    dayOfMonth: new Date().getDate()
  });

  // State for modals and selections
  const [showAccountSelect, setShowAccountSelect] = useState(false);
  const [selectedAccountForPayment, setSelectedAccountForPayment] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'recurring'

  // Calculate balances
  const totalBalance = accounts.reduce((sum, acc) => {
    const accountBalance = acc.transactions.reduce((accSum, trans) => {
      return accSum + (trans.type === 'credit' ? trans.amount : -trans.amount);
    }, 0);
    return sum + accountBalance;
  }, 0);

  const thisMonthExpenses = accounts.reduce((sum, acc) => {
    const monthlyExpenses = acc.expenses?.filter(exp => {
      const dueDate = new Date(exp.dueDate);
      const now = new Date();
      return dueDate.getMonth() === now.getMonth() && 
             dueDate.getFullYear() === now.getFullYear() &&
             exp.status === 'pending' &&
             exp.type === 'expense';
    }).reduce((expSum, exp) => expSum + exp.amount, 0) || 0;
    return sum + monthlyExpenses;
  }, 0);

  const balanceAfterExpenses = totalBalance - thisMonthExpenses;

  // Function to check and process future recurring transactions
  const checkAndProcessRecurringTransactions = () => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day

    accounts.forEach(account => {
      account.expenses?.filter(exp => exp.recurring && exp.recurring.autoDebitCredit).forEach(expense => {
        const startDate = new Date(expense.date);
        const endDate = expense.recurring.hasEndDate ? new Date(expense.recurring.endDate) : null;
        
        // Calculate next occurrence date
        let nextDate = new Date(startDate);
        while (nextDate < currentDate) {
          if (expense.recurring.type === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
          } else {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
          }
          nextDate.setDate(expense.recurring.dayOfMonth || startDate.getDate());
        }

        // If next occurrence is today or in the past (but after start date), process it
        if (nextDate <= currentDate && (!endDate || nextDate <= endDate)) {
          // Add transaction
          addTransaction(expense.accountId, {
            id: Date.now() + Math.random(),
            amount: expense.amount,
            note: `${expense.note} (Auto-processed for ${nextDate.toLocaleDateString()})`,
            type: expense.type,
            date: nextDate.toISOString(),
            isRecurring: true
          });

          // Update the expense's start date to the next occurrence
          const updatedExpense = {
            ...expense,
            date: nextDate.toISOString()
          };
          updateExpenses(expense.accountId, updatedExpense);
        }
      });
    });
  };

  // Check for recurring transactions when component mounts and every day
  useEffect(() => {
    checkAndProcessRecurringTransactions();
    
    // Set up daily check
    const interval = setInterval(() => {
      checkAndProcessRecurringTransactions();
    }, 24 * 60 * 60 * 1000); // Check every 24 hours

    return () => clearInterval(interval);
  }, [accounts]);

  // Handle one-time expense/income submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expenseData.title.trim() || !expenseData.amount || !expenseData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const expense = {
      id: Date.now(),
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      status: 'pending'
    };

    updateExpenses(expense.accountId || 'unassigned', expense);
    toast.success(`${expenseData.type === 'expense' ? 'Expense' : 'Income'} added successfully!`);
    setExpenseData({
      title: '',
      amount: '',
      dueDate: '',
      type: 'expense',
      frequency: 'one-time',
      accountId: '',
      status: 'pending'
    });
  };

  // Handle recurring item submission
  const handleRecurringSubmit = (e) => {
    e.preventDefault();

    if (!recurringData.amount || !recurringData.note || !recurringData.accountId || !recurringData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (recurringData.hasEndDate && !recurringData.endDate) {
      toast.error('Please specify an end date');
      return;
    }

    const expense = {
      id: Date.now(),
      amount: parseFloat(recurringData.amount),
      note: recurringData.note,
      type: recurringData.type,
      date: new Date(recurringData.date).toISOString(),
      accountId: parseInt(recurringData.accountId),
      recurring: {
        type: recurringData.recurringType,
        hasEndDate: recurringData.hasEndDate,
        endDate: recurringData.hasEndDate ? new Date(recurringData.endDate).toISOString() : null,
        autoProcess: recurringData.autoProcess,
        autoDebitCredit: recurringData.autoDebitCredit,
        dayOfMonth: recurringData.dayOfMonth
      }
    };

    updateExpenses(recurringData.accountId, expense);
    
    // Reset form
    setRecurringData({
      amount: '',
      note: '',
      type: 'debit',
      accountId: '',
      date: new Date().toISOString().split('T')[0],
      recurringType: 'monthly',
      hasEndDate: false,
      endDate: '',
      autoProcess: false,
      autoDebitCredit: false,
      dayOfMonth: new Date().getDate()
    });

    toast.success('Recurring item added successfully!');
  };

  // Handle payment processing
  const handlePaid = (expense) => {
    setSelectedExpense(expense);
    if (!expense.accountId) {
      setShowAccountSelect(true);
      return;
    }
    processPayment(expense, expense.accountId);
  };

  const processPayment = (expense, accountId) => {
    addTransaction(accountId, {
      type: expense.type === 'goal' ? 'credit' : 'debit',
      amount: expense.amount,
      note: `${expense.type === 'goal' ? 'Achieved' : 'Paid'}: ${expense.title}`,
      date: new Date().toISOString()
    });

    const updatedExpense = {
      ...expense,
      status: 'paid',
      accountId: accountId
    };

    updateExpenses(accountId, updatedExpense);
    setShowAccountSelect(false);
    setSelectedAccountForPayment('');
    setSelectedExpense(null);
    toast.success(expense.type === 'goal' ? 'Goal marked as achieved!' : 'Expense marked as paid!');
  };

  const handleConfirmAccount = () => {
    if (!selectedAccountForPayment || !selectedExpense) return;
    processPayment(selectedExpense, selectedAccountForPayment);
  };

  const handleRecurringDelete = (accountId, expenseId) => {
    deleteExpense(accountId, expenseId);
    setItemToDelete(null);
  };

  return (
    <div className={`p-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Header with navigation and balance */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
        >
          Back to Accounts
        </button>
        <div className="text-right">
          <p className="text-lg font-semibold">Current Balance: ₹{totalBalance}</p>
          <p className="text-lg font-semibold">
            Balance after this month's expenses: ₹{balanceAfterExpenses}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            (Only includes pending expenses)
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            activeTab === 'upcoming'
              ? 'bg-blue-500 text-white'
              : darkMode
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Upcoming Items
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            activeTab === 'recurring'
              ? 'bg-blue-500 text-white'
              : darkMode
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Recurring Items
        </button>
      </div>

      {activeTab === 'upcoming' ? (
        <>
          {/* One-time expense/income form */}
          <form onSubmit={handleSubmit} className={`mb-8 p-6 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <h2 className="text-xl font-bold mb-4">Add New Expense/Income</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Title</label>
                <input
                  type="text"
                  value={expenseData.title}
                  onChange={(e) => setExpenseData({...expenseData, title: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="block mb-2">Amount</label>
                <input
                  type="number"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block mb-2">Due Date</label>
                <input
                  type="date"
                  value={expenseData.dueDate}
                  onChange={(e) => setExpenseData({...expenseData, dueDate: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-2">Account (Optional)</label>
                <select
                  value={expenseData.accountId}
                  onChange={(e) => setExpenseData({...expenseData, accountId: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Select Account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2">Type</label>
                <select
                  value={expenseData.type}
                  onChange={(e) => setExpenseData({...expenseData, type: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="expense">Expense</option>
                  <option value="goal">Income</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
            >
              Add {expenseData.type === 'expense' ? 'Expense' : 'Income'}
            </button>
          </form>

          {/* List of upcoming items */}
          <div className={`p-6 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <h2 className="text-xl font-bold mb-4">Upcoming Expenses & Income</h2>
            {accounts.map(account => {
              const accountExpenses = account.expenses?.filter(exp => !exp.recurring) || [];
              if (!accountExpenses.length) return null;
              
              return (
                <div key={account.id} className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{account.name}</h3>
                  <div className="space-y-2">
                    {accountExpenses.map(expense => (
                      <div
                        key={expense.id}
                        className={`p-4 rounded-lg ${
                          darkMode
                            ? expense.type === 'goal' ? 'bg-green-900' : 'bg-red-900'
                            : expense.type === 'goal' ? 'bg-green-100' : 'bg-red-100'
                        } flex justify-between items-center`}
                      >
                        <div>
                          <p className="font-semibold">{expense.title}</p>
                          <p className="text-sm">
                            Due: {new Date(expense.dueDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm mt-1">
                            Status: <span className={expense.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}>
                              {(expense.status || 'pending').toUpperCase()}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold">₹{expense.amount}</p>
                          <div className="flex space-x-2">
                            {(expense.status || 'pending') === 'pending' && (
                              <button
                                onClick={() => handlePaid(expense)}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
                              >
                                {expense.type === 'goal' ? 'Received' : 'Paid'}
                              </button>
                            )}
                            <button
                              onClick={() => deleteExpense(expense.accountId || 'unassigned', expense.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Recurring items form */}
          <form onSubmit={handleRecurringSubmit} className={`mb-6 p-4 rounded-lg shadow-md ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-bold mb-4">Add Recurring Item</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Amount:</label>
                <input
                  type="number"
                  value={recurringData.amount}
                  onChange={(e) => setRecurringData({...recurringData, amount: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block mb-2">Note:</label>
                <input
                  type="text"
                  value={recurringData.note}
                  onChange={(e) => setRecurringData({...recurringData, note: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter note"
                />
              </div>

              <div>
                <label className="block mb-2">Type:</label>
                <select
                  value={recurringData.type}
                  onChange={(e) => setRecurringData({...recurringData, type: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="debit">Expense</option>
                  <option value="credit">Income</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Account:</label>
                <select
                  value={recurringData.accountId}
                  onChange={(e) => setRecurringData({...recurringData, accountId: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Select Account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2">Start Date:</label>
                <input
                  type="date"
                  value={recurringData.date}
                  onChange={(e) => setRecurringData({...recurringData, date: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-2">Recurring Type:</label>
                <select
                  value={recurringData.recurringType}
                  onChange={(e) => setRecurringData({...recurringData, recurringType: e.target.value})}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={recurringData.hasEndDate}
                    onChange={(e) => setRecurringData({...recurringData, hasEndDate: e.target.checked})}
                    className="form-checkbox"
                  />
                  <span>Has End Date</span>
                </label>
                {recurringData.hasEndDate && (
                  <input
                    type="date"
                    value={recurringData.endDate}
                    onChange={(e) => setRecurringData({...recurringData, endDate: e.target.value})}
                    min={recurringData.date}
                    className={`w-full p-2 rounded border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={recurringData.autoDebitCredit}
                    onChange={(e) => setRecurringData({...recurringData, autoDebitCredit: e.target.checked})}
                    className="form-checkbox"
                  />
                  <span>Auto {recurringData.type === 'debit' ? 'Debit' : 'Credit'} on Due Date</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Automatically process this transaction when its due date arrives
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={recurringData.autoProcess}
                    onChange={(e) => setRecurringData({...recurringData, autoProcess: e.target.checked})}
                    className="form-checkbox"
                  />
                  <span>Show in Calendar</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Display future occurrences in the calendar view
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
            >
              Add Recurring Item
            </button>
          </form>

          {/* List of recurring items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(account => 
              account.expenses?.filter(exp => exp.recurring)?.map(expense => (
                <div
                  key={expense.id}
                  className={`p-4 rounded-lg shadow-md ${
                    darkMode
                      ? expense.type === 'credit' ? 'bg-green-900' : 'bg-red-900'
                      : expense.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{expense.note}</h3>
                      <p>₹{expense.amount}</p>
                      <p className="text-sm">
                        {expense.recurring.type.charAt(0).toUpperCase() + expense.recurring.type.slice(1)}
                      </p>
                      <p className="text-sm">
                        Start: {new Date(expense.date).toLocaleDateString()}
                      </p>
                      {expense.recurring.hasEndDate && (
                        <p className="text-sm">
                          End: {new Date(expense.recurring.endDate).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-sm">
                        Auto-process: {expense.recurring.autoProcess ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <button
                      onClick={() => setItemToDelete(expense)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-sm">Account: {account.name}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Account selection modal */}
      {showAccountSelect && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl max-w-md w-full`}>
            <h3 className="text-lg font-semibold mb-4">
              Select Account for {selectedExpense?.type === 'goal' ? 'Income' : 'Payment'}
            </h3>
            <select
              value={selectedAccountForPayment}
              onChange={(e) => setSelectedAccountForPayment(e.target.value)}
              className={`w-full p-2 rounded border mb-4 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="">Select Account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAccountSelect(false);
                  setSelectedExpense(null);
                  setSelectedAccountForPayment('');
                }}
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccount}
                disabled={!selectedAccountForPayment}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal for deleting recurring items */}
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => handleRecurringDelete(itemToDelete?.accountId, itemToDelete?.id)}
        title="Delete Recurring Item"
        message={`Are you sure you want to delete this recurring ${itemToDelete?.type} of ₹${itemToDelete?.amount}? This action cannot be undone.`}
        darkMode={darkMode}
      />
    </div>
  );
} 