import { CustomizerStore } from "../dashboard_tabs/customizer_store.js";

export class ChatSystem {
  static renderConversations(system: any) {
    const chatList = document.getElementById("chats-conversations-list");
    if (!chatList) return;

    chatList.innerHTML = "";
    const currUser = system.app.currentUser;
    const currId = currUser.id;
    const currName = currUser.username.toLowerCase();

    const messages = system.app.db.directMessages || [];
    const participantsSet = new Set<string>();

    messages.forEach((m: any) => {
      const fromLower = m.fromId?.toLowerCase();
      const toLower = m.toId?.toLowerCase();

      if (fromLower === currId?.toLowerCase() || fromLower === currName) {
        participantsSet.add(m.toId);
      }
      if (toLower === currId?.toLowerCase() || toLower === currName) {
        participantsSet.add(m.fromId);
      }
    });

    (system.app.db.friendships || []).forEach((f: any) => {
      if (f.status === "accepted") {
        const fromLower = f.fromId?.toLowerCase();
        const toLower = f.toId?.toLowerCase();

        if (fromLower === currId?.toLowerCase() || fromLower === currName) {
          participantsSet.add(f.toId);
        }
        if (toLower === currId?.toLowerCase() || toLower === currName) {
          participantsSet.add(f.fromId);
        }
      }
    });

    participantsSet.add("lottery_pro");
    participantsSet.add("lucky_player");

    let conversationUsers = Array.from(participantsSet).filter(id => {
      const isMe = (id?.toLowerCase() === currId?.toLowerCase() || id?.toLowerCase() === currName);
      return !isMe;
    });

    if (system.searchTerm) {
      conversationUsers = conversationUsers.filter(userId => {
        const peer = system.findUserByIdOrUsername(userId);
        return peer && peer.username.toLowerCase().includes(system.searchTerm);
      });
    }

    if (conversationUsers.length === 0) {
      chatList.innerHTML = `
        <div class="text-center py-8 text-[10.5px] text-slate-500 italic font-sans px-4">
          No matching chats found. Check Friends Tab or add contacts!
        </div>
      `;
      return;
    }

    conversationUsers.forEach(userId => {
      const peer = system.findUserByIdOrUsername(userId);
      if (!peer) return;

      const peerId = peer.id || peer.username;
      const unreadsCount = messages.filter((m: any) => 
        (m.fromId === peer.id || m.fromId === peer.username) && 
        (m.toId === currUser.id || m.toId === currUser.username) && 
        m.status === "unread"
      ).length;

      const peerMessages = messages.filter((m: any) => 
        ((m.fromId === currUser.id || m.fromId === currUser.username) && (m.toId === peer.id || m.toId === peer.username)) ||
        ((m.fromId === peer.id || m.fromId === peer.username) && (m.toId === currUser.id || m.toId === currUser.username))
      );
      peerMessages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      let lastMsgText = "No previous communication records.";
      if (peerMessages.length > 0) {
        const lastM = peerMessages[peerMessages.length - 1];
        if (lastM.type === "sticker") lastMsgText = `[Sticker ${lastM.content}]`;
        else if (lastM.type === "gift") lastMsgText = `🎁 Cash Gift ৳${lastM.amount || 100}`;
        else if (lastM.type === "voice") lastMsgText = `🎤 Voice Note (${lastM.duration || 5}s)`;
        else lastMsgText = lastM.content;
        
        if (lastMsgText.length > 28) lastMsgText = lastMsgText.substring(0, 26) + "...";
      }

      const activeStyle = (system.activeChatUserId === peerId) 
        ? "bg-gradient-to-r from-emerald-600/20 to-teal-650/15 border-emerald-500/40 text-white shadow-md shadow-emerald-950/20" 
        : "bg-slate-950/40 border-slate-850/80 text-slate-300 hover:bg-slate-950/80 hover:border-slate-800";
      
      const frameHtml = CustomizerStore.getFrameOverlayHTML(peer.avatarFrame || "none");

      const item = document.createElement("div");
      item.className = `flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition duration-150 transform hover:scale-[1.01] ${activeStyle}`;
      item.innerHTML = `
        <div class="relative shrink-0 select-none w-10 h-10">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-850 border border-slate-800 flex items-center justify-center font-black text-xs uppercase text-slate-200 shadow-md">
            ${peer.username ? peer.username[0] : "?"}
          </div>
          <div class="absolute inset-0 pointer-events-none">${frameHtml}</div>
          <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[3px] border-slate-900 animate-pulse shadow-sm z-30"></span>
        </div>

        <div class="flex-1 min-w-0 text-left">
          <div class="flex justify-between items-center">
            <span class="text-xs font-black truncate text-slate-100">@${peer.username}</span>
            ${unreadsCount > 0 ? `<span class="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 shadow-sm animate-bounce">${unreadsCount}</span>` : ""}
          </div>
          <p class="text-[10px] text-slate-500 truncate mt-1 font-medium leading-none">${lastMsgText}</p>
        </div>
      `;

      item.addEventListener("click", () => {
        system.selectActiveConversation(peerId);
      });

      chatList.appendChild(item);
    });
  }

