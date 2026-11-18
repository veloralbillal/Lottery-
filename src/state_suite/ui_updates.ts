export interface UIModule {
  db: any;
  currentUser: any;
}

export function updateSiteBranding(db: any) {
  if (typeof document === "undefined" || !db || !db.settings) return;

  const s = db.settings;
  const rawSiteName = String(s.siteName || "").trim();
  const displaySiteName = rawSiteName || "Lottery Winner";

  document.querySelectorAll(".brand-site-name").forEach(el => {
    (el as HTMLElement).textContent = displaySiteName;
  });

  if (rawSiteName) {
    const formattedTitle = `${rawSiteName} - Mobile Lottery Portal`;
    document.title = formattedTitle;
    const dynTitle = document.getElementById("dynamic-title");
    if (dynTitle) dynTitle.textContent = formattedTitle;
  }

  const footerBrand = document.getElementById("sys-auth-footer-brand");
  const authFooterText = String(s.authFooterText || "").trim();
  if (footerBrand && authFooterText) {
    footerBrand.textContent = authFooterText;
  }

  const faviconUrl = String(s.faviconUrl || "").trim();
  const dynFavicon = document.getElementById("dynamic-favicon") as HTMLLinkElement | null;
  if (dynFavicon && faviconUrl) {
    dynFavicon.href = faviconUrl;
  }
  const faviconPreview = document.getElementById("admin-current-favicon-preview") as HTMLImageElement | null;
  if (faviconPreview) {
    faviconPreview.src = faviconUrl || "./logo.jpg";
  }

  const headerLogo = String(s.headerLogo || s.appLogo || s.logoUrl || "").trim();

  const headerImg = document.getElementById("header-logo-img") as HTMLImageElement | null;
  const headerIcon = document.getElementById("header-logo-icon") as HTMLElement | null;
  if (headerImg && headerIcon) {
    if (headerLogo) {
      headerImg.onerror = () => {
        headerImg.classList.add("hidden");
        headerIcon.classList.remove("hidden");
      };
      if (headerImg.getAttribute("src") !== headerLogo) {
        headerImg.src = headerLogo;
      }
      headerImg.classList.remove("hidden");
      headerIcon.classList.add("hidden");
    } else {
      headerImg.removeAttribute("src");
      headerImg.classList.add("hidden");
      headerIcon.classList.remove("hidden");
    }
  }

  const seoPreviewImg = document.getElementById("admin-current-logo-preview") as HTMLImageElement | null;
  if (seoPreviewImg) {
    seoPreviewImg.src = headerLogo || "./logo.jpg";
  }

  const webPreviewImg = document.getElementById("web-header-logo-preview-img") as HTMLImageElement | null;
  const webPreviewIcon = document.getElementById("web-header-logo-preview-icon") as HTMLElement | null;
  if (webPreviewImg && webPreviewIcon) {
    if (headerLogo) {
      webPreviewImg.onerror = () => {
        webPreviewImg.classList.add("hidden");
        webPreviewIcon.classList.remove("hidden");
      };
      if (webPreviewImg.getAttribute("src") !== headerLogo) {
        webPreviewImg.src = headerLogo;
      }
      webPreviewImg.classList.remove("hidden");
      webPreviewIcon.classList.add("hidden");
    } else {
      webPreviewImg.removeAttribute("src");
      webPreviewImg.classList.add("hidden");
      webPreviewIcon.classList.remove("hidden");
    }
  }
}

export function updateMetaTags(db: any) {
  updateSiteBranding(db);

  if (!db || !db.settings || !db.settings.ogSettings) return;
  const { title, description, image } = db.settings.ogSettings;
  const hasCustomSiteName = Boolean(String(db.settings.siteName || "").trim());

  const sets = [
    { id: "og-title", attr: "content", val: title },
    { id: "og-desc", attr: "content", val: description },
    { id: "og-image", attr: "content", val: image },
    { id: "twitter-title", attr: "content", val: title },
    { id: "twitter-desc", attr: "content", val: description },
    { id: "twitter-image", attr: "content", val: image },
    ...(!hasCustomSiteName ? [{ id: "dynamic-title", attr: "innerText", val: title }] : []),
    { id: "dynamic-desc", attr: "content", val: description }
  ];

  sets.forEach(s => {
    const el = document.getElementById(s.id);
    if (el && s.val !== undefined) {
      if (s.attr === "innerText") (el as HTMLElement).innerText = s.val;
      else el.setAttribute(s.attr, s.val);
    }
  });
}

export function updateAllWalletBalanceUI(currentUser: any) {
  if (!currentUser) return;
  const currentBal = Number(currentUser.balance) || 0;
  const formattedBal = `৳${currentBal.toFixed(2)}`;
  const username = currentUser.username || "Player";

  const ids = [
    "agent-overview-wallet-balance", "agent-sidebar-balance", "agent-cash-till-balance",
    "user-wallet-balance", "curr-user-balance", "wallet-main-balance",
    "deposit-user-balance", "withdraw-user-balance"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = formattedBal;
  });

  const headerBalInline = document.getElementById("agent-header-balance-inline");
  if (headerBalInline) headerBalInline.innerText = `Balance: ${formattedBal}`;

  const walletNum = document.getElementById("wallet-balance-num");
  if (walletNum) walletNum.innerText = currentBal.toFixed(2);

  document.querySelectorAll(".curr-balance").forEach(el => {
    (el as HTMLElement).innerText = currentBal.toFixed(2);
  });

  document.querySelectorAll(".curr-username").forEach(el => {
    (el as HTMLElement).innerText = username;
  });
}
