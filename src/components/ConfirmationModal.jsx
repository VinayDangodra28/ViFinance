import React from 'react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Delete',
  darkMode 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`${
        darkMode 
          ? 'bg-gradient-to-r from-gray-800/90 to-gray-900/90 text-white' 
          : 'bg-gradient-to-r from-white/90 to-gray-50/90 text-gray-800'
      } p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200/20 backdrop-blur-sm`}>
        <h3 className="text-2xl font-semibold mb-4">{title}</h3>
        <p className="mb-8 text-gray-500 dark:text-gray-400">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/50
                ${
                    darkMode
                        ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'
                } font-medium shadow-lg`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50
                bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-medium shadow-lg shadow-red-500/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 