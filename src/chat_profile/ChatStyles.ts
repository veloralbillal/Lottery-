export const chatProfileStyles = `
  /* Soft custom scrollbars */
  .chat-scrollbar::-webkit-scrollbar {
    width: 5px;
  }
  .chat-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.4);
  }
  .chat-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(71, 85, 105, 0.5);
    border-radius: 4px;
  }
  .chat-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.8);
  }

  /* Radar aura rings for voice/video call overlay */
  @keyframes radarPulse {
    0% { transform: scale(0.9); opacity: 0.8; }
    50% { transform: scale(1.35); opacity: 0.3; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  .animate-radar-1 {
    animation: radarPulse 2s infinite ease-out;
  }
  .animate-radar-2 {
    animation: radarPulse 2s infinite ease-out 0.6s;
  }

  /* Equalizer audio wave animation */
  @keyframes eqWave {
    0%, 100% { height: 4px; }
    50% { height: 20px; }
  }
  .animate-eq-1 { animation: eqWave 0.8s infinite ease-in-out; }
  .animate-eq-2 { animation: eqWave 0.8s infinite ease-in-out 0.2s; }
  .animate-eq-3 { animation: eqWave 0.8s infinite ease-in-out 0.4s; }
  .animate-eq-4 { animation: eqWave 0.8s infinite ease-in-out 0.1s; }
  .animate-eq-5 { animation: eqWave 0.8s infinite ease-in-out 0.3s; }

  /* Sticker pop-in effect */
  @keyframes stickerPop {
    0% { transform: scale(0.5) rotate(-6deg); opacity: 0; }
    70% { transform: scale(1.1) rotate(2deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); }
  }
  .animate-sticker-pop {
    animation: stickerPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  /* Gift box shimmer */
  @keyframes giftShimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .gift-card-shine {
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%);
    background-size: 200% 100%;
    animation: giftShimmer 2.5s infinite;
  }
`;
