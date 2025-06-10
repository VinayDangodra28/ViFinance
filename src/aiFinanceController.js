// src/aiFinanceController.js
import storageModel from './storageModel';

// Enhanced logging utility
class FinanceLogger {
    constructor() {
        this.initialize();
    }

    initialize() {
        const logs = JSON.parse(localStorage.getItem('finance_logs') || '[]');
        if (!Array.isArray(logs)) {
            localStorage.setItem('finance_logs', JSON.stringify([]));
        }
    }

    log(event) {
        const logEntry = {
            ...event,
            timestamp: new Date().toISOString()
        };

        const logs = JSON.parse(localStorage.getItem('finance_logs') || '[]');
        logs.push(logEntry);
        localStorage.setItem('finance_logs', JSON.stringify(logs));
        console.log('[FinanceLog]', logEntry);
    }

    error(message, error, context = {}) {
        this.log({
            type: 'error',
            message,
            error: error.message || error,
            stack: error.stack,
            ...context
        });
    }
}

const logger = new FinanceLogger();

// Strict JSON-only prompt
const getGeminiPrompt = (message, context = null, accounts = null) => {
    const contextStr = context ? `Context: ${JSON.stringify(context)}` : "";
    const accountsStr = accounts ? `Accounts: ${JSON.stringify(accounts)}` : "";
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    return {
        contents: [{
            parts: [{
                text: `You are a finance assistant that MUST respond ONLY with valid JSON objects.
        You can return multiple actions in a single response if needed.

        Available actions:
        1. add_transaction
        2. create_account
        3. delete_account
        4. ask_user
        5. get_accounts

        Current date: ${formattedDate}
        Current accounts: ${accountsStr}
        User message: "${message}"

        Respond ONLY with a JSON object matching one of these schemas:

        For single action:
        {
          "action": "action_name",
          ...action_specific_fields
        }

        OR for multiple actions:
        {
          "actions": [
            {
              "action": "action_name",
              ...action_specific_fields
            },
            {
              "action": "another_action",
              ...action_specific_fields
            }
          ]
        }

        Action schemas:

        add_transaction:
        {
          "action": "add_transaction",
          "accountId": "string",
          "type": "income|expense",
          "amount": number,
          "category": "string",
          "date": "YYYY-MM-DD",
          "note": "string",
          "isFriendPayment": boolean // Add this field
        }


        create_account:
        {          "action": "create_account",
          "accountName": "string" // Name of the new account
        }

        Important rules:
        0. You must give array of actions in the response, even if it's a single action.
        1. For a withdrawal from one of your accounts to another of your accounts, use TWO add_transaction actions:
           - One with type "expense" for the source account
           - One with type "income" for the destination account
           - Set "isFriendPayment": false for both
        2. For a payment to a friend:
           - Use ONE add_transaction action with type "expense"
           - Set "isFriendPayment": true
           - The note should clearly indicate it's a payment to a friend
        3. When the user mentions "friend" in the message, assume it's a payment to a friend unless they explicitly say it's a transfer between their own accounts
        4. For any transaction where the destination is not clearly one of the user's accounts, treat it as a payment to a friend`
            }]
        }]
    };
};




