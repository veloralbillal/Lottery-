import { CustomizerStore } from "../dashboard_tabs/customizer_store.js";

export class CallSystem {
  static startCall(system: any, callType: "voice" | "video") {
    if (!system.activeChatUserId) return;
    const peer = system.findUserByIdOrUsername(system.activeChatUserId);
    if (!peer) return;

    system.activeCall = { peer, callType, seconds: 0 };
    const modal = document.getElementById("chat-call-modal");
    const peerName = document.getElementById("chat-call-peer-username");
    const callTimer = document.getElementById("chat-call-timer");
    const statusLabel = document.getElementById("chat-call-status-label");
    const avatarInit = document.getElementById("chat-call-avatar-initial");
    const avatarFrame = document.getElementById("chat-call-avatar-frame");

    if (peerName) peerName.innerText = `@${peer.username}`;
    if (avatarInit) avatarInit.innerText = peer.username ? peer.username[0].toUpperCase() : "?";
    if (avatarFrame) avatarFrame.innerHTML = CustomizerStore.getFrameOverlayHTML(peer.avatarFrame || "none");

    if (statusLabel) statusLabel.innerText = `${callType.toUpperCase()} Calling...`;
    if (callTimer) callTimer.innerText = "Connecting...";

    modal?.classList.remove("hidden");

    // Audio connect tone simulation
    if (typeof window !== "undefined" && ((window as any).AudioContext || (window as any).webkitAudioContext)) {
      try {
        const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch(e) {}
    }

    // Connect call after 2.5 seconds
    setTimeout(() => {
      if (!system.activeCall) return;
      if (statusLabel) statusLabel.innerText = `Connected (${callType.toUpperCase()})`;
      
      system.callSeconds = 0;
      if (system.callTimer) clearInterval(system.callTimer);
      system.callTimer = setInterval(() => {
        system.callSeconds++;
        const mins = Math.floor(system.callSeconds / 60).toString().padStart(2, '0');
        const secs = (system.callSeconds % 60).toString().padStart(2, '0');
        if (callTimer) callTimer.innerText = `${mins}:${secs}`;
      }, 1000);
    }, 2200);
  }

  static endCall(system: any) {
    if (system.callTimer) clearInterval(system.callTimer);
    const modal = document.getElementById("chat-call-modal");
    modal?.classList.add("hidden");

    if (system.activeCall && system.callSeconds > 0) {
      system.sendSpecialMessage({
        type: "text",
        content: `📞 ${system.activeCall.callType.toUpperCase()} Call ended (${Math.floor(system.callSeconds / 60)}m ${system.callSeconds % 60}s)`
      });
    }
    system.activeCall = null;
    system.callSeconds = 0;
  }
}
