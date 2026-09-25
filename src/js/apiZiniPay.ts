import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, runTransaction, getDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

let firestoreDb: any = null;

// Initialize Firebase for the backend securely
export function getBackendFirestore() {
  if (firestoreDb) return firestoreDb;
  try {
    const apps = getApps();
    let app;
    const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    
    if (apps.length > 0) {
      app = apps[0];
    } else {
      app = initializeApp(firebaseConfig);
    }
    firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    return firestoreDb;
  } catch (err: any) {
    console.error("[ZiniPay Backend] Firebase Initialization Error:", err.message);
    throw err;
  }
}

/**
 * Creates a local pending transaction and pending invoice in the database BEFORE calling ZiniPay API.
 */
export async function createPendingInvoiceTransaction(
  userId: string,
  amount: number,
  paymentDetails: { cus_name: string; cus_email: string }
) {
  const db = getBackendFirestore();
  const transactionId = "ZP_TX_" + Date.now() + Math.floor(Math.random() * 1000);
  const dbDocRef = doc(db, "app_data", "lottery_winner_db");

  const result = await runTransaction(db, async (transaction) => {
    const dbSnap = await transaction.get(dbDocRef);
    if (!dbSnap.exists()) {
      throw new Error("Monolithic database document not found in Firestore!");
    }
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;

    if (!parsedDb.users) parsedDb.users = [];
    if (!parsedDb.deposits) parsedDb.deposits = [];
    if (!parsedDb.zinipayInvoices) parsedDb.zinipayInvoices = [];

    const dbUser = parsedDb.users.find((u: any) => u.id === userId);
    if (!dbUser) {
      throw new Error(`User with ID ${userId} not found in database!`);
    }

    // Create pending deposit log
    const pendingDep = {
      id: "dep_" + Date.now() + Math.floor(Math.random() * 1000),
      username: dbUser.username,
      amount: amount,
      method: "ZiniPay",
      gateway: "ZiniPay",
      trxId: transactionId,
      status: "pending",
      date: new Date().toISOString(),
      notes: "ZiniPay invoice pending creation..."
    };
    parsedDb.deposits.unshift(pendingDep);

    // Create pending ZiniPay invoice log
    const pendingInvoice = {
      id: "zinv_" + Date.now() + Math.floor(Math.random() * 1000),
      user_id: userId,
      transaction_id: transactionId,
      invoice_id: "", // filled after API call
      internal_order_id: transactionId,
      amount: amount,
      status: "PENDING",
      payment_url: "", // filled after API call
      cus_name: paymentDetails.cus_name || dbUser.username,
      cus_email: paymentDetails.cus_email || dbUser.email,
      metadata: {
        user_id: userId,
        order_id: transactionId,
        purpose: "wallet_deposit"
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    parsedDb.zinipayInvoices.unshift(pendingInvoice);

    transaction.update(dbDocRef, {
      db: JSON.stringify(parsedDb),
      updatedAt: new Date().toISOString()
    });

    return { transactionId, pendingInvoiceId: pendingInvoice.id, username: dbUser.username, email: dbUser.email };
  });

  return result;
}

/**
 * Updates a pending local invoice with details received from ZiniPay Create API response.
 */
export async function updatePendingInvoiceWithDetails(
  pendingInvoiceId: string,
  transactionId: string,
  invoiceIdFromApi: string,
  paymentUrlFromApi: string,
  extraDetails: any
) {
  const db = getBackendFirestore();
  const dbDocRef = doc(db, "app_data", "lottery_winner_db");

  await runTransaction(db, async (transaction) => {
    const dbSnap = await transaction.get(dbDocRef);
    if (!dbSnap.exists()) return;
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;

    const invIndex = parsedDb.zinipayInvoices.findIndex((i: any) => i.id === pendingInvoiceId);
    if (invIndex !== -1) {
      parsedDb.zinipayInvoices[invIndex].invoice_id = invoiceIdFromApi;
      parsedDb.zinipayInvoices[invIndex].payment_url = paymentUrlFromApi;
      parsedDb.zinipayInvoices[invIndex].redirect_url = extraDetails.redirect_url || "";
      parsedDb.zinipayInvoices[invIndex].cancel_url = extraDetails.cancel_url || "";
      parsedDb.zinipayInvoices[invIndex].webhook_url = extraDetails.webhook_url || "";
      parsedDb.zinipayInvoices[invIndex].updated_at = new Date().toISOString();
    }

    const depIndex = parsedDb.deposits.findIndex((d: any) => d.trxId === transactionId);
    if (depIndex !== -1) {
      parsedDb.deposits[depIndex].notes = `ZiniPay invoice created. ID: ${invoiceIdFromApi}`;
    }

    transaction.update(dbDocRef, {
      db: JSON.stringify(parsedDb),
      updatedAt: new Date().toISOString()
    });
  });
}

/**
 * Marks a local transaction and invoice as failed.
 */
export async function markInvoiceAndTransactionFailed(
  pendingInvoiceId: string,
  transactionId: string,
  reason: string
) {
  const db = getBackendFirestore();
  const dbDocRef = doc(db, "app_data", "lottery_winner_db");

  await runTransaction(db, async (transaction) => {
    const dbSnap = await transaction.get(dbDocRef);
    if (!dbSnap.exists()) return;
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;

    const invIndex = parsedDb.zinipayInvoices.findIndex((i: any) => i.id === pendingInvoiceId);
    if (invIndex !== -1) {
      parsedDb.zinipayInvoices[invIndex].status = "FAILED";
      parsedDb.zinipayInvoices[invIndex].updated_at = new Date().toISOString();
    }

    const depIndex = parsedDb.deposits.findIndex((d: any) => d.trxId === transactionId);
    if (depIndex !== -1) {
      parsedDb.deposits[depIndex].status = "rejected";
      parsedDb.deposits[depIndex].notes = `ZiniPay invoice creation failed: ${reason}`;
    }

    transaction.update(dbDocRef, {
      db: JSON.stringify(parsedDb),
      updatedAt: new Date().toISOString()
    });
  });
}

/**
 * Safely and atomically credits user wallet exactly once and updates transaction/invoice to COMPLETED.
 * Implementation of duplicate payment protection and transactional idempotency.
 */
export async function executeWalletCreditTransaction(
  userId: string,
  amount: number,
  invoiceId: string,
  transactionId: string,
  paymentDetails: any
) {
  const db = getBackendFirestore();
  const dbDocRef = doc(db, "app_data", "lottery_winner_db");
  const userDocRef = doc(db, "users", userId);

  return await runTransaction(db, async (transaction) => {
    const dbSnap = await transaction.get(dbDocRef);
    if (!dbSnap.exists()) {
      throw new Error("Monolithic database document not found in Firestore!");
    }
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;

    if (!parsedDb.users) parsedDb.users = [];
    if (!parsedDb.deposits) parsedDb.deposits = [];
    if (!parsedDb.zinipayInvoices) parsedDb.zinipayInvoices = [];

    // Duplicate Check 1: Check if this invoice is already marked as COMPLETED
    const existingInvoice = parsedDb.zinipayInvoices.find((inv: any) => inv.invoice_id === invoiceId);
    if (existingInvoice && existingInvoice.status === "COMPLETED") {
      console.log(`[ZiniPay] Duplicate protection: Invoice ${invoiceId} already completed.`);
      return { success: false, reason: "ALREADY_COMPLETED", invoice: existingInvoice };
    }

    const matchedUserIndex = parsedDb.users.findIndex((u: any) => u.id === userId);
    if (matchedUserIndex === -1) {
      throw new Error(`User with ID ${userId} not found in database!`);
    }

    const dbUser = parsedDb.users[matchedUserIndex];
    const username = dbUser.username;

    // Duplicate Check 2: Check if this transaction is already approved
    const existingDepositIndex = parsedDb.deposits.findIndex((dep: any) => dep.trxId === transactionId);
    if (existingDepositIndex !== -1 && parsedDb.deposits[existingDepositIndex].status === "approved") {
      console.log(`[ZiniPay] Duplicate protection: Deposit ${transactionId} already approved.`);
      return { success: false, reason: "ALREADY_COMPLETED" };
    }

    // Atomic Balance Credit
    const oldBalance = parseFloat(dbUser.balance || 0);
    const creditAmount = parseFloat(amount);
    const newBalance = Number((oldBalance + creditAmount).toFixed(2));
    dbUser.balance = newBalance;
    dbUser.totDeposit = Number(((dbUser.totDeposit || 0) + creditAmount).toFixed(2));

    // Update or insert transaction record
    if (existingDepositIndex !== -1) {
      parsedDb.deposits[existingDepositIndex].status = "approved";
      parsedDb.deposits[existingDepositIndex].notes = `ZiniPay Payment COMPLETED (Invoice: ${invoiceId})`;
      parsedDb.deposits[existingDepositIndex].amount = creditAmount; // Ensure correct amount is set
      parsedDb.deposits[existingDepositIndex].date = new Date().toISOString();
    } else {
      const newDepositRecord = {
        id: "dep_" + Date.now() + Math.floor(Math.random() * 1000),
        username: username,
        amount: creditAmount,
        method: "ZiniPay",
        gateway: "ZiniPay",
        trxId: transactionId,
        status: "approved",
        date: new Date().toISOString(),
        notes: `ZiniPay Payment COMPLETED (Invoice: ${invoiceId})`
      };
      parsedDb.deposits.unshift(newDepositRecord);
    }

    // Update or insert invoice record
    if (existingInvoice) {
      existingInvoice.status = "COMPLETED";
      existingInvoice.updated_at = new Date().toISOString();
      existingInvoice.verified_at = new Date().toISOString();
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verified_at: new Date().toISOString()
      };
      parsedDb.zinipayInvoices.unshift(newInvoice);
    }

    // Write monolithic database updates
    transaction.update(dbDocRef, {
      db: JSON.stringify(parsedDb),
      updatedAt: new Date().toISOString()
    });

    // Write direct User Profile document updates
    const userSnap = await transaction.get(userDocRef);
    if (userSnap.exists()) {
      transaction.update(userDocRef, {
        balance: newBalance,
        totDeposit: dbUser.totDeposit,
        updatedAt: new Date().toISOString()
      });
    }

    console.log(`[ZiniPay Ledger Committed] User ${username} balance +৳${creditAmount}. Balance is now: ৳${newBalance}`);
    return { success: true, newBalance, invoice: existingInvoice || parsedDb.zinipayInvoices[0] };
  });
}

/**
 * Express Controller: Creates a secure checkout session by communicating with ZiniPay hosted invoice API
 */
export async function handleZiniPayCheckout(req: any, res: any) {
  try {
    const { amount, fullName, email, userId } = req.body || {};
    const numAmount = parseFloat(amount);

    if (!userId) {
      return res.status(401).json({ status: false, message: "Authentication required to initiate deposit." });
    }

    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ status: false, message: "Invalid deposit amount. Must be greater than 0." });
    }

    // Generate unique internal transaction/order ID and create pending database records safely
    const { transactionId, pendingInvoiceId, username, email: userEmail } = await createPendingInvoiceTransaction(
      userId,
      numAmount,
      { cus_name: fullName, cus_email: email }
    );

    const apiKey = (process.env.ZINIPAY_API_KEY || "sandbox_test_8f4c9a2e7b31").trim();
    const isSandbox = apiKey === "sandbox_test_8f4c9a2e7b31";
    const createUrl = "https://api.zinipay.com/v1/payment/create";

    // Dynamic hosts detection for redirects, webhook, and cancel
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
        const invoiceId = responseData.invoice_id || responseData.invoiceId || responseData.data?.invoice_id || ("ZP-" + Date.now());
        const exactPaymentUrl = responseData.payment_url;
        
        // Save returned invoice details in pending database logs
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

      // If the API failed or returned invalid response
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

    } catch (apiErr: any) {
      console.error("[ZiniPay API Network Error]", apiErr);
      await markInvoiceAndTransactionFailed(pendingInvoiceId, transactionId, apiErr.message || "Network Timeout");
      return res.status(502).json({
        status: false,
        message: "Unable to establish secure connection with ZiniPay payment server. Please try again."
      });
    }

  } catch (err: any) {
    console.error("[ZiniPay Checkout Handler Critical Error]", err);
    return res.status(500).json({
      status: false,
      message: err.message || "An unexpected system error occurred while generating checkout invoice."
    });
  }
}

