import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ darkMode, toggleDarkMode }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Accounts' },
    // { path: '/expenses', label: 'Expenses & Goals' },
    { path: '/analytics', label: 'Analytics' }
  ];

  return (
    <>
      <nav className={`${
        darkMode 
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-r from-white via-gray-50 to-white'
      } shadow-lg mb-6 backdrop-blur-sm bg-opacity-90 sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className={`${
                darkMode 
                  ? 'text-white hover:text-blue-400' 
                  : 'text-gray-800 hover:text-blue-600'
              } text-xl font-bold transition-colors duration-200`}
            >
              Finance Manager
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    location.pathname === link.path
                      ? darkMode
                        ? 'text-blue-400'
                        : 'text-blue-600'
                      : darkMode
                      ? 'text-gray-300 hover:text-blue-400'
                      : 'text-gray-600 hover:text-blue-600'
                  } transition-colors duration-200 font-medium`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`
                  p-2 rounded-full
                  ${darkMode 
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  transition-all duration-200 transform hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-gray-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-md transition-opacity duration-300 ease-in-out md:hidden z-50"
          onClick={closeMenu}
        />
      )}

      {/* Mobile menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 md:hidden transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div 
          className={`h-full w-full ${
            darkMode ? 'bg-gray-900/80' : 'bg-white/80'
          } shadow-xl flex flex-col backdrop-blur-md`}
        >
          {/* Menu header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Menu
            </h2>
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <svg
                className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-gray-600'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Menu items */}
          <div className="flex-1 overflow-y-auto py-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`${
                  location.pathname === link.path
                    ? darkMode
                      ? 'bg-gray-800/50 text-blue-400'
                      : 'bg-gray-100/50 text-blue-600'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-800/50 hover:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100/50 hover:text-blue-600'
                } block px-6 py-4 text-lg font-medium transition-colors duration-200`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Menu footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Finance Manager v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 