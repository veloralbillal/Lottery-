import { chatProfileStyles } from "./ChatStyles.js";
import { 
  profileDetailsModalTemplate, 
  directChatModalTemplate, 
  chatGiftModalTemplate, 
  chatCallModalTemplate,
  profileMessagesButtonTemplate 
} from "./ChatTemplates.js";

export class UIRenderer {
  static initUI(system: any) {
    // 1. Inject Styles
    if (!document.getElementById("chat-profile-injected-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "chat-profile-injected-styles";
      styleEl.innerHTML = chatProfileStyles;
      document.head.appendChild(styleEl);
    }

    // 2. Inject Profile details modal
    if (!document.getElementById("profile-details-modal")) {
      const modal = document.createElement("div");
      modal.id = "profile-details-modal";
      modal.className = "fixed inset-0 z-[9990] bg-slate-950/90 backdrop-blur-md hidden flex items-center justify-center p-4 selection:bg-rose-500/10 transition-all duration-300";
      modal.innerHTML = profileDetailsModalTemplate;
      document.body.appendChild(modal);
    }

    // 3. Inject VIP Messenger Pro modal
    if (!document.getElementById("direct-chat-modal")) {
      const chatModal = document.createElement("div");
      chatModal.id = "direct-chat-modal";
      chatModal.className = "fixed inset-0 z-[9995] bg-slate-950/95 backdrop-blur-lg hidden flex items-center justify-center p-0 sm:p-4 selection:bg-emerald-500/10";
      chatModal.innerHTML = directChatModalTemplate;
      document.body.appendChild(chatModal);
    }

    // 4. Inject Send Tip / Gift Modal
    if (!document.getElementById("chat-gift-modal")) {
      const giftModal = document.createElement("div");
      giftModal.id = "chat-gift-modal";
      giftModal.className = "fixed inset-0 z-[9998] bg-slate-950/90 backdrop-blur-md hidden flex items-center justify-center p-4 selection:bg-amber-500/10";
      giftModal.innerHTML = chatGiftModalTemplate;
      document.body.appendChild(giftModal);
    }

    // 5. Inject Call Simulation Overlay Modal
    if (!document.getElementById("chat-call-modal")) {
      const callModal = document.createElement("div");
      callModal.id = "chat-call-modal";
      callModal.className = "fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl hidden flex flex-col items-center justify-between p-6 sm:p-10 text-white font-sans selection:bg-emerald-500/10";
      callModal.innerHTML = chatCallModalTemplate;
      document.body.appendChild(callModal);
    }

    // 6. Inject dynamic Messages button option inside user profile tab
    const badgeBtn = document.getElementById("profile-badge-request-entry-btn");
    if (badgeBtn && !document.getElementById("profile-messages-btn")) {
      const messagesBtn = document.createElement("button");
      messagesBtn.id = "profile-messages-btn";
      messagesBtn.className = "w-full flex justify-between items-center bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl hover:bg-slate-850/45 transition text-left cursor-pointer";
      messagesBtn.innerHTML = profileMessagesButtonTemplate;
      badgeBtn.parentNode?.insertBefore(messagesBtn, badgeBtn.nextSibling);
    }
  }
}