  static renderMessages(system: any) {
    const stream = document.getElementById("chat-messages-stream");
    if (!stream) return;

    stream.innerHTML = "";
    const peer = system.findUserByIdOrUsername(system.activeChatUserId);
    if (!peer) return;

    const currUser = system.app.currentUser;
    const messages = system.app.db.directMessages || [];

    const thread = messages.filter((m: any) => 
      ((m.fromId === currUser.id || m.fromId === currUser.username) && (m.toId === peer.id || m.toId === peer.username)) ||
      ((m.fromId === peer.id || m.fromId === peer.username) && (m.toId === currUser.id || m.toId === currUser.username))
    );

    thread.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (thread.length === 0) {
      stream.innerHTML = `
        <div class="text-center py-10 opacity-70 font-sans space-y-2 my-auto select-none">
          <div class="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mx-auto text-lg shadow-lg animate-bounce">
            <i data-lucide="lock"></i>
          </div>
          <span class="text-xs font-black text-slate-300 block">End-to-End Encrypted Tunnel Active</span>
          <p class="text-[9.5px] max-w-[220px] mx-auto leading-normal text-slate-500">Secure message node connected. Say hello, send a voice note or tip a lucky gift card to @${peer.username}!</p>
        </div>
      `;
      return;
    }

    const themes: any = {
      cosmic: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
      royal: "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20",
      neon: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20",
      ruby: "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20",
      dragon: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20",
      sakura: "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20"
    };
    const themeBubbleStyle = themes[system.activeTheme] || themes.cosmic;

    thread.forEach((msg: any) => {
      const isMe = (msg.fromId === currUser.id || msg.fromId === currUser.username);
      const alignClass = isMe ? "self-end items-end" : "self-start items-start";
      const bubbleClass = isMe 
        ? `${themeBubbleStyle} rounded-t-2xl rounded-bl-2xl shadow-md border border-white/10` 
        : "bg-slate-900 border border-slate-805 text-slate-100 rounded-t-2xl rounded-br-2xl shadow-sm";

      const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let bodyHtml = "";

      if (msg.type === "sticker") {
        bodyHtml = `
          <div class="p-3 bg-slate-950/80 border border-amber-500/40 rounded-2xl flex flex-col items-center gap-1 shadow-lg animate-sticker-pop">
            <span class="text-4xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">${msg.content}</span>
            <span class="text-[8px] text-amber-400 font-mono uppercase font-black tracking-widest">${msg.name || 'VIP Sticker'}</span>
          </div>
        `;
      } else if (msg.type === "gift") {
        const isClaimed = msg.claimed;
        bodyHtml = `
          <div class="p-3.5 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-2xl space-y-2 text-left max-w-xs shadow-xl gift-card-shine">
            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase font-mono font-black text-amber-400 flex items-center gap-1">
                <i data-lucide="gift"></i> VIP Cash Gift
              </span>
              <span class="text-xs font-black text-amber-300">৳${msg.amount || 100}</span>
            </div>
            <p class="text-xs text-slate-200 font-sans italic">${msg.note || 'Best of luck!'}</p>
            
            ${!isMe ? `
              <button class="claim-gift-btn w-full py-1.5 px-3 rounded-xl font-black text-xs transition cursor-pointer ${isClaimed ? 'bg-slate-900 text-slate-500 border border-slate-800' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 hover:scale-[1.02]'}" data-msg-id="${msg.id}" ${isClaimed ? 'disabled' : ''}>
                ${isClaimed ? 'Claimed ✓' : 'Claim ৳' + (msg.amount || 100) + ' Gift 🎉'}
              </button>
            ` : `
              <span class="block text-[8px] text-amber-400 font-mono text-right font-bold">${isClaimed ? 'Claimed by recipient ✓' : 'Sent Gift Card'}</span>
            `}
          </div>
        `;
      } else if (msg.type === "voice") {
        bodyHtml = `
          <div class="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-md w-56">
            <button class="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow">
              <i data-lucide="play" class="ml-0.5"></i>
            </button>
            <div class="flex-1 space-y-1">
              <div class="flex items-end gap-1 h-4">
                <span class="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
                <span class="w-0.5 h-4 bg-teal-400 rounded-full"></span>
                <span class="w-0.5 h-2 bg-emerald-400 rounded-full"></span>
                <span class="w-0.5 h-4 bg-cyan-400 rounded-full"></span>
                <span class="w-0.5 h-3 bg-teal-400 rounded-full"></span>
                <span class="w-0.5 h-2 bg-emerald-400 rounded-full"></span>
              </div>
              <div class="flex justify-between text-[8px] font-mono text-slate-400">
                <span>00:00</span>
                <span>00:${(msg.duration || 5).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        `;
      } else {
        bodyHtml = `
          <div class="px-3.5 py-2 text-xs leading-normal font-sans whitespace-pre-wrap select-text ${bubbleClass}">
            ${msg.content}
          </div>
        `;
      }

      const msgDiv = document.createElement("div");
      msgDiv.className = `flex flex-col max-w-[85%] sm:max-w-[75%] ${alignClass} space-y-0.5 text-left`;
      msgDiv.innerHTML = `
        ${!isMe ? `<span class="text-[7.5px] font-bold text-slate-500 font-mono tracking-wide pl-1.5 select-none">@${peer.username}</span>` : ""}
        
        ${bodyHtml}

        <div class="flex items-center gap-1 text-[7.5px] font-mono text-slate-600 px-1 select-none">
          <span>${timeStr}</span>
          ${isMe ? `<i data-lucide="check-check" class="text-[7px] ${msg.status === "read" ? "text-emerald-400" : "text-slate-600"}"></i>` : ""}
        </div>
      `;

      stream.appendChild(msgDiv);
    });

    setTimeout(() => {
      stream.scrollTop = stream.scrollHeight;
    }, 40);
  }