/**
 * Express Controller: Verifies payment status with ZiniPay backend API using transactional safety
 */
export async function handleZiniPayVerify(req: any, res: any) {
  try {
    const { order_id, invoice_id } = req.body || {};
    
    if (!order_id && !invoice_id) {
      return res.status(400).json({ status: false, message: "Missing order_id or invoice_id parameter." });
    }

    const db = getBackendFirestore();
    const dbDocRef = doc(db, "app_data", "lottery_winner_db");

    // Load monolithic database state to identify transaction
    const dbSnap = await getDoc(dbDocRef);
    if (!dbSnap.exists()) {
      return res.status(500).json({ status: false, message: "Internal Database Store is uninitialized." });
    }
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;

    // Find local invoice matching either order_id or invoice_id
    const localInvoice = (parsedDb.zinipayInvoices || []).find((inv: any) => 
      (order_id && inv.internal_order_id === order_id) || (invoice_id && inv.invoice_id === invoice_id)
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

    // Call ZiniPay server-side Verify API directly
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
        // Amount consistency validation guard
        if (verifiedAmount && Math.abs(verifiedAmount - localInvoice.amount) > 0.01) {
          console.error(`[ZiniPay Mismatch Alert] Amount mismatch! Requested ৳${localInvoice.amount}, verified ৳${verifiedAmount}`);
          return res.status(400).json({
            status: "SUSPICIOUS_MISMATCH",
            message: "Transaction amount mismatch. For your protection, wallet credit is paused.",
            invoice: localInvoice
          });
        }

        // Atomically and safely credit the wallet exactly once
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

  } catch (err: any) {
    console.error("[ZiniPay Verify Handler Critical Error]", err);
    return res.status(500).json({
      status: false,
      message: err.message || "An error occurred during payment verification."
    });
  }
}

/**
 * Express Controller: Handles secure webhook callbacks (instant payment notifications) from ZiniPay
 */
export async function handleZiniPayWebhook(req: any, res: any) {
  try {
    const invoiceId = req.body?.invoice_id || req.body?.invoiceId || req.query?.invoice_id || req.query?.invoiceId;
    console.log(`[ZiniPay Webhook Received] Invoice ID: ${invoiceId}`, req.body, req.query);

    if (!invoiceId) {
      return res.status(400).send("Bad Request: Missing invoice identifier.");
    }

    const db = getBackendFirestore();
    const dbDocRef = doc(db, "app_data", "lottery_winner_db");

    // Load database and locate the local invoice
    const dbSnap = await getDoc(dbDocRef);
    if (!dbSnap.exists()) {
      return res.status(500).send("Database not configured.");
    }
    const dbData = dbSnap.data();
    let parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;

    const localInvoice = (parsedDb.zinipayInvoices || []).find((inv: any) => inv.invoice_id === invoiceId);
    if (!localInvoice) {
      console.warn(`[ZiniPay Webhook Warning] Webhook received for untracked invoice: ${invoiceId}`);
      return res.status(404).send("Invoice not found.");
    }

    // Call ZiniPay Verify API to obtain server-side truth (never trust client payload or query inputs alone)
    const apiKey = (process.env.ZINIPAY_API_KEY || "sandbox_test_8f4c9a2e7b31").trim();
    const verifyUrl = "https://api.zinipay.com/v1/payment/verify";

    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "zini-api-key": apiKey
      },
      body: JSON.stringify({ invoiceId: invoiceId, invoice_id: invoiceId })
    });

    const verifyData = await verifyResponse.json().catch(() => null);
    console.log("[ZiniPay Webhook Server Verification Response]", verifyResponse.status, verifyData);

    if (verifyResponse.ok && verifyData) {
      const verifiedStatus = String(verifyData.status || verifyData.data?.status || "PENDING").toUpperCase();
      const verifiedAmount = parseFloat(verifyData.amount || verifyData.data?.amount || verifyData.verified_amount);

      if (verifiedStatus === "COMPLETED") {
        if (verifiedAmount && Math.abs(verifiedAmount - localInvoice.amount) > 0.01) {
          console.error(`[ZiniPay Webhook Mismatch] Suspicious amount detected! Expected ৳${localInvoice.amount}, got ৳${verifiedAmount}`);
          return res.status(400).send("Amount mismatch detected.");
        }

        // Safely and atomically credit the wallet exactly once
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

  } catch (err: any) {
    console.error("[ZiniPay Webhook Error]", err);
    return res.status(500).send("Internal Server Error processing Webhook.");
  }
}
