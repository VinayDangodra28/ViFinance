# ViFinance

A modern, cross-platform personal finance manager built with React, Vite, Redux Toolkit, and Cordova. **ViFinance features an advanced AI-powered chat assistant** that lets you manage your finances using natural language, making personal finance effortless and interactive.

---

## Features
- **AI Chat Assistant:**
  - Interact with your finances using natural language (e.g., "Add ₹500 groceries to account Savings").
  - Powered by Gemini API for smart, context-aware responses.
  - Supports account creation, transaction logging, analytics queries, and more—all via chat.
  - AI can summarize actions, answer questions, and guide you through finance tasks.
- **Account Management:** Create, delete, and manage multiple accounts.
- **Transactions:** Add, edit, and delete transactions (income/expense) for each account.
- **Analytics:** Visualize your finances with charts and analytics (powered by Chart.js).
- **Dark Mode:** Toggle dark/light mode, with persistent preference.
- **Logs:** View a log of all actions and errors for transparency and debugging.
- **Mobile Ready:** Cordova integration for Android builds, with proper splash and icon support.
- **Persistent Storage:** All data is stored in localStorage for privacy and offline use.

## AI Technology
- **Conversational Finance:** The built-in chat assistant understands and executes finance commands in plain English (or Hinglish!).
- **Smart Actions:** The AI can:
  - Add or delete accounts and transactions
  - Transfer funds between accounts
  - Summarize balances and recent activity
  - Answer questions about your spending, income, and more
- **Gemini API Integration:** All chat intelligence is powered by Google Gemini, ensuring fast, accurate, and context-aware responses.
- **Seamless Redux Integration:** AI actions update your app state instantly—no refresh needed.

## Tech Stack
- **Frontend:** React 19, Vite, TailwindCSS
- **State Management:** Redux Toolkit, React-Redux
- **Routing:** React Router DOM
- **Charts:** Chart.js, react-chartjs-2
- **UI:** TailwindCSS, React Icons, Lucide React
- **AI:** Gemini API integration for chat assistant
- **Mobile:** Cordova (Android platform supported)

## Project Structure
```
ViFinance/
├── public/                # Static assets (icons, splash, etc.)
├── src/                   # React source code
│   ├── components/        # All React components (Account, Analytics, Chat, etc.)
│   ├── features/          # Redux slices (accounts, darkMode)
│   ├── assets/            # Images, SVGs, etc.
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Entry point
│   ├── store.js           # Redux store setup
│   ├── aiFinanceController.js # AI chat logic
│   └── storageModel.js    # LocalStorage helpers
├── cordova/               # Cordova project (Android platform, config.xml, etc.)
├── package.json           # Project metadata and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## Usage

### Development (Web)
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the dev server:
   ```sh
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production (Web)
```sh
npm run build
```
Output will be in `cordova/www/` for Cordova compatibility.

### Cordova (Android)
1. Make sure you have Android Studio and Cordova CLI installed.
2. Build the web app:
   ```sh
   npm run build
   ```
3. In the `cordova/` directory, add the Android platform if not already:
   ```sh
   cordova platform add android
   ```
4. Build the Android app:
   ```sh
   cordova build android
   ```
5. The APK will be in `cordova/platforms/android/app/build/outputs/apk/`.

### Icons & Splash
- All app icons and splash screens are PNGs, placed in the correct Android `mipmap-*` folders and referenced in `config.xml`.
- No SVGs are used for Android icons (SVGs are not supported).

## Customization
- **AI Chat:** Configure your Gemini API key in `aiFinanceController.js`.
- **Add new features:** Use Redux Toolkit for new state slices, and add new components in `src/components/`.

## License
MIT

---

**Made with ❤️ using React, Vite, Redux, Cordova, and Gemini AI.**
