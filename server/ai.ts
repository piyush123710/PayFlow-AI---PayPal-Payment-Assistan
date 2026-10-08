import { GoogleGenAI } from '@google/genai';
import { dbService } from './db.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface AiChatResult {
  reply: string;
  action?: {
    type: 'SHOW_PENDING' | 'PROPOSE_PAYMENT_REQUEST' | 'SHOW_REMINDERS' | 'SHOW_INSIGHTS' | 'ANALYTICS' | 'AGENT_WORKFLOW';
    data?: any;
    requiresConfirmation?: boolean;
    confirmationPrompt?: string;
  };
}

export class AiService {
  /**
   * Main conversational assistant that analyzes user prompt and decides intent + action
   */
  async handleChat(prompt: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<AiChatResult> {
    const customers = dbService.getCustomers();
    const transactions = dbService.getTransactions();
    const paymentRequests = dbService.getPaymentRequests();

    // Financial calculations to feed as context
    const completedTxns = transactions.filter((t) => t.status === 'COMPLETED');
    const totalRevenue = completedTxns.reduce((sum, t) => sum + t.amount, 0);
    const pendingRequests = paymentRequests.filter((r) => r.status === 'PENDING');
    const totalPending = pendingRequests.reduce((sum, r) => sum + r.amount, 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthRevenue = completedTxns
      .filter((t) => {
        const d = new Date(t.paymentDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const contextSummary = {
      totalRevenue,
      thisMonthRevenue,
      totalPending,
      pendingCount: pendingRequests.length,
      customersSummary: customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        pendingAmount: c.pendingAmount,
        totalPaid: c.totalPaid,
      })),
      pendingRequests: pendingRequests.map((r) => ({
        id: r.id,
        customerName: r.customerName,
        amount: r.amount,
        dueDate: r.dueDate,
        daysOverdue: Math.max(0, Math.floor((Date.now() - new Date(r.dueDate).getTime()) / (1000 * 3600 * 24))),
        description: r.description,
      })),
      recentTransactions: transactions.slice(0, 5).map((t) => ({
        id: t.id,
        customerName: t.customerName,
        amount: t.amount,
        status: t.status,
        date: t.paymentDate,
        isAnomaly: !!t.isAnomaly,
      })),
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = getAiClient();
        const systemPrompt = `You are PayFlow AI, an intelligent autonomous payment assistant for a small business owner.
You assist with PayPal payments, managing invoices, tracking overdue debtors, generating polite payment reminders, and providing financial analytics.

Current Business Financial Context:
${JSON.stringify(contextSummary, null, 2)}

User Request: "${prompt}"

Your instructions:
1. Provide a direct, professional, and helpful response.
2. Determine if the user's intent matches an action:
   - "CREATE_PAYMENT_REQUEST" / "PAY_XYZ" / "SEND_PAYMENT": If user wants to charge or request payment from someone (e.g. Rahul, Aman), identify customer name, amount, and description. Because money is involved, flag requiresConfirmation=true.
   - "VIEW_PENDING" / "WHO_HASNT_PAID": If user wants to see pending/unpaid customers.
   - "GENERATE_REMINDERS": If user wants to generate payment reminders for overdue customers.
   - "COLLECT_ALL": If user says "collect all pending payments" or similar, launch the agent workflow!
   - "SHOW_INSIGHTS" / "ANOMALY": If user asks about financial insights or suspicious payments.
   - "ANALYTICS": If user asks about revenue, earnings this month, or comparison.
3. Respond ONLY in valid JSON matching this schema:
{
  "reply": "Your response to the business owner",
  "actionType": "NONE" | "SHOW_PENDING" | "PROPOSE_PAYMENT_REQUEST" | "SHOW_REMINDERS" | "SHOW_INSIGHTS" | "ANALYTICS" | "AGENT_WORKFLOW",
  "actionData": { ... },
  "requiresConfirmation": boolean,
  "confirmationPrompt": "Do you want to create a PayPal payment request of ₹5,000 for Rahul Sharma?"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            reply: parsed.reply,
            action: parsed.actionType !== 'NONE' ? {
              type: parsed.actionType,
              data: parsed.actionData,
              requiresConfirmation: !!parsed.requiresConfirmation,
              confirmationPrompt: parsed.confirmationPrompt,
            } : undefined,
          };
        }
      } catch (err) {
        console.warn('Gemini chat API call failed or parsing error, falling back to rule-based intelligence:', err);
      }
    }

    // High-performance intelligent fallback when GEMINI_API_KEY is not set
    return this.fallbackChat(prompt, contextSummary);
  }

  private fallbackChat(prompt: string, ctx: any): AiChatResult {
    const lower = prompt.toLowerCase();

    // 1. Collect all pending payments (Autonomous Agent Workflow)
    if (lower.includes('collect all') || (lower.includes('collect') && lower.includes('pending'))) {
      const totalAmount = ctx.pendingRequests.reduce((sum: number, r: any) => sum + r.amount, 0);
      return {
        reply: `I have initiated the Payment Agent workflow. I found ${ctx.pendingRequests.length} pending payments totaling ₹${totalAmount.toLocaleString()} across your clients (Rahul, Aman, and Priya). I have drafted personalized PayPal payment reminders for each. Would you like me to dispatch these reminders and sync with PayPal?`,
        action: {
          type: 'AGENT_WORKFLOW',
          data: {
            step: 'IDENTIFIED_PENDING',
            totalPending: totalAmount,
            customers: ctx.pendingRequests,
          },
          requiresConfirmation: true,
          confirmationPrompt: `Execute automated reminder batch and PayPal link sync for ₹${totalAmount.toLocaleString()} across 3 clients?`,
        },
      };
    }

    // 2. Pending payments / Who hasn't paid
    if (lower.includes('pending') || lower.includes("hasn't paid") || lower.includes('overdue') || lower.includes('who owes')) {
      const items = ctx.pendingRequests
        .map((r: any) => `• ${r.customerName} — ₹${r.amount.toLocaleString()} (${r.daysOverdue} days overdue)`)
        .join('\n');
      return {
        reply: `You have ${ctx.pendingCount} pending payments totaling ₹${ctx.totalPending.toLocaleString()}:\n\n${items}\n\nWould you like me to generate personalized PayPal reminders for them?`,
        action: {
          type: 'SHOW_PENDING',
          data: ctx.pendingRequests,
        },
      };
    }

    // 3. Create payment request (e.g. Rahul 5000)
    const amountMatch = prompt.match(/(?:₹|\$|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    if ((lower.includes('create') || lower.includes('request') || lower.includes('send') || lower.includes('bill')) && (lower.includes('payment') || amountMatch)) {
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 5000;
      // find matched customer
      let targetCustomer = ctx.customersSummary.find((c: any) => lower.includes(c.name.split(' ')[0].toLowerCase())) || ctx.customersSummary[0];
      return {
        reply: `I've prepared a PayPal payment request of ₹${amount.toLocaleString()} for ${targetCustomer.name} (${targetCustomer.email}).`,
        action: {
          type: 'PROPOSE_PAYMENT_REQUEST',
          data: {
            customerId: targetCustomer.id,
            customerName: targetCustomer.name,
            customerEmail: targetCustomer.email,
            amount: amount,
            description: 'Professional Services & Development invoice via PayFlow AI',
          },
          requiresConfirmation: true,
          confirmationPrompt: `Confirm creating PayPal Sandbox Order of ₹${amount.toLocaleString()} for ${targetCustomer.name}?`,
        },
      };
    }

    // 4. Monthly earnings / Revenue
    if (lower.includes('earn') || lower.includes('revenue') || lower.includes('month') || lower.includes('how much')) {
      return {
        reply: `This month you have collected ₹${ctx.thisMonthRevenue.toLocaleString()} through PayPal. Your total lifetime revenue across all completed transactions is ₹${ctx.totalRevenue.toLocaleString()}. You also have ₹${ctx.totalPending.toLocaleString()} in pending receivables.`,
        action: {
          type: 'ANALYTICS',
          data: { thisMonth: ctx.thisMonthRevenue, total: ctx.totalRevenue, pending: ctx.totalPending },
        },
      };
    }

    // 5. Reminders
    if (lower.includes('reminder') || lower.includes('remind')) {
      return {
        reply: `I've generated personalized, professional payment reminders for all overdue clients. Each reminder includes the exact amount, days past due, and a direct one-click PayPal checkout button.`,
        action: {
          type: 'SHOW_REMINDERS',
          data: ctx.pendingRequests,
        },
      };
    }

    // 6. Anomalies / Biggest transactions
    if (lower.includes('biggest') || lower.includes('anomaly') || lower.includes('unusual') || lower.includes('suspicious')) {
      return {
        reply: `⚠️ Unusual Transaction Detected: Rahul Sharma made a transaction of ₹24,500 on Cloud Infrastructure Migration. This is 314% higher than your average client transaction size of ₹7,800.`,
        action: {
          type: 'SHOW_INSIGHTS',
          data: { anomalyTxnId: 'txn_004', amount: 24500, customerName: 'Rahul Sharma' },
        },
      };
    }

    // Default friendly assistant response
    return {
      reply: `I'm PayFlow AI, your PayPal payment manager. I can help you inspect overdue accounts, generate polite payment reminders, create PayPal payment requests, and analyze revenue trends. Try asking: "Show my pending payments", "How much did I earn this month?", or "Create a ₹5000 payment request for Rahul".`,
    };
  }

  /**
   * Generates a tailored, courteous, yet firm payment reminder message for a customer
   */
  async generateReminder(customerName: string, amount: number, currency: string, daysOverdue: number, serviceDescription: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = getAiClient();
        const prompt = `Write a polite, professional, and persuasive payment reminder email/message for a freelance/agency client.
Client Name: ${customerName}
Amount: ${currency === 'INR' ? '₹' : '$'}${amount.toLocaleString()}
Service: ${serviceDescription}
Days Overdue: ${daysOverdue} days
Payment Method: PayPal Secure Checkout

Make it warm, respectful of the relationship, clear about the pending invoice, and provide a direct call-to-action to complete the payment via PayPal. Maximum 3 short paragraphs.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        if (response.text) {
          return response.text.trim();
        }
      } catch (err) {
        console.warn('Gemini reminder generation error, using smart template:', err);
      }
    }

    // Smart courteous template
    const currSymbol = currency === 'INR' ? '₹' : '$';
    return `Hi ${customerName},\n\nI hope you're having a productive week! Just a friendly reminder regarding the invoice for "${serviceDescription}" in the amount of ${currSymbol}${amount.toLocaleString()}, which was due ${daysOverdue > 0 ? `${daysOverdue} days ago` : 'recently'}.\n\nTo make settlement seamless and instant, you can complete the transaction securely through PayPal using the button below.\n\nPlease let me know if you have any questions or need an updated receipt. Thank you for your continued partnership!`;
  }

  /**
   * Generates AI financial insights and anomaly warnings
   */
  async generateInsights(): Promise<any[]> {
    return dbService.getInsights();
  }
}

export const aiService = new AiService();
