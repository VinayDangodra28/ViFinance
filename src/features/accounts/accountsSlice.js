import { createSlice } from '@reduxjs/toolkit';

const initialState = JSON.parse(localStorage.getItem('accounts')) || [];

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    addAccount: (state, action) => {
      const newAccount = {
        id: Date.now(),
        name: action.payload,
        transactions: [],
      };
      state.unshift(newAccount);
      localStorage.setItem('accounts', JSON.stringify(state));
    },
    deleteAccount: (state, action) => {
      const updatedState = state.filter(account => account.id !== action.payload);
      localStorage.setItem('accounts', JSON.stringify(updatedState));
      return updatedState;
    },
    addTransaction: (state, action) => {
      const { accountId, transaction } = action.payload;
      const updatedState = state.map(account =>
        account.id === parseInt(accountId)
          ? {
              ...account,
              transactions: [
                {
                  id: Date.now(),
                  amount: transaction.amount,
                  note: transaction.note || '',
                  type: transaction.type,
                  date: new Date(transaction.date).toISOString()
                },
                ...account.transactions,
              ],
            }
          : account
      );
      localStorage.setItem('accounts', JSON.stringify(updatedState));
      return updatedState;
    },
    deleteTransaction: (state, action) => {
      const { accountId, transactionId } = action.payload;
      const updatedState = state.map(account =>
        account.id === accountId
          ? {
              ...account,
              transactions: account.transactions.filter(transaction => transaction.id !== transactionId),
            }
          : account
      );
      localStorage.setItem('accounts', JSON.stringify(updatedState));
      return updatedState;
    },
  },
});

export const { addAccount, deleteAccount, addTransaction, deleteTransaction } = accountsSlice.actions;
export default accountsSlice.reducer;
