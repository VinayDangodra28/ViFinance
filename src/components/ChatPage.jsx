import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { handleFinanceChat, handleAddAccount, handleDeleteAccount } from "../aiFinanceController";

export default function ChatPage() {
  const accounts = useSelector(state => state.accounts);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! 👋 I'm your finance assistant. You can say things like:\n- 'Add ₹500 groceries to account 12345'\n- 'Create account called Savings'\n- 'Show my accounts'"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending messages
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setLoading(true);
    setError(null);

    // Add user message to chat
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);

    try {
      // Check if the message is an account creation request
      if (userMsg.toLowerCase().startsWith("create account")) {
        const accountName = userMsg.replace(/^create account called?\s*/i, '');
        if (!accountName.trim()) {
          throw new Error("Please specify an account name");
        }

        const res = await handleAddAccount(accountName.trim());
        setMessages(prev => [...prev, { sender: "bot", text: res.chat }]);
      }
      // Check if the message is an account deletion request
      else if (userMsg.toLowerCase().startsWith("delete account")) {
        const accountId = userMsg.replace(/^delete account\s*/i, '').trim();
        if (!accountId) {
          throw new Error("Please specify an account ID to delete");
        }

        const res = await handleDeleteAccount(accountId);
        setMessages(prev => [...prev, { sender: "bot", text: res.chat }]);
      }
      // Handle regular finance chat
      else {
        const res = await handleFinanceChat(userMsg, messages);
        setMessages(prev => [...prev, { sender: "bot", text: res.chat }]);
      }
    } catch (err) {
      console.error("Error handling message:", err);
      setError(err.message);
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: `❌ Error: ${err.message || "Something went wrong. Please try again."}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle quick account creation
  const handleQuickAddAccount = async () => {
    const accountName = prompt("Enter new account name:");
    if (!accountName?.trim()) return;

    setLoading(true);
    try {
      const res = await handleAddAccount(accountName.trim());
      setMessages(prev => [
        ...prev,
        { sender: "user", text: `Create account called ${accountName}` },
        { sender: "bot", text: res.chat }
      ]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [
        ...prev,
        { sender: "user", text: `Create account called ${accountName}` },
        {
          sender: "bot",
          text: `❌ Error: ${err.message || "Failed to create account"}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-2 pb-24">
        <div className="max-w-lg mx-auto space-y-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-4 py-2 max-w-[80%] shadow text-base whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow text-gray-500 dark:text-gray-400">
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2"
      >
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <input
            className="flex-1 rounded-full px-4 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            type="text"
            placeholder="Type a finance command..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-blue-500 text-white font-semibold shadow disabled:opacity-50 hover:bg-blue-600 transition-colors"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
