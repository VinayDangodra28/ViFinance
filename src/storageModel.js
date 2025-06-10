// src/storageModel.js
// Abstracts storage operations for accounts and dark mode using a class

const STORAGE_KEYS = {
  ACCOUNTS: 'accounts',
  DARK_MODE: 'darkMode',
};

class StorageModel {
  getAccounts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) || [];
  }

  setAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  getDarkMode() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DARK_MODE)) || false;
  }

  setDarkMode(darkMode) {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
  }

  addAccount(name) {
    const accounts = this.getAccounts();
    const newAccount = {
      id: Date.now(),
      name,
      transactions: [],
      // expenses: []
    };
    const updated = [newAccount, ...accounts];
    this.setAccounts(updated);
    return updated;
  }

  deleteAccount(accountId) {
    const accounts = this.getAccounts();
    const updated = accounts.filter(acc => acc.id !== accountId);
    this.setAccounts(updated);
    return updated;
  }

 addTransaction(accountId, transaction) {
    const accounts = this.getAccounts();
    const updated = accounts.map(acc =>
      acc.id === parseInt(accountId)
        ? {
            ...acc,
            transactions: [
              {
                id: Date.now(),
                amount: transaction.amount,
                note: transaction.note || '',
                type: transaction.type, // 'credit' or 'debit'
                date: new Date(transaction.date).toISOString() // Ensure date is in ISO format
              },
              ...acc.transactions,
            ],
          }
        : acc
    );
    this.setAccounts(updated);
    return updated;
  }


  deleteTransaction(accountId, transactionId) {
    const accounts = this.getAccounts();
    const updated = accounts.map(acc =>
      acc.id === accountId
        ? {
            ...acc,
            transactions: acc.transactions.filter(t => t.id !== transactionId),
          }
        : acc
    );
    this.setAccounts(updated);
    return updated;
  }

  // You can add more methods as needed
}

const storageModel = new StorageModel();
export default storageModel;
