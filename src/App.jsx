import React from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import AccountListPage from "./components/AccountListPage";
import AccountPage from "./components/AccountPage";
import Navbar from "./components/Navbar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnalyticsPage from './components/AnalyticsPage';
import ChatPage from "./components/ChatPage";
import LogsPage from "./components/LogsPage";
import { toggleDarkMode } from './features/darkMode/darkModeSlice';

export default function App() {
  const accounts = useSelector(state => state.accounts);
  const darkMode = useSelector(state => state.darkMode);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={handleToggleDarkMode} />
      <div className="p-4">
        <Routes>
          <Route 
            path="/" 
            element={
              <AccountListPage
                accounts={accounts}
                darkMode={darkMode}
              />
            } 
          />
          <Route 
            path="/account/:accountId" 
            element={
              <AccountPage
                accounts={accounts}
                darkMode={darkMode}
              />
            } 
          />
          <Route path="/analytics" element={<AnalyticsPage accounts={accounts} darkMode={darkMode} />} />
          <Route path="/chat" element={<ChatPage darkMode={darkMode} />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ToastContainer theme={darkMode ? 'dark' : 'light'} />
    </div>
  );
}
