# ViFinance

**ViFinance** is a modern, cross-platform personal finance manager built with React, Vite, Redux Toolkit, and Cordova. It helps users track expenses, manage accounts, and analyze finances through a clean interface or by using natural language commands with a built-in AI chat assistant.

All data is stored locally to ensure privacy and offline access.

---

## Features

AI Chat Assistant

* Interact using plain English or Hinglish
* Example: "Add ₹500 groceries to Savings"
* Create or delete accounts, log transactions, get summaries, and ask questions
* Powered by Gemini API

Account Management

* Create and manage multiple accounts
* Transfer funds between accounts

Transaction Tracking

* Add, edit, or delete income and expenses
* View and search transaction history

Analytics

* Visual breakdowns using Chart.js
* Filterable summaries and insights

Logs

* View system actions and errors
* Helpful for debugging and tracking

Mobile Ready

* Cordova support for Android builds
* Light and dark theme with saved preference
* Works offline with localStorage

---

## Tech Stack

Frontend: React 19, Vite, TailwindCSS

State Management: Redux Toolkit, React-Redux

Routing: React Router DOM

Charts: Chart.js (via react-chartjs-2)

Icons: Lucide React, React Icons

AI: Gemini API

Mobile: Cordova (Android supported)

---

## Project Structure

ViFinance/

├── public/ — Static assets

├── src/

│   ├── components/ — UI components

│   ├── features/ — Redux slices

│   ├── App.jsx — App root

│   ├── main.jsx — Entry point

│   ├── store.js — Redux store setup

│   ├── aiFinanceController.js — AI logic

│   └── storageModel.js — LocalStorage helpers

├── cordova/ — Cordova Android setup

├── vite.config.js — Vite configuration

└── package.json — Metadata and scripts

---

## Getting Started

Development (Web)

1. Install dependencies

   `npm install`
2. Start development server

   `npm run dev`
3. Open in browser at: [http://localhost:5173](http://localhost:5173)

Production Build (Web and Cordova)

* Run: `npm run build`
* Output will be in: `cordova/www/`

Android Build

1. Make sure Cordova CLI and Android SDK are installed
2. Go to the `cordova/` folder
3. Run:

   `cordova platform add android`

   `cordova build android`
4. APK will be in:

   `cordova/platforms/android/app/build/outputs/apk/`

---

## Customization

* Gemini API key setup: `src/aiFinanceController.js`
* Add new features via Redux slices in `src/features/`
* Update icons and splash screens in Cordova `config.xml`

---

## License

MIT
