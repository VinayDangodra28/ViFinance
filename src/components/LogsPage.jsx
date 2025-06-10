import React, { useState, useEffect } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("finance_logs");
    if (stored) {
      setLogs(JSON.parse(stored).reverse()); // newest first
    }
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      !filter ||
      (log.type && log.type.toLowerCase().includes(filter.toLowerCase())) ||
      (log.error && log.error.toLowerCase().includes(filter.toLowerCase())) ||
      (log.userMessage && log.userMessage.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">Finance Assistant Logs</h1>
        <div className="flex items-center mb-4 gap-2">
          <input
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Filter by type, error, or message..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ minWidth: 200 }}
          />
          <button
            className="ml-2 px-3 py-2 rounded bg-blue-500 text-white font-semibold shadow"
            onClick={() => setShowRaw(r => !r)}
            type="button"
          >
            {showRaw ? "Hide Raw" : "Show Raw"}
          </button>
          <button
            className="ml-2 px-3 py-2 rounded bg-red-500 text-white font-semibold shadow"
            onClick={() => {
              if (window.confirm("Clear all logs?")) {
                localStorage.removeItem("finance_logs");
                setLogs([]);
              }
            }}
            type="button"
          >
            Clear Logs
          </button>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow p-2">
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 py-8 text-center">No logs found.</div>
          ) : (
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-2 py-1 text-left">Time</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-left">Message / Error</th>
                  <th className="px-2 py-1 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700">
                    <td className="px-2 py-1 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-2 py-1 font-semibold text-blue-700 dark:text-blue-300">{log.type}</td>
                    <td className="px-2 py-1">
                      {log.error || log.userMessage || log.question || "-"}
                    </td>
                    <td className="px-2 py-1">
                      {showRaw ? (
                        <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs max-w-xs overflow-x-auto">{JSON.stringify(log, null, 2)}</pre>
                      ) : (
                        <>
                          {log.accountId && <div><b>Account:</b> {log.accountId}</div>}
                          {log.transaction && <div><b>Txn:</b> {JSON.stringify(log.transaction)}</div>}
                          {log.accounts && <div><b>Accounts:</b> {log.accounts.length}</div>}
                          {log.prompt && <details><summary className="cursor-pointer">Prompt</summary><pre className="bg-gray-50 dark:bg-gray-900 p-1 rounded text-xs max-w-xs overflow-x-auto">{log.prompt.slice(0, 500)}{log.prompt.length > 500 ? "..." : ""}</pre></details>}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
