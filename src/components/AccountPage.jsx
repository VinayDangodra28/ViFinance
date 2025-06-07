import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TransactionForm from "./TransactionForm";
import Analytics from "./Analytics";
import { toast } from 'react-toastify';
import ConfirmationModal from "./ConfirmationModal";
import CalendarView from "./CalendarView";

export default function AccountPage({ accounts, addTransaction, deleteTransaction, deleteAccount, darkMode, getAccountExpensesDiff }) {
    const navigate = useNavigate();
    const { accountId } = useParams();
    const account = accounts.find((acc) => acc.id === parseInt(accountId));
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [viewMode, setViewMode] = useState('calendar');

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
        deleteTransaction(accountId, transactionId);
        setTransactionToDelete(null);
        toast.success('Transaction deleted successfully!');
    };

    const handleDeleteAccount = () => {
        deleteAccount(account.id);
        setShowDeleteAccount(false);
    };

    const currentBalance = account.transactions.reduce((sum, trans) => {
        return sum + (trans.type === 'credit' ? trans.amount : -trans.amount);
    }, 0);

    const balanceAfterExpenses = getAccountExpensesDiff(account.id);
    const hasPendingExpenses = currentBalance !== balanceAfterExpenses;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className={`${
                darkMode 
                    ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
                    : 'bg-gradient-to-r from-white/50 to-gray-50/50'
            } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20 mb-8`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{account.name}</h2>
                        <div className="space-y-2">
                            <p className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                ₹{currentBalance.toLocaleString()}
                                <span className={`text-sm font-normal ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Balance</span>
                            </p>
                            {hasPendingExpenses && (
                                <p className={`text-sm ${
                                    balanceAfterExpenses < currentBalance 
                                        ? darkMode ? 'text-red-400' : 'text-red-500'
                                        : darkMode ? 'text-green-400' : 'text-green-500'
                                }`}>
                                    After Expenses: ₹{balanceAfterExpenses.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={() => navigate('/')} 
                            className={`px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                                ${
                                    darkMode
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500'
                                } text-white font-medium shadow-lg shadow-blue-500/20`}
                        >
                            Back to Accounts
                        </button>
                        <button
                            onClick={() => setShowDeleteAccount(true)}
                            className="px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50
                                bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-medium shadow-lg shadow-red-500/20"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                            viewMode === 'calendar'
                                ? darkMode
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-500 text-white'
                                : darkMode
                                    ? 'text-gray-300 hover:text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Calendar View
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                            viewMode === 'list'
                                ? darkMode
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-500 text-white'
                                : darkMode
                                    ? 'text-gray-300 hover:text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        List View
                    </button>
                </div>
            </div>

            {/* Transaction Form */}
            <div className="mb-8">
                <TransactionForm accountId={account.id} addTransaction={addTransaction} darkMode={darkMode} />
            </div>

            {/* Transactions View */}
            <div className={`${
                darkMode 
                    ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
                    : 'bg-gradient-to-r from-white/50 to-gray-50/50'
            } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
                {viewMode === 'calendar' ? (
                    <CalendarView 
                        items={account.transactions} 
                        darkMode={darkMode} 
                        deleteTransaction={(transactionId) => deleteTransaction(account.id, transactionId)}
                        onDeleteClick={setTransactionToDelete}
                    />
                ) : (
                    <div className="space-y-4">
                        {account.transactions.map((t) => (
                            <div
                                key={t.id}
                                className={`p-4 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200 transform hover:-translate-y-1 ${
                                    darkMode
                                        ? t.type === "credit" 
                                            ? 'bg-gradient-to-r from-green-900/50 to-green-800/50' 
                                            : 'bg-gradient-to-r from-red-900/50 to-red-800/50'
                                        : t.type === "credit" 
                                            ? 'bg-gradient-to-r from-green-50 to-green-100' 
                                            : 'bg-gradient-to-r from-red-50 to-red-100'
                                } backdrop-blur-sm border border-gray-200/20`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${
                                        darkMode
                                            ? t.type === "credit" ? 'bg-green-800' : 'bg-red-800'
                                            : t.type === "credit" ? 'bg-green-200' : 'bg-red-200'
                                    }`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            {t.type === "credit" ? (
                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            ) : (
                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            )}
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.note}</p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <p className={`font-semibold ${
                                        t.type === "credit" ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                        ₹{t.amount.toLocaleString()}
                                    </p>
                                    <button
                                        onClick={() => setTransactionToDelete(t)}
                                        className="p-2 text-red-400 hover:text-red-500 transition-colors duration-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Analytics */}
            <div className="mt-8">
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
                message={`Are you sure you want to delete the account "${account.name}"? This will delete all transactions and pending items. This action cannot be undone.${
                    hasPendingExpenses ? ' This account has pending expenses/income.' : ''
                }`}
                darkMode={darkMode}
            />
        </div>
    );
}
