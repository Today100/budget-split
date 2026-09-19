# 🧾 Roommate Receipt Splitter (Receipt Manager)

A full-stack, mobile-first web application designed to help roommates seamlessly manage household expenses, split receipts, and track who owes whom. Built with Next.js and Firebase, it features real-time syncing, a debt-simplification algorithm, and an intuitive 4-step receipt parsing flow.

## ✨ Features

* **🔒 Secure, Restrictable Authentication**
  * Google Sign-In via Firebase Auth.
  * Environment-variable-based whitelist to restrict access to specific household emails only.
* **🏠 Household / Group Management**
  * Create a new household or join an existing one using a secure Group ID code.
  * Real-time syncing across all devices for everyone in the group.
* **📸 Smart Receipt Processing Flow**
  * **Step 1:** Upload a PDF/image, snap a photo using mobile camera, or enter manually. (Includes Gemini AI processing states).
  * **Step 2:** Itemize the receipt with unit prices, quantities, custom tax toggles, and multi-payer support.
  * **Step 3:** Granular allocation—assign specific line items to specific roommates or split them equally.
  * **Step 4:** Automatic debt-simplification algorithm calculates the net balances (who owes who).
* **📊 Dashboard & Analytics**
  * Monthly spending summaries.
  * Real-time net balance tracker.
  * Scrollable, mobile-responsive data grid to view, edit, and delete past receipts.
* **📱 Mobile-First Design**
  * Fully responsive UI built with Tailwind CSS.
  * Optimized touch targets, horizontal scrollable tables, and native mobile camera integration.

## 📸 Screenshots

### Dashboard & Summary
<img width="720" height="364.5" alt="image" src="https://github.com/user-attachments/assets/efed23b5-cc46-4560-ab2a-74dce0eb3767" />

### Receipt Itemization
<img width="720" height="364.5" alt="image" src="https://github.com/user-attachments/assets/222d8b7c-dce8-4660-a05a-bf68df5ebe34" />

### Allocation & Splitting
<img width="720" height="364.5" alt="image" src="https://github.com/user-attachments/assets/d06b7b27-86cf-48a8-9051-0af909378062" />


## 🛠️ Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) (React), TypeScript
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Backend/Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore) (NoSQL)
* **Authentication:** [Firebase Auth](https://firebase.google.com/docs/auth) (Google Provider)
* **Hosting:** [Vercel](https://vercel.com/) (Recommended)

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* A Firebase Project with Firestore and Google Auth enabled.

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/receipt-manager.git](https://github.com/yourusername/receipt-manager.git)
cd receipt-manager
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Firebase configuration and whitelisted emails:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Comma-separated list of allowed Google account emails
NEXT_PUBLIC_ALLOWED_EMAILS="user1@gmail.com,user2@gmail.com"
```

### 4. Run the development server

```bash
npm run dev
```
Open http://localhost:3000 in your browser.

### Database Structure (Firestore)

- `groups`: Stores household data, join codes, and member UIDs.

- `receipts`: Stores individual receipt documents, linked to a groupId. Contains line items, allocation data, and calculated settlements.
