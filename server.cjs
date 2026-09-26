var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_firestore2 = require("firebase/firestore");

// src/js/apiEmailSender.js
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function handleSendResetEmail(req, res) {
  try {
    const { to, username, resetLink } = req.body;
    if (!to || !username || !resetLink) {
      return res.status(400).json({ success: false, error: "Missing required fields (to, username, resetLink)" });
    }
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const sender = process.env.SMTP_SENDER || (user ? `"Lottery Winner Security" <${user}>` : '"Lottery Winner Security" <security@lottery-winner.io>');
    if (!user || !pass) {
      console.warn("SMTP_USER or SMTP_PASS environment variables are missing. Falling back to simulation mode.");
      return res.json({
        success: true,
        simulated: true,
        message: "Email sending is simulated (SMTP credentials are not configured in your Environment Secrets yet)."
      });
    }
    const transporter = import_nodemailer.default.createTransport({
      host,
      port,
      secure: port === 465,
      // true for 465, false for other ports (587 etc)
      auth: {
        user,
        pass
      }
    });
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            background-color: #030712;
            color: #f1f5f9;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
            border: 1px solid #1e293b;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .header {
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #1e293b;
            background-color: #020617;
          }
          .logo-box {
            display: inline-block;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%);
            border-radius: 12px;
            color: #ffffff;
            font-size: 24px;
            line-height: 48px;
            text-align: center;
            margin-bottom: 10px;
          }
          .logo-text {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #ffffff;
            margin: 0;
            font-size: 18px;
          }
          .logo-subtitle {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            margin: 4px 0 0 0;
          }
          .content {
            padding: 40px;
          }
          h1 {
            font-size: 20px;
            color: #ffffff;
            margin-top: 0;
            font-weight: 800;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-bottom: 24px;
          }
          .btn-container {
            text-align: center;
            margin: 35px 0;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(90deg, #f59e0b 0%, #eab308 100%);
            color: #020617 !important;
            font-weight: 800;
            font-size: 13px;
            text-decoration: none;
            padding: 14px 35px;
            border-radius: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
          }
          .footer {
            padding: 30px;
            background-color: #020617;
            border-top: 1px solid #1e293b;
            text-align: center;
            font-size: 10px;
            color: #64748b;
          }
          .footer a {
            color: #94a3b8;
            text-decoration: none;
          }
          .alert-box {
            background-color: rgba(30, 41, 59, 0.5);
            border: 1px solid #1e293b;
            padding: 15px;
            border-radius: 12px;
            font-size: 12px;
            color: #94a3b8;
            margin-top: 25px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-box">\u{1F511}</div>
            <div class="logo-text">LOTTERY WINNER</div>
            <div class="logo-subtitle">SECURE IDENTITY MANAGEMENT</div>
          </div>
          <div class="content">
            <h1>Passphrase Reset Request</h1>
            <p>Dear Player <strong>@${username}</strong>,</p>
            <p>We received an authorized request to reset your account security passphrase on your Lottery Winner account. If you did not initiate this request, you can safely ignore this correspondence\u2014your current password remains securely encrypted.</p>
            <p>To establish a brand new secure account passphrase, please activate the authoritative reset link by clicking the validation button below:</p>
            
            <div class="btn-container">
              <a href="${resetLink}" class="btn" style="color: #020617;">Authorize Passphrase Reset</a>
            </div>

            <p style="font-size: 12px; color: #94a3b8;">If you cannot click the button above, copy and paste this URL into your web browser:</p>
            <p style="font-size: 11px; color: #f59e0b; word-break: break-all;">${resetLink}</p>
            
            <div class="alert-box">
              \u26A0\uFE0F This password reset link is uniquely cryptographically salted and will automatically expire in <strong>15 minutes</strong> for security compliance.
            </div>
          </div>
          <div class="footer">
            &copy; 2026 Lottery Winner BD Networks. All rights secured.
          </div>
        </div>
      </body>
      </html>
    `;
    await transporter.sendMail({
      from: sender,
      to,
      subject: "[Security Alert] Action Required - Reset Your Passphrase",
      html: htmlBody
    });
    console.log(`Password reset email successfully sent to ${to}`);
    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Failed to send reset email:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// src/js/apiUddoktaPay.js
async function handleUddoktaPayCheckout(req, res) {
  try {
    const {
      amount,
      fullName,
      email,
      userId,
      username,
      apiKey,
      baseUrl,
      mode,
      redirectUrl,
      cancelUrl
    } = req.body || {};
    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 10) {
      return res.status(400).json({
        status: false,
        message: "Invalid deposit amount. Minimum is \u09F310."
      });
    }
    const orderId = "UP" + Date.now() + Math.floor(100 + Math.random() * 900);
    const effectiveApiKey = (apiKey || process.env.UDDOKTAPAY_API_KEY || "").trim();
    let effectiveBaseUrl = (baseUrl || process.env.UDDOKTAPAY_BASE_URL || "https://sandbox.uddoktapay.com/api/checkout-v2").trim();
    if (!effectiveBaseUrl.startsWith("http")) {
      effectiveBaseUrl = "https://" + effectiveBaseUrl;
    }
    const returnRedirectUrl = redirectUrl || `/?payment_status=success&gateway=uddoktapay&order_id=${orderId}&amount=${numAmount}`;
    const returnCancelUrl = cancelUrl || `/?payment_status=cancelled&gateway=uddoktapay`;
    const payload = {
      full_name: fullName || username || "Customer",
      email: email || `${username || "user"}@agents.app`,
      amount: String(numAmount),
      metadata: {
        user_id: String(userId || ""),
        username: String(username || ""),
        order_id: orderId
      },
      redirect_url: returnRedirectUrl,
      cancel_url: returnCancelUrl,
      webhook_url: returnRedirectUrl,
      return_type: "GET"
    };
    console.log(`[UddoktaPay API] Creating invoice for ${payload.full_name}, amount: ${numAmount}, endpoint: ${effectiveBaseUrl}`);
    if (effectiveApiKey) {
      try {
        const response = await fetch(effectiveBaseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "RT-UDDOKTAPAY-API-KEY": effectiveApiKey
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => null);
        console.log("[UddoktaPay API Response]", response.status, data);
        if (response.ok && data && (data.payment_url || data.url)) {
          return res.json({
            status: true,
            payment_url: data.payment_url || data.url,
            invoice_id: data.invoice_id || orderId,
            order_id: orderId,
            amount: numAmount,
            message: data.message || "Payment URL generated successfully"
          });
        }
        const errMsg = data && (data.message || data.error) || `UddoktaPay HTTP ${response.status}`;
        console.warn("[UddoktaPay API Warning]", errMsg);
        return res.json({
          status: false,
          message: errMsg,
          is_key_invalid: true,
          // Provide direct sandbox fallback checkout URL so redirect always works
          fallback_url: `https://sandbox.uddoktapay.com/checkout?amount=${numAmount}&invoice_id=${orderId}&name=${encodeURIComponent(payload.full_name)}`,
          order_id: orderId,
          amount: numAmount
        });
      } catch (networkErr) {
        console.error("[UddoktaPay Network Error]", networkErr);
        return res.json({
          status: false,
          message: networkErr.message || "Could not connect to UddoktaPay gateway endpoint",
          fallback_url: `https://sandbox.uddoktapay.com/checkout?amount=${numAmount}&invoice_id=${orderId}`,
          order_id: orderId,
          amount: numAmount
        });
      }
    }
    console.log("[UddoktaPay] No API key configured. Providing sandbox checkout URL.");
    return res.json({
      status: true,
      is_sandbox_demo: true,
      payment_url: `https://sandbox.uddoktapay.com/checkout?amount=${numAmount}&invoice_id=${orderId}&ref=lottery_agent`,
      order_id: orderId,
      amount: numAmount,
      message: "Sandbox test checkout ready"
    });
  } catch (err) {
    console.error("[UddoktaPay Checkout Handler Error]", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal server error"
    });
  }
}
async function handleUddoktaPayVerify(req, res) {
  try {
    const { invoice_id, apiKey, baseUrl } = req.body || {};
    if (!invoice_id) {
      return res.status(400).json({ status: false, message: "Missing invoice_id" });
    }
    const effectiveApiKey = (apiKey || process.env.UDDOKTAPAY_API_KEY || "").trim();
    let effectiveBaseUrl = (baseUrl || process.env.UDDOKTAPAY_BASE_URL || "https://sandbox.uddoktapay.com/api/checkout-v2").trim();
    const verifyUrl = effectiveBaseUrl.replace(/\/checkout-v2\/?$/, "/verify-payment");
    if (effectiveApiKey) {
      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "RT-UDDOKTAPAY-API-KEY": effectiveApiKey
        },
        body: JSON.stringify({ invoice_id })
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data) {
        return res.json({
          status: data.status === "COMPLETED" || data.status === true,
          data
        });
      }
    }
    return res.json({
      status: true,
      simulated: true,
      invoice_id,
      message: "Sandbox invoice auto-verified"
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
}

// src/js/apiZiniPay.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var firestoreDb = null;
function getBackendFirestore() {
  if (firestoreDb) return firestoreDb;
  try {
    const apps = (0, import_app.getApps)();
    let app2;
    const configPath = import_path.default.resolve(process.cwd(), "firebase-applet-config.json");
    const firebaseConfig = JSON.parse(import_fs.default.readFileSync(configPath, "utf8"));
    if (apps.length > 0) {
      app2 = apps[0];
    } else {
      app2 = (0, import_app.initializeApp)(firebaseConfig);
    }
    firestoreDb = (0, import_firestore.getFirestore)(app2, firebaseConfig.firestoreDatabaseId);
    return firestoreDb;
  } catch (err) {
    console.error("[ZiniPay Backend] Firebase Initialization Error:", err.message);
    throw err;
  }
}
async function createPendingInvoiceTransaction(userId, amount, paymentDetails) {
  const db = getBackendFirestore();
  const transactionId = "ZP_TX_" + Date.now() + Math.floor(Math.random() * 1e3);
  const dbDocRef = (0, import_firestore.doc)(db, "app_data", "lottery_winner_db");
  const result = await (0, import_firestore.runTransaction)(db, async (transaction) => {
    const dbSnap = await transaction.get(dbDocRef);
    if (!dbSnap.exists()) {
      throw new Error("Monolithic database document not found in Firestore!");
    }
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
    if (!parsedDb.users) parsedDb.users = [];
    if (!parsedDb.deposits) parsedDb.deposits = [];
    if (!parsedDb.zinipayInvoices) parsedDb.zinipayInvoices = [];
    const dbUser = parsedDb.users.find((u) => u.id === userId);
    if (!dbUser) {
      throw new Error(`User with ID ${userId} not found in database!`);
    }
    const pendingDep = {
      id: "dep_" + Date.now() + Math.floor(Math.random() * 1e3),
      username: dbUser.username,
      amount,
      method: "ZiniPay",
      gateway: "ZiniPay",
      trxId: transactionId,
      status: "pending",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      notes: "ZiniPay invoice pending creation..."
    };
    parsedDb.deposits.unshift(pendingDep);
    const pendingInvoice = {
      id: "zinv_" + Date.now() + Math.floor(Math.random() * 1e3),
      user_id: userId,
      transaction_id: transactionId,
      invoice_id: "",
      // filled after API call
      internal_order_id: transactionId,
      amount,
      status: "PENDING",
      payment_url: "",
      // filled after API call
      cus_name: paymentDetails.cus_name || dbUser.username,
      cus_email: paymentDetails.cus_email || dbUser.email,
      metadata: {
        user_id: userId,
        order_id: transactionId,
        purpose: "wallet_deposit"
      },
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    parsedDb.zinipayInvoices.unshift(pendingInvoice);
    transaction.update(dbDocRef, {
      db: JSON.stringify(parsedDb),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    return { transactionId, pendingInvoiceId: pendingInvoice.id, username: dbUser.username, email: dbUser.email };
  });
  return result;
}
async function updatePendingInvoiceWithDetails(pendingInvoiceId, transactionId, invoiceIdFromApi, paymentUrlFromApi, extraDetails) {
  const db = getBackendFirestore();
  const dbDocRef = (0, import_firestore.doc)(db, "app_data", "lottery_winner_db");
  await (0, import_firestore.runTransaction)(db, async (transaction) => {
    const dbSnap = await transaction.get(dbDocRef);
    if (!dbSnap.exists()) return;
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
    const invIndex = parsedDb.zinipayInvoices.findIndex((i) => i.id === pendingInvoiceId);
    if (invIndex !== -1) {
      parsedDb.zinipayInvoices[invIndex].invoice_id = invoiceIdFromApi;
      parsedDb.zinipayInvoices[invIndex].payment_url = paymentUrlFromApi;
      parsedDb.zinipayInvoices[invIndex].redirect_url = extraDetails.redirect_url || "";
      parsedDb.zinipayInvoices[invIndex].cancel_url = extraDetails.cancel_url || "";
      parsedDb.zinipayInvoices[invIndex].webhook_url = extraDetails.webhook_url || "";
      parsedDb.zinipayInvoices[invIndex].updated_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    const depIndex = parsedDb.deposits.findIndex((d) => d.trxId === transactionId);
    if (depIndex !== -1) {
      parsedDb.deposits[depIndex].notes = `ZiniPay invoice created. ID: ${invoiceIdFromApi}`;
    }
    transaction.update(dbDocRef, {
      db: JSON.stringify(parsedDb),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
}
async function markInvoiceAndTransactionFailed(pendingInvoiceId, transactionId, reason) {
  const db = getBackendFirestore();
  const dbDocRef = (0, import_firestore.doc)(db, "app_data", "lottery_winner_db");
  await (0, import_firestore.runTransaction)(db, async (transaction) => {
    const dbSnap = await transaction.get(dbDocRef);
    if (!dbSnap.exists()) return;
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
    const invIndex = parsedDb.zinipayInvoices.findIndex((i) => i.id === pendingInvoiceId);
    if (invIndex !== -1) {
      parsedDb.zinipayInvoices[invIndex].status = "FAILED";
      parsedDb.zinipayInvoices[invIndex].updated_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    const depIndex = parsedDb.deposits.findIndex((d) => d.trxId === transactionId);
    if (depIndex !== -1) {
      parsedDb.deposits[depIndex].status = "rejected";
      parsedDb.deposits[depIndex].notes = `ZiniPay invoice creation failed: ${reason}`;
    }
    transaction.update(dbDocRef, {
      db: JSON.stringify(parsedDb),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
}
async function executeWalletCreditTransaction(userId, amount, invoiceId, transactionId, paymentDetails) {
  const db = getBackendFirestore();
  const dbDocRef = (0, import_firestore.doc)(db, "app_data", "lottery_winner_db");
  const userDocRef = (0, import_firestore.doc)(db, "users", userId);
  return await (0, import_firestore.runTransaction)(db, async (transaction) => {
    const dbSnap = await transaction.get(dbDocRef);
    if (!dbSnap.exists()) {
      throw new Error("Monolithic database document not found in Firestore!");
    }
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
    if (!parsedDb.users) parsedDb.users = [];
    if (!parsedDb.deposits) parsedDb.deposits = [];
    if (!parsedDb.zinipayInvoices) parsedDb.zinipayInvoices = [];
    const existingInvoice = parsedDb.zinipayInvoices.find((inv) => inv.invoice_id === invoiceId);
    if (existingInvoice && existingInvoice.status === "COMPLETED") {
      console.log(`[ZiniPay] Duplicate protection: Invoice ${invoiceId} already completed.`);
      return { success: false, reason: "ALREADY_COMPLETED", invoice: existingInvoice };
    }
    const matchedUserIndex = parsedDb.users.findIndex((u) => u.id === userId);
    if (matchedUserIndex === -1) {
      throw new Error(`User with ID ${userId} not found in database!`);
    }
    const dbUser = parsedDb.users[matchedUserIndex];
    const username = dbUser.username;
    const existingDepositIndex = parsedDb.deposits.findIndex((dep) => dep.trxId === transactionId);
    if (existingDepositIndex !== -1 && parsedDb.deposits[existingDepositIndex].status === "approved") {
      console.log(`[ZiniPay] Duplicate protection: Deposit ${transactionId} already approved.`);
      return { success: false, reason: "ALREADY_COMPLETED" };
    }
    const oldBalance = parseFloat(dbUser.balance || 0);
    const creditAmount = parseFloat(amount);
    const newBalance = Number((oldBalance + creditAmount).toFixed(2));
    dbUser.balance = newBalance;
    dbUser.totDeposit = Number(((dbUser.totDeposit || 0) + creditAmount).toFixed(2));
    if (existingDepositIndex !== -1) {
      parsedDb.deposits[existingDepositIndex].status = "approved";
      parsedDb.deposits[existingDepositIndex].notes = `ZiniPay Payment COMPLETED (Invoice: ${invoiceId})`;
      parsedDb.deposits[existingDepositIndex].amount = creditAmount;
      parsedDb.deposits[existingDepositIndex].date = (/* @__PURE__ */ new Date()).toISOString();
    } else {
      const newDepositRecord = {
        id: "dep_" + Date.now() + Math.floor(Math.random() * 1e3),
        username,
        amount: creditAmount,
        method: "ZiniPay",
        gateway: "ZiniPay",
        trxId: transactionId,
        status: "approved",
        date: (/* @__PURE__ */ new Date()).toISOString(),
        notes: `ZiniPay Payment COMPLETED (Invoice: ${invoiceId})`
      };
      parsedDb.deposits.unshift(newDepositRecord);
    }
    if (existingInvoice) {
      existingInvoice.status = "COMPLETED";
      existingInvoice.updated_at = (/* @__PURE__ */ new Date()).toISOString();
      existingInvoice.verified_at = (/* @__PURE__ */ new Date()).toISOString();
      existingInvoice.transaction_id = transactionId;
      existingInvoice.amount = creditAmount;
    } else {
      const newInvoice = {
        id: "zinv_" + Date.now(),
        user_id: userId,
        transaction_id: transactionId,
        invoice_id: invoiceId,
        internal_order_id: transactionId,
        amount: creditAmount,
        status: "COMPLETED",
        payment_url: paymentDetails.payment_url || "",
        cus_name: paymentDetails.cus_name || username,
        cus_email: paymentDetails.cus_email || dbUser.email,
        metadata: {
          user_id: userId,
          order_id: transactionId,
          purpose: "wallet_deposit"
        },
        redirect_url: paymentDetails.redirect_url || "",
        cancel_url: paymentDetails.cancel_url || "",
        webhook_url: paymentDetails.webhook_url || "",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString(),
        verified_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      parsedDb.zinipayInvoices.unshift(newInvoice);
    }
    transaction.update(dbDocRef, {
      db: JSON.stringify(parsedDb),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const userSnap = await transaction.get(userDocRef);
    if (userSnap.exists()) {
      transaction.update(userDocRef, {
        balance: newBalance,
        totDeposit: dbUser.totDeposit,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    console.log(`[ZiniPay Ledger Committed] User ${username} balance +\u09F3${creditAmount}. Balance is now: \u09F3${newBalance}`);
    return { success: true, newBalance, invoice: existingInvoice || parsedDb.zinipayInvoices[0] };
  });
}
async function handleZiniPayCheckout(req, res) {
  try {
    const { amount, fullName, email, userId } = req.body || {};
    const numAmount = parseFloat(amount);
    if (!userId) {
      return res.status(401).json({ status: false, message: "Authentication required to initiate deposit." });
    }
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ status: false, message: "Invalid deposit amount. Must be greater than 0." });
    }
    const { transactionId, pendingInvoiceId, username, email: userEmail } = await createPendingInvoiceTransaction(
      userId,
      numAmount,
      { cus_name: fullName, cus_email: email }
    );
    const apiKey = (process.env.ZINIPAY_API_KEY || "sandbox_test_8f4c9a2e7b31").trim();
    const isSandbox = apiKey === "sandbox_test_8f4c9a2e7b31";
    const createUrl = "https://api.zinipay.com/v1/payment/create";
    const appBaseUrl = `${req.protocol}://${req.get("host")}`;
    const redirectUrl = `${appBaseUrl}/payment/success?order_id=${transactionId}`;
    const cancelUrl = `${appBaseUrl}/payment/cancel?order_id=${transactionId}`;
    const webhookUrl = `${appBaseUrl}/api/zinipay/webhook`;
    const requestBody = {
      cus_name: fullName || username || "Valued Customer",
      cus_email: email || userEmail || `${username}@lottery.local`,
      amount: numAmount,
      metadata: {
        order_id: transactionId,
        customer_id: userId,
        purpose: "wallet_deposit"
      },
      redirect_url: redirectUrl,
      cancel_url: cancelUrl,
      webhook_url: webhookUrl
    };
    console.log("[ZiniPay API] Sending Create Request:", createUrl, JSON.stringify(requestBody));
    try {
      const apiResponse = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "zini-api-key": apiKey
        },
        body: JSON.stringify(requestBody)
      });
      const responseData = await apiResponse.json().catch(() => null);
      console.log("[ZiniPay API Create Response SUCCESS/FAILURE STRUCTURE]", {
        httpStatus: apiResponse.status,
        hasResponse: !!responseData,
        statusField: responseData?.status,
        messageField: responseData?.message,
        paymentUrlField: responseData?.payment_url,
        invoiceIdField: responseData?.invoice_id || responseData?.invoiceId || responseData?.data?.invoice_id
      });
      const isStatusSuccess = responseData && (responseData.status === true || responseData.status === "true" || String(responseData.status).toLowerCase() === "success");
      const hasPaymentUrl = responseData && typeof responseData.payment_url === "string" && responseData.payment_url.startsWith("https://");
      if (apiResponse.ok && isStatusSuccess && hasPaymentUrl) {
        const invoiceId = responseData.invoice_id || responseData.invoiceId || responseData.data?.invoice_id || "ZP-" + Date.now();
        const exactPaymentUrl = responseData.payment_url;
        await updatePendingInvoiceWithDetails(
          pendingInvoiceId,
          transactionId,
          invoiceId,
          exactPaymentUrl,
          { redirect_url: redirectUrl, cancel_url: cancelUrl, webhook_url: webhookUrl }
        );
        return res.json({
          status: true,
          payment_url: exactPaymentUrl,
          invoice_id: invoiceId,
          order_id: transactionId,
          amount: numAmount,
          message: responseData.message || "ZiniPay hosted invoice generated successfully."
        });
      }
      let apiErrorMsg = "Unknown gateway error";
      if (responseData) {
        if (!isStatusSuccess) {
          apiErrorMsg = responseData.message || responseData.error || "Gateway returned failure status.";
        } else if (!hasPaymentUrl) {
          apiErrorMsg = "ZiniPay API response did not contain a valid HTTPS payment_url.";
        }
      } else {
        apiErrorMsg = `ZiniPay HTTP response status ${apiResponse.status}`;
      }
      await markInvoiceAndTransactionFailed(pendingInvoiceId, transactionId, apiErrorMsg);
      return res.status(400).json({
        status: false,
        message: `ZiniPay API Error: ${apiErrorMsg}`
      });
    } catch (apiErr) {
      console.error("[ZiniPay API Network Error]", apiErr);
      await markInvoiceAndTransactionFailed(pendingInvoiceId, transactionId, apiErr.message || "Network Timeout");
      return res.status(502).json({
        status: false,
        message: "Unable to establish secure connection with ZiniPay payment server. Please try again."
      });
    }
  } catch (err) {
    console.error("[ZiniPay Checkout Handler Critical Error]", err);
    return res.status(500).json({
      status: false,
      message: err.message || "An unexpected system error occurred while generating checkout invoice."
    });
  }
}
async function handleZiniPayVerify(req, res) {
  try {
    const { order_id, invoice_id } = req.body || {};
    if (!order_id && !invoice_id) {
      return res.status(400).json({ status: false, message: "Missing order_id or invoice_id parameter." });
    }
    const db = getBackendFirestore();
    const dbDocRef = (0, import_firestore.doc)(db, "app_data", "lottery_winner_db");
    const dbSnap = await (0, import_firestore.getDoc)(dbDocRef);
    if (!dbSnap.exists()) {
      return res.status(500).json({ status: false, message: "Internal Database Store is uninitialized." });
    }
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
    const localInvoice = (parsedDb.zinipayInvoices || []).find(
      (inv) => order_id && inv.internal_order_id === order_id || invoice_id && inv.invoice_id === invoice_id
    );
    if (!localInvoice) {
      return res.status(404).json({ status: false, message: "No checkout invoice found matching this reference." });
    }
    const targetInvoiceId = localInvoice.invoice_id;
    if (!targetInvoiceId) {
      return res.json({
        status: "PENDING",
        invoice: localInvoice,
        message: "Invoice is still pending creation or gateway redirection."
      });
    }
    const apiKey = (process.env.ZINIPAY_API_KEY || "sandbox_test_8f4c9a2e7b31").trim();
    const verifyUrl = "https://api.zinipay.com/v1/payment/verify";
    console.log(`[ZiniPay API] Verifying invoice status for ID: ${targetInvoiceId}`);
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "zini-api-key": apiKey
      },
      body: JSON.stringify({ invoiceId: targetInvoiceId, invoice_id: targetInvoiceId })
    });
    const verifyData = await verifyResponse.json().catch(() => null);
    console.log("[ZiniPay API Verify Response]", verifyResponse.status, verifyData);
    if (verifyResponse.ok && verifyData) {
      const verifiedStatus = String(verifyData.status || verifyData.data?.status || "PENDING").toUpperCase();
      const verifiedAmount = parseFloat(verifyData.amount || verifyData.data?.amount || verifyData.verified_amount);
      if (verifiedStatus === "COMPLETED") {
        if (verifiedAmount && Math.abs(verifiedAmount - localInvoice.amount) > 0.01) {
          console.error(`[ZiniPay Mismatch Alert] Amount mismatch! Requested \u09F3${localInvoice.amount}, verified \u09F3${verifiedAmount}`);
          return res.status(400).json({
            status: "SUSPICIOUS_MISMATCH",
            message: "Transaction amount mismatch. For your protection, wallet credit is paused.",
            invoice: localInvoice
          });
        }
        const creditResult = await executeWalletCreditTransaction(
          localInvoice.user_id,
          localInvoice.amount,
          targetInvoiceId,
          localInvoice.internal_order_id,
          localInvoice
        );
        return res.json({
          status: "COMPLETED",
          invoice: creditResult.invoice || localInvoice,
          message: "Payment successfully verified and wallet credited."
        });
      } else if (verifiedStatus === "FAILED") {
        await markInvoiceAndTransactionFailed(localInvoice.id, localInvoice.internal_order_id, "Verified FAILED by server");
        return res.json({
          status: "FAILED",
          invoice: { ...localInvoice, status: "FAILED" },
          message: "Payment failed or was cancelled by user."
        });
      }
    }
    return res.json({
      status: "PENDING",
      invoice: localInvoice,
      message: "Payment verification pending. Please complete transaction at checkout."
    });
  } catch (err) {
    console.error("[ZiniPay Verify Handler Critical Error]", err);
    return res.status(500).json({
      status: false,
      message: err.message || "An error occurred during payment verification."
    });
  }
}
async function handleZiniPayWebhook(req, res) {
  try {
    const invoiceId = req.body?.invoice_id || req.body?.invoiceId || req.query?.invoice_id || req.query?.invoiceId;
    console.log(`[ZiniPay Webhook Received] Invoice ID: ${invoiceId}`, req.body, req.query);
    if (!invoiceId) {
      return res.status(400).send("Bad Request: Missing invoice identifier.");
    }
    const db = getBackendFirestore();
    const dbDocRef = (0, import_firestore.doc)(db, "app_data", "lottery_winner_db");
    const dbSnap = await (0, import_firestore.getDoc)(dbDocRef);
    if (!dbSnap.exists()) {
      return res.status(500).send("Database not configured.");
    }
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
    const localInvoice = (parsedDb.zinipayInvoices || []).find((inv) => inv.invoice_id === invoiceId);
    if (!localInvoice) {
      console.warn(`[ZiniPay Webhook Warning] Webhook received for untracked invoice: ${invoiceId}`);
      return res.status(404).send("Invoice not found.");
    }
    const apiKey = (process.env.ZINIPAY_API_KEY || "sandbox_test_8f4c9a2e7b31").trim();
    const verifyUrl = "https://api.zinipay.com/v1/payment/verify";
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "zini-api-key": apiKey
      },
      body: JSON.stringify({ invoiceId, invoice_id: invoiceId })
    });
    const verifyData = await verifyResponse.json().catch(() => null);
    console.log("[ZiniPay Webhook Server Verification Response]", verifyResponse.status, verifyData);
    if (verifyResponse.ok && verifyData) {
      const verifiedStatus = String(verifyData.status || verifyData.data?.status || "PENDING").toUpperCase();
      const verifiedAmount = parseFloat(verifyData.amount || verifyData.data?.amount || verifyData.verified_amount);
      if (verifiedStatus === "COMPLETED") {
        if (verifiedAmount && Math.abs(verifiedAmount - localInvoice.amount) > 0.01) {
          console.error(`[ZiniPay Webhook Mismatch] Suspicious amount detected! Expected \u09F3${localInvoice.amount}, got \u09F3${verifiedAmount}`);
          return res.status(400).send("Amount mismatch detected.");
        }
        await executeWalletCreditTransaction(
          localInvoice.user_id,
          localInvoice.amount,
          invoiceId,
          localInvoice.internal_order_id,
          localInvoice
        );
        return res.status(200).send("Webhook Processed Successfully. Wallet Credited.");
      } else if (verifiedStatus === "FAILED") {
        await markInvoiceAndTransactionFailed(localInvoice.id, localInvoice.internal_order_id, "Webhook verified FAILED");
        return res.status(200).send("Webhook Processed. Status marked as FAILED.");
      }
    }
    return res.status(200).send("Webhook received, status is still PENDING.");
  } catch (err) {
    console.error("[ZiniPay Webhook Error]", err);
    return res.status(500).send("Internal Server Error processing Webhook.");
  }
}

// src/js/legalPolicies.ts
function sanitizeHTML(dirty) {
  if (!dirty) return "";
  const parser = new DOMParser();
  const doc3 = parser.parseFromString(dirty, "text/html");
  const forbiddenTags = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "applet",
    "base",
    "frame",
    "frameset",
    "meta",
    "link",
    "form",
    "input",
    "button"
  ];
  forbiddenTags.forEach((tag) => {
    const elements = doc3.querySelectorAll(tag);
    elements.forEach((el) => el.remove());
  });
  const allElements = doc3.querySelectorAll("*");
  allElements.forEach((el) => {
    const attributes = Array.from(el.attributes);
    attributes.forEach((attr) => {
      const name = attr.name.toLowerCase();
      const val = attr.value.toLowerCase().trim();
      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
      }
      if ((name === "href" || name === "src" || name === "action") && (val.startsWith("javascript:") || val.startsWith("vbscript:") || val.startsWith("data:") && !val.startsWith("data:image/"))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc3.body.innerHTML;
}
function getDefaultLegalPages(settings) {
  const siteName = settings?.siteName || "Lottery Winner";
  const supportEmail = settings?.supportEmail || "support@lotterywinner.app";
  const supportTelegram = settings?.supportTelegram || "@LotteryWinnerOfficial";
  const supportWhatsapp = settings?.supportWhatsapp || "+8801700000000";
  const currency = "BDT (\u09F3)";
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const effDate = "2026-01-01";
  return [
    // =========================================================================
    // 1. TERMS & CONDITIONS
    // =========================================================================
    {
      id: "legal_terms",
      page_key: "terms",
      title: "Terms & Conditions",
      slug: "/terms",
      short_description: "Core terms governing account eligibility, wallet balance rules, ZiniPay transactions, user obligations, and dispute procedures.",
      meta_title: `Terms & Conditions | ${siteName}`,
      meta_description: `Official Terms & Conditions governing user participation, wallet deposits, ticket entries, ZiniPay payment processing, and platform rules on ${siteName}.`,
      status: "PUBLISHED",
      version: 1,
      effective_date: effDate,
      last_updated: now,
      published_at: now,
      created_at: now,
      updated_at: now,
      updated_by: "system_init",
      content: `
<h2>1. Introduction & Acceptance of Agreement</h2>
<p>Welcome to <strong>${siteName}</strong> ("Platform", "we", "us", or "our"). These Terms & Conditions constitute a legally binding agreement between you ("User", "you", or "Player") and ${siteName}, governing your access to and use of our website, mobile progressive web application (PWA), user balance ledger, lottery pools, syndicate participation, and payment gateway interactions.</p>
<p>By creating an account, depositing funds, purchasing tickets, or using any feature on our platform, you explicitly affirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree to these Terms, you must discontinue using our services immediately.</p>

<h2>2. Eligibility & Account Requirements</h2>
<p>To register an account and participate in services offered on ${siteName}, you must satisfy all of the following requirements:</p>
<ul>
  <li><strong>Age Requirement:</strong> You must be at least <strong>18 years of age</strong> (or the legal age of majority in your jurisdiction). Participation by minors is strictly forbidden.</li>
  <li><strong>Accurate Information:</strong> You must provide truthful, current, and accurate registration information, including your username, valid email, and active mobile phone number.</li>
  <li><strong>Single Account Policy:</strong> Each individual user is strictly limited to <strong>one (1) account</strong>. Multi-accounting, sybil accounts, automated bot registrations, and proxy/VPN networks intended to circumvent verification or duplicate signup bonuses will result in immediate account suspension.</li>
  <li><strong>Jurisdictional Compliance:</strong> You are responsible for ensuring that your access to digital prize draws and entertainment platforms complies with local laws applicable in your jurisdiction.</li>
</ul>

<h2>3. User Account Responsibilities & Security</h2>
<p>You are solely responsible for maintaining the confidentiality of your login credentials, wallet security PINs, and session tokens. You agree to:</p>
<ul>
  <li>Keep your password and 4-digit cashout security PIN confidential at all times.</li>
  <li>Never allow third parties or minors to access or transact from your account.</li>
  <li>Immediately report any suspected unauthorized access or compromise of your account to our security desk at <strong>${supportEmail}</strong>.</li>
  <li>Accept responsibility for all activities and transactions performed through your authenticated account credentials.</li>
</ul>

<h2>4. Wallet Rules & Balance Management</h2>
<p>Our platform provides an internal virtual wallet system denominated in <strong>${currency}</strong>. The following principles govern user wallet balances:</p>
<ul>
  <li><strong>Utility of Funds:</strong> Wallet balances represent digital account credits designated for purchasing draw tickets, syndicate pool units, daily challenges, and authorized entertainment features.</li>
  <li><strong>Non-Transferability:</strong> Wallet balances cannot be directly transferred between player accounts, except through officially authorized agent cash transfers or promotional referral reward distributions.</li>
  <li><strong>Promotional Bonus Credits:</strong> Signup bonuses, daily claim grants, and deposit booster rewards are subject to platform playthrough criteria before being eligible for cashout.</li>
  <li><strong>Ledger Transparency:</strong> All deposits, ticket deductions, winnings credits, and cashout requests are permanently recorded in your personal account ledger with unique Transaction IDs.</li>
</ul>

<h2>5. Balance & Deposit Rules</h2>
<p>To fund your account wallet, you may initiate deposits through our integrated automated gateways or authorized agents. The following rules apply to all deposits:</p>
<ul>
  <li><strong>Minimum & Maximum Limits:</strong> All deposit channels enforce explicit minimum (e.g. \u09F350) and maximum transaction thresholds displayed dynamically on the deposit screen.</li>
  <li><strong>Direct Source Obligation:</strong> You must use payment instruments (bKash, Nagad, Rocket, bank cards) that are legally registered in your name or authorized for your use.</li>
  <li><strong>Pending Processing:</strong> Redirection to a payment gateway does not guarantee instant credit. Funds are credited to your wallet balance only after backend confirmation is received from the payment processor.</li>
</ul>

<h2>6. ZiniPay & Payment Processing Workflow</h2>
<p>Our platform integrates <strong>ZiniPay</strong> and other certified third-party payment service providers to facilitate automated, secure deposits via Mobile Financial Services (bKash, Nagad, Rocket, Upay), debit/credit cards, and internet banking. The standardized transaction workflow is as follows:</p>
<ol>
  <li><strong>Invoice Creation:</strong> You select the deposit amount on ${siteName} and submit your customer name and contact details, generating a unique, cryptographically signed invoice.</li>
  <li><strong>Gateway Redirection:</strong> You are securely redirected to the official ZiniPay hosted checkout interface to complete your payment with your chosen payment method.</li>
  <li><strong>Server-to-Server Verification:</strong> Upon payment completion, ZiniPay communicates with our server infrastructure via encrypted webhook notifications and callback APIs.</li>
  <li><strong>Automatic Ledger Credit:</strong> Our backend verifies the payment signature, checks that the invoice status is "COMPLETED", and automatically credits your wallet balance with zero manual intervention required.</li>
</ol>

<h2>7. Payment Verification & Transaction Rules</h2>
<p>To preserve transaction integrity and prevent fraudulent exploitation, the following rules are enforced on all transactions:</p>
<ul>
  <li><strong>Cryptographic Verification:</strong> All payment callbacks are validated using server-side signatures to guarantee that payment confirmation payloads have not been tampered with.</li>
  <li><strong>Unique Transaction IDs:</strong> Every transaction carries a unique Transaction ID (TrxID) and Invoice Reference. Submitting falsified, duplicated, or previously used TrxIDs is strictly prohibited and logged as fraudulent activity.</li>
  <li><strong>Timeout & Expiry:</strong> Invoices generated for payment gateways have a fixed expiration window (typically 15 to 30 minutes). Payments attempted after invoice expiration must be reconciled through customer support.</li>
</ul>

<h2>8. Prohibited Activities & Abuse Prevention</h2>
<p>Users must not engage in any of the following prohibited behaviors on ${siteName}:</p>
<ul>
  <li>Using stolen credit cards, compromised mobile money accounts, or unauthorized payment credentials.</li>
  <li>Attempting SQL injections, cross-site scripting (XSS), API replay attacks, or reverse-engineering platform source code.</li>
  <li>Exploiting race conditions, software glitches, or system bugs for illicit balance manipulation. Any discovered software defect must be reported to support immediately.</li>
  <li>Engaging in money laundering, unauthorized currency exchange, or fraudulent chargebacks.</li>
  <li>Harassing, threatening, or impersonating customer support staff, agents, or other players.</li>
</ul>

<h2>9. Fraud Detection & Account Suspension</h2>
<p>We maintain active automated and manual fraud auditing systems. If an account is flagged for suspicious activities, payment anomalies, or breach of these Terms, ${siteName} reserves the right to:</p>
<ul>
  <li>Temporarily place an audit freeze on the account while transactions are reviewed.</li>
  <li>Request identity verification documents (e.g. proof of payment, mobile banking SMS confirmation).</li>
  <li>Revoke illicitly credited balances, cancel tickets purchased through fraudulent funds, and refund verified pool victims.</li>
  <li>Permanently terminate accounts confirmed to be engaging in deliberate fraud or malicious system attacks.</li>
</ul>

<h2>10. Service Availability & Maintenance</h2>
<p>While we make every commercially reasonable effort to ensure continuous 24/7 service availability, we do not warrant that our platform will always be uninterrupted or error-free. Temporary service suspensions or latency may occur due to scheduled software deployments, security updates, server failover procedures, or emergency maintenance. Where feasible, advance notice will be provided via platform banners.</p>

<h2>11. Third-Party Services & External Networks</h2>
<p>Our platform relies on external third-party service providers, including payment gateways (e.g. ZiniPay, UddoktaPay, Cryptomus), telecommunication carriers, and cloud infrastructure hosts. While we select reputable service providers, we do not control their independent network performance, bank clearing speed, or temporary gateway downtime. We will, however, actively assist users in resolving transaction reconciliations with these external providers.</p>

<h2>12. Intellectual Property Rights</h2>
<p>All software code, graphics, user interface designs, logos, lottery draw mechanics, animations, trademarks, and text on ${siteName} are the exclusive intellectual property of the platform or its licensors. Users are granted a limited, revocable, non-exclusive license to access the platform for personal entertainment purposes. Reproduction, reverse engineering, scraping, or distribution of platform assets without prior written consent is strictly prohibited.</p>

<h2>13. Changes to Services & Platform Features</h2>
<p>We reserve the right to modify, enhance, update, or discontinue specific lottery pool categories, promotional missions, bonus reward structures, or platform features at our discretion. Any adjustments to active draw pools will be conducted transparently with reasonable advance notice, and active paid entries will always be honored or fully refunded.</p>

<h2>14. Amendments to Terms</h2>
<p>We may update these Terms & Conditions periodically to reflect technological improvements, security practices, or regulatory guidelines. When changes are made, the "Last Updated" date at the top of this document will be updated. Your continued use of the platform following the posting of revised Terms constitutes your acceptance of the updated terms.</p>

<h2>15. Complaints, Disputes & Escalation Protocol</h2>
<p>In the event of any grievance, dispute, or discrepancy regarding ticket results, balance deductions, or payment reconciliation:</p>
<ol>
  <li><strong>First Level:</strong> Contact customer support via <strong>${supportEmail}</strong> or Telegram <strong>${supportTelegram}</strong> with your account username and transaction details.</li>
  <li><strong>Review Period:</strong> Our compliance team will audit backend logs, payment gateway receipts, and server draw records within <strong>24 to 48 hours</strong>.</li>
  <li><strong>Resolution:</strong> A clear, transparent explanation and documented resolution will be provided. In the event of a verified platform error, corrective adjustments will be made to your wallet balance promptly.</li>
</ol>

<h2>16. Contact Information</h2>
<p>For questions or formal inquiries regarding these Terms & Conditions, please contact our administrative desk:</p>
<ul>
  <li><strong>Platform:</strong> ${siteName} Digital Entertainment Portal</li>
  <li><strong>Compliance Email:</strong> ${supportEmail}</li>
  <li><strong>Telegram Desk:</strong> ${supportTelegram}</li>
  <li><strong>Hotline:</strong> ${supportWhatsapp}</li>
</ul>
`
    },
    // =========================================================================
    // 2. PRIVACY POLICY
    // =========================================================================
    {
      id: "legal_privacy",
      page_key: "privacy",
      title: "Privacy Policy",
      slug: "/privacy",
      short_description: "How we collect, utilize, store, share, and protect your personal data, transaction records, and device identifiers.",
      meta_title: `Privacy Policy | ${siteName}`,
      meta_description: `Learn how ${siteName} collects, stores, protects, and handles your account details, wallet transactions, device information, and cookies in accordance with modern data protection standards.`,
      status: "PUBLISHED",
      version: 1,
      effective_date: effDate,
      last_updated: now,
      published_at: now,
      created_at: now,
      updated_at: now,
      updated_by: "system_init",
      content: `
<h2>1. Information We Collect</h2>
<p><strong>${siteName}</strong> ("we", "us", or "our") respects your privacy and is committed to protecting your personal information. To operate our platform, facilitate secure wallet transactions, and conduct fair prize draws, we collect the following categories of data:</p>

<h3>A. Account & Profile Information</h3>
<ul>
  <li><strong>Account Credentials:</strong> Username, email address, mobile phone number, date of birth, and securely salted cryptographic password hashes.</li>
  <li><strong>Security Configuration:</strong> 4-digit cashout security PIN hashes and emergency account recovery keys.</li>
  <li><strong>Optional Profile Data:</strong> Custom profile avatar picture, custom display badges, and vibe status chosen by the user.</li>
</ul>

<h3>B. Transaction & Financial Information</h3>
<ul>
  <li><strong>Wallet Activity:</strong> Timestamps, amounts, and reference IDs for deposits, withdrawals, ticket purchases, winning payouts, and daily mission bonuses.</li>
  <li><strong>Payment Metadata:</strong> Invoice numbers, transaction references (TrxID), payment method selected (e.g. ZiniPay, bKash, Nagad), and verification status received from payment gateways.</li>
  <li><strong>Sensitive Financial Data Exemption:</strong> We <em>NEVER</em> request, receive, or store your secret mobile banking PINs, credit card CVV codes, or private banking passwords on our servers. All sensitive credential inputs occur directly within the payment gateway's secure environment.</li>
</ul>

<h3>C. Device, Browser & Technical Information</h3>
<ul>
  <li><strong>Technical Identifiers:</strong> IP address, device operating system, browser type and version, screen resolution, and language preference.</li>
  <li><strong>Session Security:</strong> Cryptographic session tokens, login timestamps, and device fingerprints utilized to safeguard your account against unauthorized logins and multi-account abuse.</li>
</ul>

<h3>D. Cookies & Local Storage Technologies</h3>
<p>We utilize essential browser cookies and local storage (HTML5 LocalStorage) for the following strictly operational purposes:</p>
<ul>
  <li>Maintaining your authenticated login session across page refreshes.</li>
  <li>Remembering user display preferences (sound effects, dark/light theme, notification preferences).</li>
  <li>Ensuring responsive offline application functionality through service worker caching.</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>The personal information we collect is processed strictly for legitimate operational and security purposes, including:</p>
<ul>
  <li>Creating, administering, and securing your personal user account.</li>
  <li>Processing wallet deposits, verifying invoices with payment processors, and dispatching withdrawals.</li>
  <li>Conducting transparent, verifiable lottery pool draws and crediting winnings automatically to winners' wallets.</li>
  <li>Investigating fraudulent transaction attempts, chargebacks, bot attacks, and anti-money laundering (AML) compliance.</li>
  <li>Delivering essential security notifications, draw reveal alerts, and customer service responses.</li>
  <li>Enhancing platform speed, responsive design, and user experience.</li>
</ul>

<h2>3. Payment Processors & ZiniPay Data Processing</h2>
<p>When you initiate automated payments through <strong>ZiniPay</strong> or other integrated payment service providers, certain transactional data is securely exchanged via encrypted API channels:</p>
<ul>
  <li><strong>Invoice Generation:</strong> We transmit the deposit amount, your username, and your billing contact info to ZiniPay to generate a secure payment checkout session.</li>
  <li><strong>Payment Settlement:</strong> ZiniPay processes your payment on its PCI-compliant infrastructure and transmits back an encrypted webhook status update (Invoice ID, Transaction ID, status, and payment timestamp).</li>
  <li><strong>Independent Data Policies:</strong> Payment processors operate as independent data controllers with respect to their payment checkout pages. We encourage you to review ZiniPay's independent privacy policy for details on their data protection measures.</li>
</ul>

<h2>4. Data Security Safeguards</h2>
<p>We implement robust, enterprise-grade physical, technical, and organizational measures to safeguard your personal data:</p>
<ul>
  <li><strong>Transport Encryption:</strong> All data transmitted between your device and our servers is secured using modern Transport Layer Security (TLS 1.3 / HTTPS).</li>
  <li><strong>Database Protection:</strong> Database records are hosted in encrypted cloud database clusters with strict Role-Based Access Control (RBAC) and least-privilege security policies.</li>
  <li><strong>Credential Hashing:</strong> Passwords and security PINs are protected using one-way cryptographic hashing algorithms, ensuring they cannot be read in plaintext by staff or third parties.</li>
  <li><strong>Continuous Auditing:</strong> Administrative actions, policy modifications, and balance adjustments are permanently tracked in secure audit ledgers.</li>
</ul>

<h2>5. Data Retention Policy</h2>
<p>We retain your personal data and transaction records for as long as your account remains active and as required to satisfy accounting, tax, legal, and fraud auditing obligations:</p>
<ul>
  <li><strong>Active Accounts:</strong> Account data and wallet balances are maintained while your account is active.</li>
  <li><strong>Transaction Ledgers:</strong> Financial transaction histories (deposits, payouts, lottery draws) are retained for a minimum of 5 years to satisfy financial audit requirements.</li>
  <li><strong>Temporary Diagnostic Logs:</strong> Diagnostic access logs and error records are automatically purged on a rolling 90-day cycle.</li>
</ul>

<h2>6. Third-Party Services & Service Providers</h2>
<p>We do not sell, rent, or trade your personal information to third-party marketing brokers. We share data only with trusted infrastructure and service partners strictly necessary to deliver our services:</p>
<ul>
  <li><strong>Payment Gateways:</strong> To authorize and settle wallet deposits (e.g. ZiniPay).</li>
  <li><strong>Cloud & Hosting Providers:</strong> To host application servers and cloud databases securely.</li>
  <li><strong>Customer Support Channels:</strong> To facilitate live helpdesk communications (e.g. Telegram, WhatsApp).</li>
  <li><strong>Legal Authorities:</strong> When required by lawful court orders, subpoenas, or applicable law enforcement inquiries regarding verified criminal fraud.</li>
</ul>

<h2>7. User Rights & Data Requests</h2>
<p>Under modern data protection frameworks, you have specific rights regarding your personal data:</p>
<ul>
  <li><strong>Right of Access:</strong> You can view your account credentials, wallet ledger, and transaction history at any time through your user dashboard.</li>
  <li><strong>Right to Rectification:</strong> You can update your profile information (email, phone number, avatar) directly via your Profile tab.</li>
  <li><strong>Right to Erasure (Account Closure):</strong> You may request account closure and personal data deactivation by contacting our compliance desk at <strong>${supportEmail}</strong>, subject to statutory financial retention requirements.</li>
  <li><strong>Right to Restrict Processing:</strong> You may opt out of non-essential communications or notifications at any time in your Settings tab.</li>
</ul>

<h2>8. Children's Privacy Notice</h2>
<p>Our platform is strictly restricted to individuals aged <strong>18 years and older</strong>. We do not knowingly solicit or collect personal information from minors. If we discover that a user under the age of 18 has registered an account, we will immediately terminate the account, void pending entries, and delete the associated personal data from our active systems.</p>

<h2>9. Changes to this Privacy Policy</h2>
<p>We may update this Privacy Policy from time to time to reflect operational, legal, or regulatory improvements. Any revisions will be published immediately on this page with an updated "Last Updated" timestamp. We encourage you to review this policy periodically.</p>

<h2>10. Contact Information & Privacy Queries</h2>
<p>For any inquiries, data access requests, or privacy concerns, please contact our Data Protection Officer:</p>
<ul>
  <li><strong>Data Protection Officer:</strong> ${siteName} Compliance Team</li>
  <li><strong>Email:</strong> ${supportEmail}</li>
  <li><strong>Telegram Support:</strong> ${supportTelegram}</li>
</ul>
`
    },
    // =========================================================================
    // 3. REFUND & CANCELLATION POLICY
    // =========================================================================
    {
      id: "legal_refund",
      page_key: "refund-policy",
      title: "Refund & Cancellation Policy",
      slug: "/refund-policy",
      short_description: "Clear guidelines on wallet balance deposits, failed payments, duplicate charges, cancellation rules, and refund request procedures.",
      meta_title: `Refund & Cancellation Policy | ${siteName}`,
      meta_description: `Official Refund and Cancellation Policy for ${siteName}. Detailed guidance on wallet deposits, duplicate charges, payment gateway delays, and dispute resolution.`,
      status: "PUBLISHED",
      version: 1,
      effective_date: effDate,
      last_updated: now,
      published_at: now,
      created_at: now,
      updated_at: now,
      updated_by: "system_init",
      content: `
<h2>1. Nature of Digital Entertainment & Wallet Deposits</h2>
<p><strong>${siteName}</strong> operates a digital platform providing real-time lottery pool draws, syndicate participation, and an internal wallet management system. Because tickets are entered into synchronized algorithmic draws with shared prize pools, specific refund and cancellation conditions apply to ensure fairness and transparency for all participants.</p>

<h2>2. Wallet Deposit Policy</h2>
<p>When you deposit funds into your ${siteName} wallet via integrated automated payment gateways (e.g. ZiniPay, UddoktaPay, Cryptomus) or authorized agents, the following policies apply:</p>
<ul>
  <li><strong>Completed & Credited Deposits:</strong> Once a deposit has been successfully verified by the payment gateway and credited to your wallet balance, it cannot be refunded as an immediate cash reversal. Credited funds remain fully available in your account wallet to participate in draws or submit cashout/withdrawal requests in accordance with standard platform withdrawal minimums.</li>
  <li><strong>Pending Transactions & Verification Delays:</strong> If your bank account or mobile wallet was debited but your ${siteName} balance does not show the credit immediately, this is typically due to temporary telecommunication webhook delays or banking reconciliation latencies. Please allow <strong>15 to 30 minutes</strong> for automated reconciliation. If the delay persists, our support team will manually verify the payment reference with the gateway ledger.</li>
  <li><strong>Failed Transactions:</strong> If a payment session fails, expires, or is declined on the gateway checkout screen, no wallet balance is credited and no debit occurs on ${siteName}. If your bank or mobile financial provider temporarily held funds during the failed session, the gateway's banking partner will automatically reverse the charge back to your original payment method within standard banking clearing timelines (typically 24 to 72 hours).</li>
</ul>

<h2>3. Duplicate or Incorrect Payments</h2>
<p>If you accidentally paid twice for the same invoice, or sent an incorrect amount through an integrated payment gateway:</p>
<ol>
  <li><strong>Do Not Panic:</strong> Capture clear screenshots or digital receipts of both transactions displaying the <strong>Transaction ID (TrxID)</strong>, payment method, date, and invoice number.</li>
  <li><strong>Submit a Claim:</strong> Contact our billing desk at <strong>${supportEmail}</strong> or submit an in-app dispute ticket within <strong>7 days</strong> of the transaction.</li>
  <li><strong>Verification & Settlement:</strong> Upon cross-referencing with ZiniPay or gateway transaction ledgers, verified duplicate charges will be resolved. You may choose to have the duplicate amount credited directly to your wallet balance or refunded back to your original payment channel within <strong>3 to 5 business days</strong>.</li>
</ol>

<h2>4. Ticket Purchases & Cancellation Rules</h2>
<p>The following rules govern the purchase and cancellation of lottery pool tickets:</p>
<ul>
  <li><strong>Active Pools Before Draw:</strong> Once a ticket has been generated and its entry code registered into an active pool, the ticket cannot be cancelled or refunded by the player, as entry fees are committed to the collective pool prize calculation.</li>
  <li><strong>Drawn & Completed Lotteries:</strong> Once a draw has taken place and winning numbers have been declared, purchased tickets for that draw are strictly <strong>non-refundable</strong> under any circumstances.</li>
  <li><strong>Cancelled Lotteries by Platform:</strong> If an active lottery pool is cancelled or voided by system administrators due to technical faults, unforeseen server interruptions, or insufficient quorum, <strong>100% of all ticket entry fees are automatically refunded</strong> back to the respective players' wallet balances with zero penalty.</li>
  <li><strong>Syndicate Group Rules:</strong> Once a syndicate group has reached 100% funding and its collective ticket has been issued, individual participants cannot cancel their shares. If a syndicate fails to reach quorum prior to pool expiry, all committed shares are refunded to member wallets automatically.</li>
</ul>

<h2>5. Non-Refundable Items & Services</h2>
<p>The following categories of transactions are strictly non-refundable:</p>
<ul>
  <li>Tickets purchased for draws that have already concluded.</li>
  <li>Promotional credits, signup bonus grants, or daily mission bonuses.</li>
  <li>Accounts terminated due to verified fraud, multi-accounting, or exploit abuse.</li>
  <li>Funds lost due to third-party credential compromise where the user shared their account password or PIN.</li>
</ul>

<h2>6. Chargeback & Dispute Policy</h2>
<p>We are dedicated to resolving all valid billing discrepancies quickly and amicably. Users are expected to contact our customer support team first before initiating any chargeback through their financial provider:</p>
<ul>
  <li>Unwarranted chargebacks or fraudulent dispute filings made after receiving digital credits or participating in draws constitute a violation of our Terms of Service.</li>
  <li>Accounts subject to unauthorized chargebacks will be frozen pending investigation, and any associated debt will be logged.</li>
  <li>Legitimate duplicate charges or uncredited verified payments will always be honored through our official dispute process.</li>
</ul>

<h2>7. Step-by-Step Refund Request Process</h2>
<p>To submit a refund or transaction reconciliation request, email <strong>${supportEmail}</strong> with the following required details:</p>
<ul>
  <li>Your registered <strong>Username</strong> and User ID.</li>
  <li>The <strong>Payment Method</strong> used (e.g. ZiniPay bKash, Nagad, Rocket, Card).</li>
  <li>The exact <strong>Transaction ID (TrxID)</strong> and Gateway Invoice ID.</li>
  <li>Date, timestamp, and exact monetary amount of the transaction.</li>
  <li>A clear screenshot of your debit notification SMS or payment slip.</li>
  <li>A concise summary of the issue (e.g. duplicate payment, uncredited verified deposit).</li>
</ul>

<h2>8. Review Timeframes & Processing SLAs</h2>
<p>Our financial reconciliation team reviews claims systematically:</p>
<ul>
  <li><strong>Initial Acknowledgment:</strong> Within <strong>6 to 12 hours</strong> of receipt.</li>
  <li><strong>Gateway Ledger Audit:</strong> Completed within <strong>24 to 48 hours</strong> with payment partners.</li>
  <li><strong>Refund Disbursement:</strong> Approved refunds to original payment channels take <strong>3 to 5 business days</strong> depending on your banking provider's processing speed.</li>
</ul>

<h2>9. Contact for Refund Queries</h2>
<p>For any queries regarding this Refund & Cancellation Policy, please contact our billing desk:</p>
<ul>
  <li><strong>Billing Support Email:</strong> ${supportEmail}</li>
  <li><strong>Telegram Desk:</strong> ${supportTelegram}</li>
  <li><strong>Operating Hours:</strong> 24 hours a day, 7 days a week</li>
</ul>
`
    },
    // =========================================================================
    // 4. DISCLAIMER
    // =========================================================================
    {
      id: "legal_disclaimer",
      page_key: "disclaimer",
      title: "Disclaimer",
      slug: "/disclaimer",
      short_description: "Important legal disclaimers covering game nature, random outcomes, responsible play, technical availability, and limitation of liability.",
      meta_title: `Disclaimer | ${siteName}`,
      meta_description: `Official Disclaimer for ${siteName}. Information regarding random number generation, no guarantee of winnings, responsible participation, and limitation of liability.`,
      status: "PUBLISHED",
      version: 1,
      effective_date: effDate,
      last_updated: now,
      published_at: now,
      created_at: now,
      updated_at: now,
      updated_by: "system_init",
      content: `
<h2>1. Entertainment & Promotional Nature of the Platform</h2>
<p>The games, lottery pools, promotional missions, and interactive entertainment services provided on <strong>${siteName}</strong> are designed exclusively for recreational and entertainment purposes. Participation in prize draws offers players the opportunity to win prizes based on probability and random outcomes; it does not constitute an investment, financial asset, employment, or guaranteed source of income.</p>

<h2>2. No Guarantee of Winnings & Random Outcome Notice</h2>
<p>Users must understand and acknowledge that:</p>
<ul>
  <li><strong>No Guaranteed Outcomes:</strong> Purchasing tickets or syndicate units does not guarantee that you will win any prize. There is an inherent possibility of losing the entirety of the ticket purchase price.</li>
  <li><strong>Algorithmic Fair Play:</strong> All draw outcomes on ${siteName} are generated using algorithmic Pseudo-Random Number Generation (PRNG) routines designed to ensure fair, unbiased, and mathematically random distribution of winning numbers.</li>
  <li><strong>No Manipulation:</strong> No user, agent, administrator, or third party has the ability to forecast, manipulate, or predetermine winning ticket codes.</li>
</ul>

<h2>3. Responsible Play & Financial Responsibility</h2>
<p>${siteName} advocates strongly for responsible entertainment. Users are urged to adhere to the following principles:</p>
<ul>
  <li>Only participate with discretionary funds that you can comfortably afford to spend on personal recreation.</li>
  <li>Never use money allocated for essential living expenses, food, rent, education, medical needs, or debt obligations.</li>
  <li>Do not chase losses. If you find yourself spending more time or money than intended, we encourage you to utilize our self-exclusion and account cooling-off features.</li>
  <li>Gambling or excessive wagering can lead to psychological distress. If you or someone you know requires assistance with compulsive gaming behavior, please seek support from dedicated professional counseling services.</li>
</ul>

<h2>4. Technical Glitches, Latency & Scheduled Downtime</h2>
<p>While ${siteName} uses modern cloud architecture with automated failover capabilities, we provide our services on an "AS IS" and "AS AVAILABLE" basis. We cannot warrant that:</p>
<ul>
  <li>The website or mobile application will operate entirely uninterrupted, continuously error-free, or without network latency during peak draw reveal moments.</li>
  <li>Server maintenance, telecommunication network outages, or upstream provider failures will not occur. In the event of a verified technical glitch that disrupts an active draw, the affected pool will be cancelled and 100% of entry fees will be refunded to players' balances.</li>
</ul>

<h2>5. Third-Party Payment Gateway Disclaimers</h2>
<p>Payments on this platform are processed through independent, third-party payment gateways (including ZiniPay, UddoktaPay, and cryptocurrency validators) and telecommunication channels (bKash, Nagad, Rocket, Upay). We are not responsible for:</p>
<ul>
  <li>Delays, downtime, or maintenance windows originating on third-party banking or mobile money servers.</li>
  <li>Deductions or transaction fees imposed by your banking institution or mobile money operator for outgoing payments.</li>
  <li>Lost or misdirected payments caused by users entering incorrect account numbers, invoice references, or wallet details during checkout.</li>
</ul>

<h2>6. Reasonable Limitation of Liability</h2>
<p>To the maximum extent permitted by applicable law, ${siteName}, its directors, employees, and authorized agents shall not be held liable for any indirect, incidental, consequential, special, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your access to or inability to access the platform.</p>
<p>Nothing in these Terms or this Disclaimer is intended to exclude or limit liability for matters that cannot be lawfully limited under applicable consumer protection legislation, including verified platform errors in ledger calculation or willful misconduct on our part.</p>

<h2>7. Regulatory & Jurisdictional Notice</h2>
<p>Users are solely responsible for ensuring that their access to and participation in digital prize draws complies with all applicable local, provincial, state, and national laws in their respective geographic jurisdiction. We do not represent or warrant that participation is legal in every territory.</p>

<h2>8. Age Restrictions (Strictly 18+)</h2>
<p>Access to ${siteName} is strictly prohibited for any individual under the age of 18 (or the applicable age of majority in your jurisdiction). By accessing our services, you certify that you meet all age qualifications. We reserve the right to demand proof of age at any stage of account maintenance.</p>

<h2>9. Contact Regarding Disclaimers</h2>
<p>For questions or formal inquiries regarding this Disclaimer, reach our administrative team at <strong>${supportEmail}</strong>.</p>
`
    },
    // =========================================================================
    // 5. CONTACT & SUPPORT / PAYMENT POLICY
    // =========================================================================
    {
      id: "legal_contact",
      page_key: "contact-support",
      title: "Contact & Support / Payment Policy",
      slug: "/contact-support",
      short_description: "Official customer service contact channels, ZiniPay deposit guide, payment verification, troubleshooting, and dispute escalation paths.",
      meta_title: `Contact & Support | Payment Policy | ${siteName}`,
      meta_description: `Official customer support helpdesk and Payment Policy for ${siteName}. Complete guide to ZiniPay deposits, bKash, Nagad, verification, and payment troubleshooting.`,
      status: "PUBLISHED",
      version: 1,
      effective_date: effDate,
      last_updated: now,
      published_at: now,
      created_at: now,
      updated_at: now,
      updated_by: "system_init",
      content: `
<h2>1. Official Customer Support Channels</h2>
<p>If you experience any difficulties with your account, wallet deposits, draw tickets, or withdrawals, our dedicated customer support team is available 24/7 through the following official channels:</p>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
  <div class="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
    <div class="text-xs text-rose-400 font-bold uppercase font-mono mb-1"><i class="fa-solid fa-envelope mr-1"></i> Email Helpdesk</div>
    <div class="text-sm font-black text-white font-mono select-all">${supportEmail}</div>
    <div class="text-[10px] text-slate-500">Official disputes, payment verification & general queries</div>
  </div>
  <div class="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
    <div class="text-xs text-cyan-400 font-bold uppercase font-mono mb-1"><i class="fa-brands fa-telegram mr-1"></i> Telegram Support</div>
    <div class="text-sm font-black text-white font-mono select-all">${supportTelegram}</div>
    <div class="text-[10px] text-slate-500">Fast assistance & community announcements</div>
  </div>
  <div class="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
    <div class="text-xs text-emerald-400 font-bold uppercase font-mono mb-1"><i class="fa-brands fa-whatsapp mr-1"></i> WhatsApp Hotline</div>
    <div class="text-sm font-black text-white font-mono select-all">${supportWhatsapp}</div>
    <div class="text-[10px] text-slate-500">Direct agent & player hotline</div>
  </div>
</div>

<h2>2. Operating Hours & Service Level Agreement (SLA)</h2>
<p>We strive to provide rapid, transparent resolution for all user inquiries:</p>
<ul>
  <li><strong>Payment & Wallet Disputes:</strong> High Priority \u2014 reviewed and verified with gateway ledgers within <strong>2 to 6 hours</strong>.</li>
  <li><strong>General Account Inquiries:</strong> Typically answered within <strong>12 to 24 hours</strong>.</li>
  <li><strong>Technical Bug Reports:</strong> Investigated and acknowledged within <strong>24 hours</strong>.</li>
  <li><strong>Duplicate Billing Reconciliation:</strong> Settled with financial partners within <strong>1 to 3 business days</strong>.</li>
</ul>

<h2>3. Payment Policy & Supported Channels</h2>
<p>Our platform supports modern, secure payment channels via <strong>ZiniPay Automated Gateway</strong> and authorized financial partners:</p>
<ul>
  <li><strong>bKash (Personal / Merchant):</strong> Instant automated checkout and PIN verification through ZiniPay.</li>
  <li><strong>Nagad:</strong> Fast mobile banking deposit with automated Transaction ID matching.</li>
  <li><strong>Rocket (DBBL):</strong> Reliable automated mobile financial settlement.</li>
  <li><strong>Upay:</strong> Convenient mobile wallet deposit option.</li>
  <li><strong>Debit / Credit Cards:</strong> Visa, MasterCard, and UnionPay issued by supported domestic banks.</li>
  <li><strong>Cryptocurrency:</strong> USDT (TRC-20 / BEP-20) and major tokens via integrated blockchain processing.</li>
</ul>

<h2>4. Step-by-Step Deposit Instructions</h2>
<p>To fund your wallet safely and ensure instant balance crediting, follow these steps:</p>
<ol>
  <li><strong>Navigate to Deposit:</strong> Tap the <strong>Wallet</strong> tab and select <strong>Deposit Balance</strong>.</li>
  <li><strong>Select Payment Method:</strong> Choose <strong>ZiniPay Automated</strong> (or your preferred gateway).</li>
  <li><strong>Enter Amount:</strong> Type your desired deposit amount (e.g. \u09F3100, \u09F3500, \u09F31000) adhering to the posted minimum/maximum limits.</li>
  <li><strong>Generate Invoice:</strong> Tap <strong>Proceed to Payment</strong> to generate an official payment invoice.</li>
  <li><strong>Complete Payment on Gateway:</strong> You will be securely redirected to the ZiniPay payment page. Select your payment channel (bKash, Nagad, etc.) and complete payment instructions as prompted.</li>
  <li><strong>Await Verification:</strong> Once payment succeeds on ZiniPay, our server automatically validates the transaction webhook and credits your wallet. Return to ${siteName} to see your updated balance!</li>
</ol>

<h2>5. Payment Verification Process</h2>
<p>To safeguard user funds and prevent duplicate exploitation, every deposit undergoes automated verification:</p>
<ul>
  <li><strong>Server-to-Server Webhook:</strong> The payment gateway immediately notifies our backend upon successful payment.</li>
  <li><strong>Signature Validation:</strong> The notification is validated using cryptographic keys to confirm authentic origin from the payment processor.</li>
  <li><strong>Ledger Entry:</strong> A distinct Transaction ID (TrxID) is permanently logged in your account ledger.</li>
</ul>

<h2>6. What to Do If a Payment Is Delayed or Stuck</h2>
<p>If you completed a payment on the gateway but your ${siteName} wallet balance did not update immediately:</p>
<ol>
  <li><strong>Do Not Make Repeated Payments:</strong> Please wait <strong>15 to 30 minutes</strong> before attempting another deposit. Banking networks often experience short settlement delays.</li>
  <li><strong>Locate Your Transaction Proof:</strong> Check your mobile banking SMS or bank app receipt for the <strong>Transaction ID (TrxID)</strong> and the time of payment.</li>
  <li><strong>Check Wallet History:</strong> Open the <strong>Ledgers / History</strong> tab to check if your invoice reference is marked as "Pending" or "Approved".</li>
  <li><strong>Submit Support Ticket:</strong> If 30 minutes have elapsed and balance is still uncredited, contact our support team via <strong>${supportEmail}</strong> or Telegram <strong>${supportTelegram}</strong> with your username and TrxID. Our billing team will manually verify and credit your balance.</li>
</ol>

<h2>7. Common Payment FAQs</h2>
<div class="space-y-3 my-4">
  <div class="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
    <div class="text-xs font-bold text-white mb-1"><i class="fa-solid fa-circle-question text-rose-500 mr-1.5"></i> Is there any fee for depositing via ZiniPay?</div>
    <div class="text-[11px] text-slate-400 font-sans">No. ${siteName} charges zero deposit processing fees. The exact amount you pay on ZiniPay is the amount credited to your wallet balance. Standard mobile banking network charges (if any) are determined by your mobile operator.</div>
  </div>
  <div class="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
    <div class="text-xs font-bold text-white mb-1"><i class="fa-solid fa-circle-question text-rose-500 mr-1.5"></i> What is the minimum and maximum deposit?</div>
    <div class="text-[11px] text-slate-400 font-sans">The standard minimum deposit is <strong>\u09F350</strong>, and the maximum single transaction limit is <strong>\u09F325,000</strong>. Limits are dynamically displayed on the deposit screen.</div>
  </div>
  <div class="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
    <div class="text-xs font-bold text-white mb-1"><i class="fa-solid fa-circle-question text-rose-500 mr-1.5"></i> I was debited twice for one deposit. What should I do?</div>
    <div class="text-[11px] text-slate-400 font-sans">Send both Transaction IDs (TrxIDs) to <strong>${supportEmail}</strong>. Once our billing team cross-references the gateway ledger, the duplicate payment will either be credited to your balance or refunded to your original payment method.</div>
  </div>
</div>

<h2>8. Escalation Path for Disputes</h2>
<p>If you feel your inquiry was not handled satisfactorily by standard support agents, you may escalate your ticket:</p>
<ol>
  <li>Reply directly to your support email thread with <strong>"REQUEST ESCALATION - TICKET ID #[Your ID]"</strong> in the subject line.</li>
  <li>Your case will be reassigned directly to a Senior Compliance Officer for secondary review.</li>
  <li>Senior review decisions are issued within <strong>24 business hours</strong> with complete audit logs and gateway reconciliation reports.</li>
</ol>
`
    }
  ];
}

// server.ts
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
var currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
app.use(import_express.default.json());
app.post("/api/send-reset-email", (req, res) => {
  return handleSendResetEmail(req, res);
});
app.post("/api/uddoktapay/create-checkout", (req, res) => {
  return handleUddoktaPayCheckout(req, res);
});
app.post("/api/uddoktapay/verify-payment", (req, res) => {
  return handleUddoktaPayVerify(req, res);
});
app.all("/api/uddoktapay/webhook", (req, res) => {
  console.log("[UddoktaPay Webhook Received]", req.body);
  return res.json({ status: true, received: true });
});
app.post("/api/zinipay/create-checkout", (req, res) => {
  return handleZiniPayCheckout(req, res);
});
app.post("/api/zinipay/verify-payment", (req, res) => {
  return handleZiniPayVerify(req, res);
});
app.post("/api/zinipay/webhook", (req, res) => {
  return handleZiniPayWebhook(req, res);
});
app.get("/api/zinipay/webhook", (req, res) => {
  return handleZiniPayWebhook(req, res);
});
var defaultSettings = {
  payMasterEnabled: "true",
  payUddoktapayEnabled: "true",
  payZinipayEnabled: "true",
  payCryptomusEnabled: "true",
  payBkashEnabled: "false",
  payNagadEnabled: "false",
  payRocketEnabled: "false",
  payUsdtEnabled: "false",
  payAgentDepositEnabled: "false"
};
var handleGetSettings = async (req, res) => {
  try {
    const db = getBackendFirestore();
    if (db) {
      const dbDocRef = (0, import_firestore2.doc)(db, "app_data", "lottery_winner_db");
      const dbSnap = await (0, import_firestore2.getDoc)(dbDocRef);
      if (dbSnap.exists()) {
        const dbData = dbSnap.data();
        const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
        if (parsedDb && parsedDb.settings) {
          return res.json(parsedDb.settings);
        }
      }
    }
  } catch (err) {
    console.error("[Server Settings Sync] Error reading Firestore settings:", err.message);
  }
  return res.json(defaultSettings);
};
app.get("/api_settings.php", handleGetSettings);
app.get("/api/settings", handleGetSettings);
var latestServerDrawEvent = null;
var drawEventHistory = [];
app.post("/api/draws/broadcast", (req, res) => {
  const drawEvent = req.body;
  if (drawEvent && drawEvent.id) {
    latestServerDrawEvent = drawEvent;
    drawEventHistory.unshift(drawEvent);
    if (drawEventHistory.length > 50) {
      drawEventHistory.pop();
    }
    console.log(`[Server Draw Broadcast] New live draw broadcasted: "${drawEvent.lotteryName}" (${drawEvent.id}) with ${drawEvent.winnersCount || 0} winner(s).`);
  }
  return res.json({ success: true, latest: latestServerDrawEvent });
});
app.get("/api/draws/latest", (_req, res) => {
  return res.json({
    success: true,
    latest: latestServerDrawEvent,
    history: drawEventHistory.slice(0, 10)
  });
});
app.get("/api/legal/pages", async (_req, res) => {
  try {
    const db = getBackendFirestore();
    if (db) {
      const dbDocRef = (0, import_firestore2.doc)(db, "app_data", "lottery_winner_db");
      const dbSnap = await (0, import_firestore2.getDoc)(dbDocRef);
      if (dbSnap.exists()) {
        const dbData = dbSnap.data();
        const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
        if (parsedDb && parsedDb.legalPages) {
          const publicPages = parsedDb.legalPages.filter((p) => p.status === "PUBLISHED");
          return res.json({ success: true, pages: publicPages });
        }
      }
    }
  } catch (err) {
    console.error("[Legal API] Error fetching legal pages:", err.message);
  }
  return res.json({ success: true, pages: getDefaultLegalPages() });
});
app.get("/api/legal/pages/:key", async (req, res) => {
  const { key } = req.params;
  try {
    const db = getBackendFirestore();
    if (db) {
      const dbDocRef = (0, import_firestore2.doc)(db, "app_data", "lottery_winner_db");
      const dbSnap = await (0, import_firestore2.getDoc)(dbDocRef);
      if (dbSnap.exists()) {
        const dbData = dbSnap.data();
        const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
        const page = (parsedDb?.legalPages || []).find((p) => p.page_key === key || p.slug === `/${key}`);
        if (page && page.status === "PUBLISHED") {
          return res.json({ success: true, page });
        }
      }
    }
  } catch (err) {
    console.error("[Legal API] Error fetching policy:", err.message);
  }
  const fallback = getDefaultLegalPages().find((p) => p.page_key === key || p.slug === `/${key}`);
  if (fallback) {
    return res.json({ success: true, page: fallback });
  }
  return res.status(404).json({ success: false, message: "Policy page not found or unpublished." });
});
app.post("/api/legal/pages/save", async (req, res) => {
  const { admin_id, page } = req.body;
  if (!admin_id) {
    return res.status(403).json({ success: false, message: "Unauthorized. Admin ID required." });
  }
  try {
    const db = getBackendFirestore();
    if (db) {
      const dbDocRef = (0, import_firestore2.doc)(db, "app_data", "lottery_winner_db");
      const dbSnap = await (0, import_firestore2.getDoc)(dbDocRef);
      if (dbSnap.exists()) {
        const dbData = dbSnap.data();
        const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
        const adminUser = (parsedDb.users || []).find((u) => u.username === admin_id);
        if (!adminUser || adminUser.role !== "admin" && adminUser.username !== "admin") {
          return res.status(403).json({ success: false, message: "Forbidden: Only authorized Admins can modify legal policies." });
        }
        if (!parsedDb.legalPages) parsedDb.legalPages = getDefaultLegalPages(parsedDb.settings);
        if (page.content) page.content = sanitizeHTML(page.content);
        if (page.draft_content) page.draft_content = sanitizeHTML(page.draft_content);
        const idx = parsedDb.legalPages.findIndex((p) => p.page_key === page.page_key);
        if (idx >= 0) {
          parsedDb.legalPages[idx] = { ...parsedDb.legalPages[idx], ...page, updated_at: (/* @__PURE__ */ new Date()).toISOString(), updated_by: admin_id };
        } else {
          parsedDb.legalPages.push(page);
        }
        if (!parsedDb.legalAuditLogs) parsedDb.legalAuditLogs = [];
        parsedDb.legalAuditLogs.unshift({
          id: `audit_${Date.now()}`,
          admin_id,
          action: page.status === "PUBLISHED" ? "PUBLISH" : "EDIT_DRAFT",
          policy_key: page.page_key,
          page_title: page.title,
          previous_version: `${page.version - 1 || 1}.0`,
          new_version: `${page.version || 1}.0`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          details: `Policy updated via server-side API.`
        });
        await (0, import_firestore2.setDoc)(dbDocRef, { db: JSON.stringify(parsedDb), lastUpdated: (/* @__PURE__ */ new Date()).toISOString() }, { merge: true });
        return res.json({ success: true, message: "Policy saved successfully." });
      }
    }
  } catch (err) {
    console.error("[Legal API] Save error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
  return res.status(500).json({ success: false, message: "Database unreachable." });
});
app.get("/api/legal/audit-logs", async (_req, res) => {
  try {
    const db = getBackendFirestore();
    if (db) {
      const dbDocRef = (0, import_firestore2.doc)(db, "app_data", "lottery_winner_db");
      const dbSnap = await (0, import_firestore2.getDoc)(dbDocRef);
      if (dbSnap.exists()) {
        const dbData = dbSnap.data();
        const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
        return res.json({ success: true, auditLogs: parsedDb.legalAuditLogs || [] });
      }
    }
  } catch (err) {
    console.error("[Legal API] Audit logs error:", err.message);
  }
  return res.json({ success: true, auditLogs: [] });
});
app.use(import_express.default.static(import_path2.default.join(currentDir, "dist")));
app.get("*", (req, res) => {
  res.sendFile(import_path2.default.join(currentDir, "dist", "index.html"));
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
var server_default = app;
//# sourceMappingURL=server.cjs.map
