# PayFlow AI — Autonomous PayPal Payment Assistant for Small Businesses

> **Built for the PayPal AI Hackathon: "Build What's Next with PayPal and AI"**  
> PayFlow AI allows small business owners and freelancers to manage their entire PayPal payment lifecycle using conversational natural language AI. It bridges Gemini AI intelligence with PayPal Sandbox REST APIs.

---

## 🌟 The Core Flow (Hackathon Architecture)
```text
User / Voice / Text
       │
       ▼
[ Gemini 3.8 Flash Engine ] ──► Understands Business Intent & Context
       │
       ▼
[ PayPal Sandbox REST API ] ──► Creates Orders / Generates Links / Captures Settlement
       │
       ▼
[ PayFlow Data Store ]      ──► Updates Transactions & Outstanding Customer Debts
       │
       ▼
[ AI Insights & Anomaly ]   ──► Flag Unusually Large Transactions & Recommends Next Actions
```

---

## 🚀 Key Features

1. **AI Payment Assistant (Voice + Text + Autonomous Agent)**:
   - Real-time **Speech-to-Text Voice Commands** (tap the microphone icon to speak commands in natural language).
   - Understands commands like:
     - *"Show my pending payments"*
     - *"How much did I earn this month?"*
     - *"Create a ₹5000 payment request for Rahul"*
     - *"Collect all pending payments"* (Autonomous multi-step agent workflow)
     - *"Show my biggest transactions"*
     - *"Which customers are overdue?"*
   - Never executes financial operations without explicit user confirmation.

2. **Enterprise Tax Invoices & Print/PDF Engine**:
   - Itemized line items with automatic GST / VAT calculation (0%, 5%, 12%, 18%, 28%).
   - Payment terms (Due on Receipt, Net 15, Net 30, Net 60).
   - Printable, official tax invoice sheet with merchant branding and sequential numbering (`INV-2026-001`).
   - Embeds instant PayPal payment links and printable PayPal QR codes.

3. **Dynamic PayPal Payment QR Codes & 1-Click WhatsApp Dispatch**:
   - Instant QR codes generated on-the-fly for any payment request or invoice.
   - 1-click **Share on WhatsApp** with pre-composed courteous message and direct checkout URL.
   - Save / Download QR Code PNG image for customer scanning.

4. **30-Day Predictive Cash Flow Forecasting**:
   - AI liquidity projection model estimating collections over 7, 14, 21, and 30 days.
   - Models debtor payment history and past settlement velocity to calculate confidence scores (89%+).
   - Warns against upcoming operational cash shortfalls.

5. **PayPal Webhook Event Auditor & Live Simulator**:
   - Real-time webhook stream auditing incoming PayPal asynchronous notifications:
     - `PAYMENT.CAPTURE.COMPLETED`
     - `PAYMENT.CAPTURE.DENIED`
     - `CHECKOUT.ORDER.APPROVED`
     - `CUSTOMER.DISPUTE.CREATED`
     - `PAYMENT.CAPTURE.REFUNDED`
   - Interactive simulator allowing judges to trigger test webhook events to observe live reconciliation.

6. **PayPal Refunds & Dispute Risk Engine**:
   - Merchant refund workflow: allows issuing full or partial refunds on settled transactions.
   - Automated balance adjustment and webhook event dispatch.

7. **PayPal Sandbox REST Integration**:
   - Order creation (`POST /v2/checkout/orders`) with intent `CAPTURE`
   - Order capture (`POST /v2/checkout/orders/{id}/capture`)
   - Interactive Sandbox Checkout modal supporting PayPal Wallet & Card simulation
   - Real-time receipt breakdown with PayPal Order ID and capture confirmation.

8. **Smart Business Dashboard**:
   - Live metric cards: Total Revenue, Pending Receivables, Successful Settlements, Failed Attempts, Active Clients, Average Order Value.
   - Monthly Revenue Area Chart (Recharts)
   - Payment Status Donut Chart (Recharts)
   - Recent Transactions ledger with status badges.

9. **AI Pending Payment Detection**:
   - Identifies overdue debtors with days-past-due calculations (e.g., Rahul: ₹5,000, 12 days; Aman: ₹2,500, 7 days; Priya: ₹1,800, 3 days).
   - Priority scoring (High, Medium, Low).
   - 1-click AI Reminder generation or PayPal direct checkout.

10. **AI Payment Reminders**:
   - Generates polite, persuasive, professional invoice reminders powered by Gemini 3.8 Flash.
   - Interactive options: Generate, Edit, Copy to Clipboard, and Send.

11. **AI Anomaly Detection**:
   - Flags out-of-pattern or unusually high transactions (e.g., ₹24,500 enterprise cloud transaction that is 314% higher than normal ticket size).

12. **Client Management Directory**:
   - Complete client roster with contact details, lifetime paid volume, current liabilities, and past transaction drawer.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Recharts, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, TypeScript (tsx)
- **AI Model**: Google Gemini API (`@google/genai` with `gemini-3.8-flash`)
- **Payments**: PayPal Sandbox REST APIs (Order creation, Checkout, and Capture)
- **Auth**: JWT Authentication with instant Hackathon Demo access
- **Database**: Persistent JSON document store with MongoDB-compatible schema (can be connected to MongoDB Atlas via `MONGODB_URI`)

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```bash
# Gemini AI API Key (Injected automatically in AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# App URL
APP_URL="http://localhost:3000"

# PayPal Sandbox Credentials (from developer.paypal.com)
PAYPAL_CLIENT_ID="your-paypal-sandbox-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-sandbox-client-secret"
PAYPAL_ENVIRONMENT="sandbox"

# Security & Authentication
JWT_SECRET="payflow-ai-super-secret-jwt-key"

# Optional MongoDB Connection (uses persistent JSON store by default)
MONGODB_URI="mongodb://localhost:27017/payflow_ai"
```

---

## 🏃 Local Setup & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 💳 PayPal Sandbox Setup Instructions

1. Head to [PayPal Developer Portal](https://developer.paypal.com).
2. Log in and navigate to **Dashboard > Apps & Credentials**.
3. Toggle to **Sandbox** mode and click **Create App**.
4. Copy the **Client ID** and **Secret**.
5. Paste them in `.env` or in the **Settings** panel inside PayFlow AI.
6. To test payments, use default sandbox accounts under **Sandbox > Accounts** (or test cards provided by PayPal).

---

## 🚢 Deployment Instructions

### Vercel + Render
1. **Frontend on Vercel**: Connect Git repo, set build command `npm run build`, output directory `dist`.
2. **Backend on Render**: Set start command `npm start`, environment Node.js. Provide `GEMINI_API_KEY`, `PAYPAL_CLIENT_ID`, and `PAYPAL_CLIENT_SECRET` in Render Environment Variables.

---

## 📜 License
Apache-2.0 License. Built for the PayPal AI Hackathon 2026.
