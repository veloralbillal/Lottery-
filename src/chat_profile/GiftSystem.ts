export class GiftSystem {
  static renderStickersGrid(system: any, category: string) {
    const grid = document.getElementById("stickers-grid-container");
    if (!grid) return;

    grid.innerHTML = "";

    const stickerPacks: any = {
      vip: [
        { name: "Crown", icon: "👑" },
        { name: "Diamond", icon: "💎" },
        { name: "Fire", icon: "🔥" },
        { name: "Trophy", icon: "🏆" },
        { name: "Star", icon: "⭐" },
        { name: "Shield", icon: "🛡️" },
        { name: "Rocket", icon: "🚀" },
        { name: "Gem", icon: "🔮" }
      ],
      luck: [
        { name: "Jackpot", icon: "🎰" },
        { name: "777", icon: "🎯" },
        { name: "Clover", icon: "🍀" },
        { name: "Money Bag", icon: "💰" },
        { name: "Cash Stack", icon: "💵" },
        { name: "Fortune Wheel", icon: "🎡" },
        { name: "Gold Coins", icon: "🪙" },
        { name: "Gift Box", icon: "🎁" }
      ],
      emojis: [
        { name: "Love", icon: "❤️" },
        { name: "Fire", icon: "🔥" },
        { name: "Laugh", icon: "😂" },
        { name: "Thumbs Up", icon: "👍" },
        { name: "Party", icon: "🎉" },
        { name: "Cool", icon: "😎" },
        { name: "Kiss", icon: "😘" },
        { name: "Sparkles", icon: "✨" }
      ],
      phrases: [
        { name: "Good Luck!", text: "Good luck on your drawings today! 🍀" },
        { name: "Let's Win Big!", text: "Let's win big in the Jackpot Pool! 💰" },
        { name: "VIP Status", text: "VIP Status Activated 👑" },
        { name: "Congrats!", text: "Huge congratulations on your win! 🎉" }
      ]
    };

    const items = stickerPacks[category] || stickerPacks.vip;

    items.forEach((item: any) => {
      const btn = document.createElement("button");
      if (category === "phrases") {
        btn.className = "col-span-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left text-[10px] text-slate-200 font-bold transition hover:border-amber-500/60";
        btn.innerText = item.text;
        btn.addEventListener("click", () => {
          const input = document.getElementById("chat-messages-compose-input") as HTMLInputElement | null;
          if (input) input.value = item.text;
          document.getElementById("chat-stickers-popover")?.classList.add("hidden");
        });
      } else {
        btn.className = "p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-2xl hover:scale-110 transition flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/60 shadow-sm";
        btn.innerHTML = `<span>${item.icon}</span><span class="text-[8px] text-slate-500 font-mono mt-0.5">${item.name}</span>`;
        btn.addEventListener("click", () => {
          system.sendSpecialMessage({ type: "sticker", content: item.icon, name: item.name });
          document.getElementById("chat-stickers-popover")?.classList.add("hidden");
        });
      }
      grid.appendChild(btn);
    });
  }

  static submitSendGift(system: any) {
    if (!system.activeChatUserId) return;
    const currUser = system.app.currentUser;
    const activeAmountBtn = document.querySelector(".gift-amount-btn.bg-amber-500\\/20");
    const amount = parseInt(activeAmountBtn?.getAttribute("data-amount") || "100");

    const activeStyleBtn = document.querySelector(".gift-style-btn.bg-amber-950\\/60");
    const style = activeStyleBtn?.getAttribute("data-style") || "gold";

    const noteInput = document.getElementById("chat-gift-note-input") as HTMLInputElement | null;
    const note = noteInput?.value?.trim() || "Best of luck with your drawings! 🍀";

    if ((currUser.balance || 0) < amount) {
      system.app.showToast(`Insufficient balance (Need ৳${amount}). Please deposit funds.`, "error");
      return;
    }

    // Deduct balance
    currUser.balance = (currUser.balance || 0) - amount;
    system.app.saveDB();
    if (system.app.updateHeaderBalanceUI) system.app.updateHeaderBalanceUI();

    system.sendSpecialMessage({
      type: "gift",
      amount: amount,
      style: style,
      note: note,
      claimed: false,
      content: `🎁 Cash Gift Card ৳${amount}`
    });

    system.closeGiftModal();
    system.app.showToast(`Sent ৳${amount} Cash Gift Card!`, "success");
  }

  static claimGift(system: any, msgId: string) {
    const messages = system.app.db.directMessages || [];
    const msg = messages.find((m: any) => m.id === msgId);
    if (!msg || msg.claimed) {
      system.app.showToast("This gift card has already been claimed or expired.", "info");
      return;
    }

    msg.claimed = true;
    const currUser = system.app.currentUser;
    currUser.balance = (currUser.balance || 0) + (msg.amount || 100);
    system.app.saveDB();
    if (system.app.updateHeaderBalanceUI) system.app.updateHeaderBalanceUI();

    system.app.showToast(`🎉 Congratulations! Claimed ৳${msg.amount || 100} Cash Gift to your wallet!`, "success");
    system.renderMessageStreams();
  }
}
