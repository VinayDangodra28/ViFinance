import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAccount } from '../features/accounts/accountsSlice';
import { toast } from 'react-toastify';

export default function AccountForm() {
  const [name, setName] = useState("");
  const darkMode = useSelector(state => state.darkMode);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      dispatch(addAccount(name));
      setName("");
      toast.success(`Account "${name}" added successfully!`);
    }
  };

  return (
    <div className={`${
      darkMode 
        ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' 
        : 'bg-gradient-to-r from-white/50 to-gray-50/50'
    } backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/20`}>
      <h2 className={`text-xl font-semibold mb-4 ${
        darkMode ? 'text-white' : 'text-gray-800'
      }`}>
        Add New Account
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            className={`w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200
              ${
                darkMode 
                  ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'
              } border backdrop-blur-sm`}
            placeholder="Enter account name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="New Bank Account"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <button 
          className={`px-6 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50
            ${
              darkMode
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500'
            } text-white font-medium shadow-lg shadow-blue-500/20`}
          type="submit"
        >
          Add Account
        </button>
      </form>
    </div>
  );
}
