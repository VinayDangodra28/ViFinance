import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import AccountListPage from "./components/AccountListPage";
import AccountPage from "./components/AccountPage";
// import ExpensesPage from "./components/ExpensesPage";
import Navbar from "./components/Navbar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnalyticsPage from './components/AnalyticsPage';

export default function App() {
  const [accounts, setAccounts] = useState(() => {
    return JSON.parse(localStorage.getItem("accounts")) || [];
  });
  const [darkMode, setDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem("darkMode")) || false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addAccount = (name) => {
    const newAccount = {
      id: Date.now(),
      name,
      transactions: [],
      // expenses: []
    };
    setAccounts([newAccount, ...accounts]);
  };

  const deleteAccount = (accountId) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
    toast.success('Account deleted successfully!');
    navigate('/');
  };

  const addTransaction = (accountId, transaction) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === parseInt(accountId)
          ? {
              ...acc,
              transactions: [
                { ...transaction, id: Date.now() },
                ...acc.transactions,
              ],
            }
          : acc
      )
    );
  };

  const deleteTransaction = (accountId, transactionId) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? {
            ...acc,
            transactions: acc.transactions.filter((t) => t.id !== transactionId),
          }
          : acc
      )
    );
  };

  // const updateExpenses = (accountId, expense) => {
  //   setAccounts((prev) => {
  //     // If the expense already exists, update it
  //     const accountWithExpense = prev.find(acc => 
  //       acc.expenses?.some(exp => exp.id === expense.id)
  //     );

  //     if (accountWithExpense) {
  //       // Remove the expense from its current account
  //       const updatedAccounts = prev.map(acc => ({
  //         ...acc,
  //         expenses: (acc.expenses || []).filter(exp => exp.id !== expense.id)
  //       }));

  //       // Add the expense to the new account
  //       return updatedAccounts.map(acc =>
  //         acc.id === parseInt(accountId)
  //           ? {
  //               ...acc,
  //               expenses: [...(acc.expenses || []), expense]
  //             }
  //           : acc
  //       );
  //     }

  //     // If it's a new expense, just add it to the account
  //     return prev.map((acc) =>
  //       acc.id === parseInt(accountId)
  //         ? {
  //             ...acc,
  //             expenses: [...(acc.expenses || []), expense],
  //           }
  //         : acc
  //     );
  //   });
  // };

  // const getAccountExpensesDiff = (accountId) => {
  //   const account = accounts.find(acc => acc.id === parseInt(accountId));
  //   if (!account) return 0;

  //   const currentDate = new Date();
  //   const currentBalance = account.transactions.reduce((sum, trans) => {
  //     return sum + (trans.type === 'credit' ? trans.amount : -trans.amount);
  //   }, 0);

  //   // Calculate pending one-time expenses/income
  //   const pendingOneTime = account.expenses?.reduce((sum, exp) => {
  //     if (!exp.recurring && exp.status === 'pending') {
  //       const dueDate = new Date(exp.dueDate);
  //       if (dueDate >= currentDate) {
  //         return sum + (exp.type === 'expense' ? -exp.amount : exp.amount);
  //       }
  //     }
  //     return sum;
  //   }, 0) || 0;

  //   // Calculate pending recurring transactions
  //   const pendingRecurring = account.expenses?.reduce((sum, exp) => {
  //     if (exp.recurring) {
  //       const startDate = new Date(exp.date);
  //       const endDate = exp.recurring.hasEndDate ? new Date(exp.recurring.endDate) : null;
        
  //       // Only consider if start date is in the future or recurring is ongoing
  //       if (startDate <= currentDate && (!endDate || endDate >= currentDate)) {
  //         // Calculate next occurrence based on recurring type
  //         let nextDate = new Date(startDate);
  //         if (exp.recurring.type === 'monthly') {
  //           // Find next monthly occurrence
  //           while (nextDate <= currentDate) {
  //             nextDate.setMonth(nextDate.getMonth() + 1);
  //           }
  //         } else {
  //           // Find next yearly occurrence
  //           while (nextDate <= currentDate) {
  //             nextDate.setFullYear(nextDate.getFullYear() + 1);
  //           }
  //         }
          
  //         // If next occurrence is within end date (if any), include it
  //         if (!endDate || nextDate <= endDate) {
  //           return sum + (exp.type === 'debit' ? -exp.amount : exp.amount);
  //         }
  //       }
  //     }
  //     return sum;
  //   }, 0) || 0;

  //   return currentBalance + pendingOneTime + pendingRecurring;
  // };

  // const deleteExpense = (accountId, expenseId) => {
  //   setAccounts((prev) =>
  //     prev.map((acc) =>
  //       acc.id === parseInt(accountId)
  //         ? {
  //             ...acc,
  //             expenses: (acc.expenses || []).filter((exp) => exp.id !== expenseId),
  //           }
  //         : acc
  //     )
  //   );
  //   toast.success('Item deleted successfully!');
  // };

  const processRecurringTransactions = () => {
    const currentDate = new Date();
    
    setAccounts(prevAccounts => {
      let accountsUpdated = false;
      
      const updatedAccounts = prevAccounts.map(account => {
        const recurringExpenses = account.expenses?.filter(exp => exp.recurring) || [];
        let accountModified = false;
        
        // Process each recurring expense
        recurringExpenses.forEach(expense => {
          if (expense.recurring.autoProcess) {
            const startDate = new Date(expense.date);
            const endDate = expense.recurring.hasEndDate ? new Date(expense.recurring.endDate) : null;
            
            // Only process if the recurring item is active
            if (startDate <= currentDate && (!endDate || endDate >= currentDate)) {
              let processDate = new Date(startDate);
              let transactionsAdded = false;
              
              // Process all occurrences up to current date
              while (processDate <= currentDate && (!endDate || processDate <= endDate)) {
                // Check if this occurrence has already been processed
                const isProcessed = account.transactions.some(trans => {
                  const transDate = new Date(trans.date);
                  return trans.note.includes('Auto-processed') &&
                         trans.amount === expense.amount &&
                         trans.type === expense.type &&
                         transDate.getFullYear() === processDate.getFullYear() &&
                         transDate.getMonth() === processDate.getMonth() &&
                         transDate.getDate() === processDate.getDate();
                });
                
                if (!isProcessed) {
                  account.transactions.push({
                    id: Date.now() + Math.random(),
                    amount: expense.amount,
                    note: `${expense.note} (Auto-processed for ${processDate.toLocaleDateString()})`,
                    type: expense.type,
                    date: new Date(processDate).toISOString()
                  });
                  transactionsAdded = true;
                }
                
                // Move to next occurrence
                if (expense.recurring.type === 'monthly') {
                  processDate.setMonth(processDate.getMonth() + 1);
                } else {
                  processDate.setFullYear(processDate.getFullYear() + 1);
                }
              }
              
              if (transactionsAdded) {
                accountModified = true;
                // Update the expense's date to the next occurrence
                expense.date = processDate.toISOString();
              }
            }
          }
        });
        
        if (accountModified) {
          accountsUpdated = true;
          return { ...account };
        }
        return account;
      });
      
      return accountsUpdated ? updatedAccounts : prevAccounts;
    });
  };

  // Set up periodic check for recurring transactions
  useEffect(() => {
    // Process on component mount
    processRecurringTransactions();
    
    // Set up interval to check every hour
    const interval = setInterval(processRecurringTransactions, 3600000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Wait for Cordova to be ready
    document.addEventListener("deviceready", () => {
      const isFirstTime = localStorage.getItem("firstOpen");

      if (!isFirstTime && window.cordova && cordova.plugins.notification) {
        cordova.plugins.notification.local.schedule({
          title: "Welcome!",
          text: "Hello World — Your app is ready 🚀",
          foreground: true
        });

        localStorage.setItem("firstOpen", "true");
      }
    }, false);
  }, []);
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="p-4">
        <Routes>
          <Route 
            path="/" 
            element={
              <AccountListPage
                accounts={accounts}
                addAccount={addAccount}
                deleteAccount={deleteAccount}
                darkMode={darkMode}
                // getAccountExpensesDiff={getAccountExpensesDiff}
              />
            } 
          />
          <Route 
            path="/account/:accountId" 
            element={
              <AccountPage
                accounts={accounts}
                addTransaction={addTransaction}
                deleteTransaction={deleteTransaction}
                deleteAccount={deleteAccount}
                darkMode={darkMode}
                // getAccountExpensesDiff={getAccountExpensesDiff}
              />
            } 
          />
          {/* <Route 
            path="/expenses" 
            element={
              <ExpensesPage
                accounts={accounts}
                updateExpenses={updateExpenses}
                deleteExpense={deleteExpense}
                addTransaction={addTransaction}
                darkMode={darkMode}
              />
            } 
          /> */}
          <Route path="/analytics" element={<AnalyticsPage accounts={accounts} darkMode={darkMode} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ToastContainer theme={darkMode ? 'dark' : 'light'} />
    </div>
  );
}
