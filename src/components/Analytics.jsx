import React from "react";

export default function Analytics({ accounts }) {
  const total = accounts.reduce((sum, acc) => {
    const balance = acc.transactions.reduce(
      (b, t) => b + (t.type === "credit" ? t.amount : -t.amount),
      0
    );
    return sum + balance;
  }, 0);

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-semibold text-2xl mb-4 text-gray-800">Analytics</h3>
      <p className="text-lg text-gray-700">Total Balance: ₹{total.toFixed(2)}</p>
      {accounts.map((acc) => {
        const balance = acc.transactions.reduce(
          (b, t) => b + (t.type === "credit" ? t.amount : -t.amount),
          0
        );
        return (
          <div key={acc.id} className="text-gray-700 mt-2">
            {acc.name}: ₹{balance.toFixed(2)}
          </div>
        );
      })}
    </div>
  );
}
