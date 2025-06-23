import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTransaction, deleteTransaction, deleteAccount } from '../features/accounts/accountsSlice';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";
import TransactionForm from "./TransactionForm";
import Analytics from "./Analytics";
import ConfirmationModal from "./ConfirmationModal";
import CalendarView from "./CalendarView";

export default function AccountPage() {
    const accounts = useSelector(state => state.accounts);
    const darkMode = useSelector(state => state.darkMode);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { accountId } = useParams();
    const account = accounts.find((acc) => acc.id === parseInt(accountId));
    const [transactionToDelete, setTransactionToDelete] = React.useState(null);
    const [showDeleteAccount, setShowDeleteAccount] = React.useState(false);
    const [viewMode, setViewMode] = React.useState('calendar');

    if (!account) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button 
                    onClick={() => navigate('/')} 
                    className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                        ${
                            darkMode
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500'
                        } text-white font-medium shadow-lg shadow-blue-500/20`}
                >
                    Back to Accounts
                </button>
                <p className={`mt-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>Account not found.</p>
            </div>
        );
    }

    const handleDelete = (accountId, transactionId) => {
        dispatch(deleteTransaction({ accountId, transactionId }));
        setTransactionToDelete(null);
        toast.success('Transaction deleted successfully!');
    };

    const handleDeleteAccount = () => {
        dispatch(deleteAccount(account.id));
        setShowDeleteAccount(false);
        navigate('/');
    };

    const currentBalance = account.transactions.reduce((sum, trans) => {
        return sum + (trans.type === 'credit' ? trans.amount : -trans.amount);
    }, 0);

    return (
        <div className="w-full max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-2 sm:py-8">
            {/* Header Section (not sticky) */}
            <div className="mb-2 sm:mb-8 transition-all duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2 px-1 sm:px-6">
                    <div className="w-full sm:w-auto flex flex-col sm:items-start gap-1">
                        <h2 className={`text-title ${darkMode ? 'text-white' : 'text-gray-900'}`}>{account.name}</h2>
                        <p className={`text-balance ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>₹{currentBalance.toLocaleString()}
                            <span className={`text-label ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Balance</span>
                        </p>
                    </div>
                    <div className="w-full sm:w-auto grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4 mt-2 sm:mt-0">
                        <button 
                            onClick={() => navigate('/')} 
                            className={`btn-primary${darkMode ? '-dark' : ''} w-full sm:w-auto text-base sm:text-lg`}
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setShowDeleteAccount(true)}
                            className={`btn-danger${darkMode ? '-dark' : ''} w-full sm:w-auto text-base sm:text-lg`}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction Form - close to header for proximity */}
            <div className="mb-2 sm:mb-8 flex flex-col w-full">
                <TransactionForm accountId={account.id} addTransaction={addTransaction} darkMode={darkMode} />
            </div>

            {/* Sticky View Mode Toggle - close to transaction list for proximity */}
            <div className={`sticky top-15 z-20 ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-xs rounded-b-2xl transition-all duration-200 mb-2 w-full`}>                
                <div className="flex justify-center gap-2 sm:gap-4 py-2">
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-2 rounded-xl text-base sm:text-lg transition-all duration-200 ${
                            viewMode === 'calendar'
                                ? darkMode
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-blue-500 text-white shadow-md'
                                : darkMode
                                    ? 'text-gray-300 hover:text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Calendar
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-xl text-base sm:text-lg transition-all duration-200 ${
                            viewMode === 'list'
                                ? darkMode
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-blue-500 text-white shadow-md'
                                : darkMode
                                    ? 'text-gray-300 hover:text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        List
                    </button>
                </div>
            </div>

            {/* Transactions View - close to toggle for proximity */}
            <div className={`box-base mb-4`}> 
                {viewMode === 'calendar' ? (
                    <CalendarView 
                        items={account.transactions} 
                        darkMode={darkMode} 
                        deleteTransaction={(transactionId) => deleteTransaction(account.id, transactionId)}
                        onDeleteClick={setTransactionToDelete}
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        {account.transactions.length === 0 && (
                            <div className={`text-center py-8 text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No transactions yet.</div>
                        )}
                        {account.transactions.map((t) => (
                            <div
                                key={t.id}
                                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-4 rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-1 active:scale-95 ${
                                    darkMode
                                        ? t.type === "credit" 
                                            ? 'bg-gradient-to-r from-green-900/60 to-green-800/60' 
                                            : 'bg-gradient-to-r from-red-900/60 to-red-800/60'
                                        : t.type === "credit" 
                                            ? 'bg-gradient-to-r from-green-50 to-green-100' 
                                            : 'bg-gradient-to-r from-red-50 to-red-100'
                                } backdrop-blur-sm border border-gray-200/20 w-full`}
                            >
                                <div className="flex items-center space-x-3 sm:space-x-4 w-full">
                                    <div className={`p-2 rounded-lg ${
                                        darkMode
                                            ? t.type === "credit" ? 'bg-green-800' : 'bg-red-800'
                                            : t.type === "credit" ? 'bg-green-200' : 'bg-red-200'
                                    }`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 20 20" fill="currentColor">
                                            {t.type === "credit" ? (
                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            ) : (
                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            )}
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold sm:font-bold text-base sm:text-xl truncate text-important ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.note}</p>
                                        <p className={`text-secondary ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 sm:space-x-4 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                                    <p className={`text-important ${t.type === "credit" ? 'text-green-500' : 'text-red-500'}`}>₹{t.amount.toLocaleString()}</p>
                                    <button
                                        onClick={() => setTransactionToDelete(t)}
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
                )}
            </div>

            {/* Analytics - separated for clarity */}
            <div className="mt-6 sm:mt-8 w-full">
                <Analytics accounts={[account]} darkMode={darkMode} />
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={!!transactionToDelete}
                onClose={() => setTransactionToDelete(null)}
                onConfirm={() => handleDelete(account.id, transactionToDelete.id)}
                title="Delete Transaction"
                message={`Are you sure you want to delete this ${transactionToDelete?.type} transaction of ₹${transactionToDelete?.amount}? This action cannot be undone.`}
                darkMode={darkMode}
            />

            <ConfirmationModal
                isOpen={showDeleteAccount}
                onClose={() => setShowDeleteAccount(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account"
                message={`Are you sure you want to delete the account \"${account.name}\"? This will delete all transactions. This action cannot be undone.`}
                darkMode={darkMode}
            />
        </div>
    );
}
