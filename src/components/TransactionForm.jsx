import React, { useState } from "react";
import { toast } from 'react-toastify';

export default function TransactionForm({ accountId, addTransaction, darkMode }) {
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [type, setType] = useState("debit");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!amount || !note || !date) {
            toast.error('Please fill in all required fields');
            return;
        }

        const transaction = {
            id: Date.now(),
            amount: parseFloat(amount),
            note,
            type,
            date: new Date(date).toISOString(),
        };

        addTransaction(accountId, transaction);

        // Reset form
        setAmount("");
        setNote("");
        setDate(new Date().toISOString().split('T')[0]);

        toast.success('Transaction added successfully!');
    };

    return (
        <div className={`${
            darkMode 
                ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
                : 'bg-gradient-to-r from-white/50 to-gray-50/50'
        } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
            <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add New Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Amount</label>
                        <div className="relative">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={`w-full pl-8 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200
                                    ${
                                        darkMode 
                                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                                            : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'
                                    } border backdrop-blur-sm`}
                                placeholder="Enter amount"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Note</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className={`w-full pl-4 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200
                                ${
                                    darkMode 
                                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'
                                } border backdrop-blur-sm`}
                            placeholder="Enter note"
                        />
                    </div>

                    <div className="relative">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className={`w-full pl-4 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200
                                ${
                                    darkMode 
                                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'
                                } border backdrop-blur-sm`}
                        >
                            <option value="debit">Expense</option>
                            <option value="credit">Income</option>
                        </select>
                    </div>

                    <div className="relative">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={`w-full pl-4 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200
                                ${
                                    darkMode 
                                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'
                                } border backdrop-blur-sm`}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                            ${
                                darkMode
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500'
                            } text-white font-medium shadow-lg shadow-blue-500/20`}
                    >
                        Add Transaction
                    </button>
                </div>
            </form>
        </div>
    );
}
