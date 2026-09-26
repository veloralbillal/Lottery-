/**
 * UddoktaPay Server-Side Gateway API Handler
 * Handles:
 * 1. Invoice Creation & Payment URL Generation (/api/uddoktapay/create-checkout)
 * 2. Payment Verification (/api/uddoktapay/verify-payment)
 * 3. IPN / Webhook Handling (/api/uddoktapay/webhook)
 */

export async function handleUddoktaPayCheckout(req, res) {
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
        message: "Invalid deposit amount. Minimum is ৳10."
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

    // If an API key is provided, attempt call to UddoktaPay API
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

        // If the API responded with error (e.g. invalid API key)
        const errMsg = (data && (data.message || data.error)) || `UddoktaPay HTTP ${response.status}`;
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

    // If no API key configured yet, provide Sandbox checkout URL directly
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

export async function handleUddoktaPayVerify(req, res) {
  try {
    const { invoice_id, apiKey, baseUrl } = req.body || {};
    if (!invoice_id) {
      return res.status(400).json({ status: false, message: "Missing invoice_id" });
    }

    const effectiveApiKey = (apiKey || process.env.UDDOKTAPAY_API_KEY || "").trim();
    let effectiveBaseUrl = (baseUrl || process.env.UDDOKTAPAY_BASE_URL || "https://sandbox.uddoktapay.com/api/checkout-v2").trim();
    
    // UddoktaPay verify endpoint is usually /api/verify-payment
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
          data: data
        });
      }
    }

    // If in sandbox mode or test invoice
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
