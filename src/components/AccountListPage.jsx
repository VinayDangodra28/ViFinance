import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountForm from "./AccountForm";
import Analytics from "./Analytics";
import ConfirmationModal from "./ConfirmationModal";

export default function AccountListPage({ accounts, addAccount, deleteAccount, darkMode, getAccountExpensesDiff }) {
  const navigate = useNavigate();
  const [accountToDelete, setAccountToDelete] = useState(null);

  const getAccountBalance = (account) => {
    return account.transactions.reduce((sum, trans) => {
      return sum + (trans.type === 'credit' ? trans.amount : -trans.amount);
    }, 0);
  };

  const handleDeleteClick = (e, account) => {
    e.stopPropagation();
    setAccountToDelete(account);
  };

  const handleConfirmDelete = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AccountForm addAccount={addAccount} darkMode={darkMode} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {accounts.map((acc) => {
          const currentBalance = getAccountBalance(acc);
          const balanceAfterExpenses = getAccountExpensesDiff(acc.id);
          const hasPendingExpenses = currentBalance !== balanceAfterExpenses;

          return (
            <div 
              key={acc.id} 
              className={`${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white' 
                  : 'bg-gradient-to-br from-white to-gray-50 text-gray-800'
              } rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/20 backdrop-blur-sm`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <button 
                    onClick={() => navigate(`/account/${acc.id}`)}
                    className="text-left flex-1"
                  >
                    <h3 className="text-xl font-semibold mb-2">{acc.name}</h3>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        ₹{currentBalance.toLocaleString()}
                        <span className="text-sm font-normal ml-2 text-gray-500">Current Balance</span>
                      </p>
                      {hasPendingExpenses && (
                        <p className={`text-sm ${
                          balanceAfterExpenses < currentBalance 
                            ? 'text-red-400' 
                            : 'text-green-400'
                        }`}>
                          After Expenses: ₹{balanceAfterExpenses.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, acc)}
                    className="ml-4 p-2 text-red-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {acc.expenses?.some(exp => exp.status === 'pending') && (
                  <div className={`text-sm ${
                    darkMode ? 'text-yellow-400' : 'text-yellow-600'
                  } flex items-center mt-4`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Pending expenses
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-12">
        <Analytics accounts={accounts} darkMode={darkMode} />
      </div>

      <ConfirmationModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Account"
        message={`Are you sure you want to delete the account "${accountToDelete?.name}"? This action cannot be undone.${
          accountToDelete?.expenses?.some(exp => exp.status === 'pending')
            ? ' This account has pending expenses/income that will also be deleted.'
            : ''
        }`}
        darkMode={darkMode}
      />
    </div>
  );
}