// Enhanced controller with better error handling
export async function handleFinanceChat(userMessage, chatHistory = []) {
    try {
        logger.log({
            type: 'chat_start',
            userMessage,
            chatHistoryLength: chatHistory.length
        });

        let accounts = storageModel.getAccounts();
        const context = chatHistory.slice(-5);
        let loopCount = 0;
        const maxLoops = 3;

        // Helper functions
        const accountExists = (id) => {
            const allAccounts = accounts || storageModel.getAccounts();
            return allAccounts.some(acc => String(acc.id) === String(id));
        };

        const getAccountName = (id) => {
            const account = accounts.find(acc => String(acc.id) === String(id));
            return account ? account.name : id;
        };

        while (loopCount < maxLoops) {
            loopCount++;
            const prompt = getGeminiPrompt(userMessage, context, accounts);

            try {
                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBYGcNPmwiakoc03KXGZkTXW-btfGt_itk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(prompt),
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const data = await response.json();
                const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!rawText) {
                    throw new Error("Empty response from API");
                }

                // Parse the response
                let parsed;
                try {
                    // First try to parse as-is
                    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
                    parsed = jsonMatch ? JSON.parse(jsonMatch[1].trim()) : JSON.parse(rawText.trim());
                } catch (e) {
                    logger.error("Failed to parse JSON response", e, { rawText });
                    return {
                        chat: "❗ I received an invalid response. Please try again.",
                        error: true
                    };
                }

                logger.log({
                    type: 'ai_response',
                    parsed,
                    loopCount
                });

                if (!parsed) {
                    return {
                        chat: "❗ I couldn't understand that. Please try rephrasing.",
                        note: "Invalid response format"
                    };
                }

                // Handle multiple actions if present
                const actions = parsed.actions ? parsed.actions : [parsed];

                // Process each action
                // In the handleFinanceChat function, where actions are processed:
                const results = [];
                for (const action of actions) {
                    try {
                        switch (action.action) {
                            case "add_transaction":
                                // For transfers between accounts, we might have multiple add_transaction actions
                                if (Array.isArray(action)) {
                                    // Handle array of transactions (for transfers)
                                    for (const tx of action) {
                                        const result = await handleAddTransaction(tx, accounts, accountExists, getAccountName);
                                        results.push(result);
                                    }
                                } else {
                                    // Handle single transaction
                                    const result = await handleAddTransaction(action, accounts, accountExists, getAccountName);
                                    results.push(result);
                                }
                                break;
                            case "create_account":
                                if (!action.accountName || typeof action.accountName !== 'string' || action.accountName.trim() === '') {
                                    results.push({
                                        chat: "❗ Please provide a valid account name to create an account."
                                    });
                                    break;
                                }
                                // Prevent duplicate account names (optional, can remove if not needed)
                                if (accounts.some(a => a.name.toLowerCase() === action.accountName.trim().toLowerCase())) {
                                    results.push({
                                        chat: `❗ An account named "${action.accountName}" already exists.`
                                    });
                                    break;
                                }
                                const updated = storageModel.addAccount(action.accountName.trim());
                                const newAccount = updated[0];
                                results.push({
                                    chat: `🆕 Account "${action.accountName}" created successfully! (ID: ${newAccount.id})`,
                                    account: newAccount
                                });
                                // Update accounts for subsequent actions in this loop
                                accounts = updated;
                                break;
                            // ... other cases remain the same
                        }
                    } catch (e) {
                        logger.error("Error processing action", e, { action });
                        results.push({
                            chat: `❗ Error processing action: ${e.message || "Unknown error"}`,
                            error: true
                        });
                    }
                }


                // Combine all results into a single response
                const successfulResults = results.filter(r => !r.error);
                if (successfulResults.length > 0) {
                    return {
                        chat: successfulResults.map(r => r.chat).join("\n\n")
                    };
                } else {
                    return {
                        chat: results[0]?.chat || "❗ Sorry, I couldn't complete any of the requested actions."
                    };
                }

            } catch (e) {
                logger.error("Error processing message", e);
                return {
                    chat: "❗ An error occurred while processing your request.",
                    error: true
                };
            }
        }

        return { chat: "❗ Sorry, I couldn't complete your request after several tries." };
    } catch (e) {
        logger.error("Error in handleFinanceChat", e, { userMessage });
        return {
            chat: "❗ An unexpected error occurred. Please try again.",
            error: true
        };
    }
}
// Helper function for adding transactions
async function handleAddTransaction(parsed, accounts, accountExists, getAccountName) {
    if (!parsed.accountId || !accountExists(parsed.accountId)) {
        accounts = storageModel.getAccounts();
        return {
            chat: `❗ The account you specified doesn't exist. Available accounts: ${accounts.map(a => `${a.name} (ID: ${a.id})`).join(', ')}`
        };
    }

    const isIncome = parsed.type === "income" ||
        (parsed.category && parsed.category.toLowerCase().includes("salary")) ||
        (parsed.note && parsed.note.toLowerCase().includes("salary")) ||
        (parsed.note && parsed.note.toLowerCase().includes("received")) ||
        (parsed.note && parsed.note.toLowerCase().includes("deposit"));

    const isFriendPayment = parsed.isFriendPayment || false;

    const transactionDate = parsed.date ? new Date(parsed.date) : new Date();
    const formattedDate = isNaN(transactionDate.getTime()) ?
        new Date().toISOString() :
        transactionDate.toISOString();

    // For friend payments, ensure we have a clear note
    const note = isFriendPayment
        ? (parsed.note || `Payment to friend`)
        : (parsed.note || (isIncome ? "Received Salary" : ""));

    const transaction = {
        amount: parsed.amount,
        note: note,
        type: isIncome ? "credit" : "debit",
        date: formattedDate,
        isFriendPayment: isFriendPayment
    };

    storageModel.addTransaction(parsed.accountId, transaction);

    const accountName = getAccountName(parsed.accountId);
    const dateDisplay = new Date(formattedDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    if (isFriendPayment) {
        return {
            chat: `💸 Paid ₹${parsed.amount} to friend from ${accountName} on ${dateDisplay}`
        };
    } else if (isIncome) {
        return {
            chat: `💰 Added income of ₹${parsed.amount} as ${parsed.category || 'salary'} to ${accountName} on ${dateDisplay}`
        };
    } else {
        return {
            chat: `💸 Added expense of ₹${parsed.amount} for ${parsed.category || 'expense'} from ${accountName} on ${dateDisplay}`
        };
    }
}


// Helper function for transfers
// Helper function for transfers
async function handleTransfer(parsed, accounts, accountExists, getAccountName) {
    if (!parsed.fromAccountId || !parsed.toAccountId ||
        !accountExists(parsed.fromAccountId) || !accountExists(parsed.toAccountId)) {
        accounts = storageModel.getAccounts();
        if (accounts.length < 2) {
            return { chat: "❗ You need at least two accounts to make a transfer." };
        }
        return {
            chat: `❗ Please specify valid source and destination accounts. Available accounts: ${accounts.map(a => `${a.name} (ID: ${a.id})`).join(', ')}`
        };
    }

    if (parsed.fromAccountId === parsed.toAccountId) {
        return {
            chat: "❗ Cannot transfer to the same account. Please specify different accounts."
        };
    }

    if (!parsed.amount || parsed.amount <= 0) {
        return { chat: "❗ Please specify a valid amount to transfer." };
    }

    const transferDate = parsed.date ? new Date(parsed.date) : new Date();
    const formattedDate = isNaN(transferDate.getTime()) ?
        new Date().toISOString() :
        transferDate.toISOString();

    const fromAccountName = getAccountName(parsed.fromAccountId);
    const toAccountName = getAccountName(parsed.toAccountId);

    // Create debit transaction for source account (expense)
    storageModel.addTransaction(parsed.fromAccountId, {
        amount: parsed.amount,
        note: parsed.note || `Transfer to ${toAccountName}`,
        type: "debit", // This is an expense for the source account
        date: formattedDate
    });

    // Create credit transaction for destination account (income)
    storageModel.addTransaction(parsed.toAccountId, {
        amount: parsed.amount,
        note: parsed.note || `Transfer from ${fromAccountName}`,
        type: "credit", // This is an income for the destination account
        date: formattedDate
    });

    const dateDisplay = new Date(formattedDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    return {
        chat: `🔄 Transferred ₹${parsed.amount} from ${fromAccountName} to ${toAccountName} on ${dateDisplay}`
    };
}

// Helper function for account creation
async function handleCreateAccount(accountName) {
    if (!accountName || typeof accountName !== 'string' || accountName.trim() === '') {
        return { chat: "❗ Please provide a valid account name to create an account." };
    }

    const updated = storageModel.addAccount(accountName.trim());
    const newAccount = updated[0];

    return {
        chat: `🆕 Account "${accountName}" created successfully! (ID: ${newAccount.id})`,
        account: newAccount
    };
}


// Standalone functions remain the same
export async function handleAddAccount(accountName) {
    try {
        if (!accountName || typeof accountName !== 'string' || accountName.trim() === '') {
            throw new Error("Please provide a valid account name");
        }

        const updated = storageModel.addAccount(accountName.trim());
        const newAccount = updated[0];
        return {
            chat: `🆕 Account "${accountName}" created! (ID: ${newAccount.id})`,
            account: newAccount
        };
    } catch (e) {
        logger.error("Failed to add account", e, { accountName });
        return {
            chat: "❗ Failed to create account. Please try again.",
            error: true
        };
    }
}

export async function handleDeleteAccount(accountId) {
    try {
        const accounts = storageModel.getAccounts();
        if (!accountId || !accounts.some(a => String(a.id) === String(accountId))) {
            throw new Error("Account not found");
        }

        const accountName = accounts.find(a => String(a.id) === String(accountId))?.name || accountId;
        const updated = storageModel.deleteAccount(accountId);
        return {
            chat: `🗑️ Account "${accountName}" deleted successfully!`,
            accounts: updated
        };
    } catch (e) {
        logger.error("Failed to delete account", e, { accountId });
        return {
            chat: "❗ Failed to delete account. Please try again.",
            error: true
        };
    }
}