  static triggerMockResponder(system: any, senderPeer: any) {
    const peerId = senderPeer.id || senderPeer.username;
    
    if (system.automatedTimers[peerId]) {
      clearTimeout(system.automatedTimers[peerId]);
    }

    const typingIndicator = document.getElementById("chat-typing-feedback");
    const indicatorUser = document.getElementById("typing-feedback-username");

    system.automatedTimers[peerId] = setTimeout(() => {
      if (indicatorUser) indicatorUser.innerText = `@${senderPeer.username}`;
      typingIndicator?.classList.remove("hidden");

      const stream = document.getElementById("chat-messages-stream");
      if (stream) stream.scrollTop = stream.scrollHeight;

      system.automatedTimers[peerId] = setTimeout(() => {
        typingIndicator?.classList.add("hidden");

        const repliesPool = [
          "Hey player! Checking out some pool combinations. Best of luck in the upcoming Hourly Drawings!",
          "Yes! I am actively participating. Let me know if you need to double check any promo ticket codes.",
          "Direct secure messages are completely loaded. It's fully functional!",
          "Thanks for the support. May major luck be with your drawings!",
          "Awesome. Did you take a lucky spin on the wheel of fortune today?"
        ];

        let randomReplyText = repliesPool[Math.floor(Math.random() * repliesPool.length)];

        if (senderPeer.username === "lottery_pro") {
          const proAnswers = [
            "Hey! Active VIP computations are online. How can I assist with your ticket strategy?",
            "Make sure to keep a close eye on the Jackpot Pools. The payouts have reached massive figures!",
            "I highly recommend regular deposits. It keeps the transaction volume steady.",
            "You can request premium Star or Vip badges using the Request Badges section in your tab!"
          ];
          randomReplyText = proAnswers[Math.floor(Math.random() * proAnswers.length)];
        } else if (senderPeer.username === "lucky_player") {
          const luckyAnswers = [
            "Hey yo! Just loaded some credits. Let's hit the community draws!",
            "I actually won a minor prize yesterday. Sending you heaps of good energy!",
            "Did you try sending a friend invitation using your referral link yet?"
          ];
          randomReplyText = luckyAnswers[Math.floor(Math.random() * luckyAnswers.length)];
        }

        const responderMessage = {
          id: "msg_" + Math.random().toString(36).substring(2, 10),
          fromId: senderPeer.id || senderPeer.username,
          toId: system.app.currentUser ? (system.app.currentUser.id || system.app.currentUser.username) : "admin",
          type: "text",
          content: randomReplyText,
          timestamp: new Date().toISOString(),
          status: system.activeChatUserId === peerId ? "read" : "unread"
        };

        system.app.db.directMessages.push(responderMessage);
        system.app.saveDB();

        if (system.activeChatUserId === peerId) {
          system.renderMessageStreams();
        }
        system.renderChatsConversationsList();
        system.updateNotificationBadgeOff();
      }, 1400);

    }, 850);
  }
}
