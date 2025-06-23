// src/storageModel.js
// Abstracts storage operations for accounts and dark mode using a class

const STORAGE_KEYS = {
  ACCOUNTS: 'accounts',
  DARK_MODE: 'darkMode',
};

export const getAccounts = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) || [];
};

export const setAccounts = (accounts) => {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
};

export const getDarkMode = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DARK_MODE)) || false;
};

export const setDarkMode = (darkMode) => {
  localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
};

export default {
  getAccounts,
  setAccounts,
  getDarkMode,
  setDarkMode,
};
