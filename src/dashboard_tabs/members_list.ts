import { MIROFISH_PERSONAS } from "../js/mirofishAgentSimulation.js";

export interface CommunityMember {
  id: string;
  username?: string;
  name: string;
  avatar: string;
  role: 'Admin' | 'Moderator' | 'VIP Member' | 'Member' | 'Agent';
  status: 'online' | 'offline' | 'active';
  joinedDate: string;
  ticketsCount: number;
  winAmount: number;
}

export class MembersListManager {
  public members: CommunityMember[] = [];
  private onlineCount: number = 88;
  private totalCount: number = 624;
  private intervalId: any = null;

  constructor() {
    this.members = this.generateRealMembers();
  }

  private generateRealMembers(): CommunityMember[] {
    const members: CommunityMember[] = [];

    // Prepend active MiroFish AI simulation community members
    MIROFISH_PERSONAS.forEach((p) => {
      members.push({
        id: p.id,
        username: p.username,
        name: p.name,
        avatar: p.avatar,
        role: p.role === 'Agent' ? 'Agent' : (p.role === 'VIP Member' ? 'VIP Member' : (p.role === 'Moderator' ? 'Moderator' : 'Member')),
        status: 'online',
        joinedDate: "2026-02-10",
        ticketsCount: p.ticketsCount,
        winAmount: p.totalProfit
      });
    });

    const names = [
      "বিল্লাল হোসেন", "রহিম উদ্দিন", "করিমুল ইসলাম", "সাকিল আহমেদ", "নাজমুল হাসান",
      "তানভীর রহমান", "আরিফ হোসেন", "ফাহিম ফয়সাল", "ইমরান খান", "সোহেল রানা",
      "জাকির হোসেন", "কামাল পাশা", "শরিফুল ইসলাম", "নাসির উদ্দিন", "আলামিন হোসেন",
      "হাসিবুল ইসলাম", "মেহেদী হাসান", "রাশেদুল ইসলাম", "মামুনুর রশিদ", "শামসুল আলম",
      "মনির হোসেন", "জুয়েল রানা", "আশিকুর রহমান", "সাগর আহমেদ", "রিপন মিয়া",
      "নাঈম ইসলাম", "সোহাগ মিয়া", "জনি আহমেদ", "শান্ত ইসলাম", "হৃদয় খান"
    ];

    for (let i = members.length + 1; i <= this.totalCount; i++) {
      const isOnline = i <= this.onlineCount || Math.random() < 0.2;
      let role: 'Admin' | 'Moderator' | 'VIP Member' | 'Member' | 'Agent' = 'Member';
      if (i === 1) role = 'Admin';
      else if (i <= 4) role = 'Moderator';
      else if (i <= 20) role = 'VIP Member';

      const nameIdx = (i - 1) % names.length;
      const baseName = names[nameIdx];
      const memberName = i > names.length ? `${baseName} (${i})` : baseName;

      members.push({
        id: `mem_${i}`,
        username: `user_${i}`,
        name: memberName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=member_${i}`,
        role,
        status: isOnline ? 'online' : 'offline',
        joinedDate: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        ticketsCount: Math.floor(Math.random() * 50) + 2,
        winAmount: Math.floor(Math.random() * 25000) + 1000
      });
    }
    return members;
  }

  public getOnlineCount(): number {
    return this.onlineCount;
  }

  public getTotalCount(): number {
    return this.totalCount;
  }

  public startRealtimeFluctuation(onUpdate?: (online: number) => void) {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      // Fluctuate online count realistically between 84 and 93
      const delta = Math.random() > 0.5 ? 1 : -1;
      this.onlineCount = Math.max(82, Math.min(95, this.onlineCount + delta));
      if (onUpdate) onUpdate(this.onlineCount);

      // Update DOM elements if present
      const badgeText = document.getElementById("real-online-count-text");
      if (badgeText) {
        badgeText.innerText = `${this.onlineCount} জন অনলাইন`;
      }
    }, 4000);
  }

  public stopRealtimeFluctuation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public renderMembersScreen(filterQuery: string = "") {
    const container = document.getElementById("real-members-list-content");
    if (!container) return;

    const query = filterQuery.toLowerCase().trim();
    const filtered = this.members.filter(m => 
      m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query) || m.role.toLowerCase().includes(query)
    );

    const countBadge = document.getElementById("real-members-count-badge");
    if (countBadge) countBadge.innerText = `${this.totalCount} জন`;

    const onlineBadge = document.getElementById("real-online-count-text");
    if (onlineBadge) onlineBadge.innerText = `${this.onlineCount} জন অনলাইন`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-xs">
          <i class="fa-solid fa-user-slash text-2xl mb-2 text-slate-600"></i>
          <p>কোনো মেম্বার পাওয়া যায়নি</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(m => {
      let roleBadgeColor = "bg-slate-800 text-slate-300 border-slate-700";
      if (m.role === 'Admin') roleBadgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
      else if (m.role === 'Moderator') roleBadgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      else if (m.role === 'VIP Member') roleBadgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/40";

      const statusColor = m.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600';

      return `
        <div class="member-card bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl flex items-center justify-between transition cursor-pointer group" data-member-id="${m.id}">
          <div class="flex items-center gap-3 min-w-0">
            <div class="relative shrink-0">
              <img src="${m.avatar}" alt="${m.name}" class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 object-cover" />
              <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full ${statusColor} border-2 border-slate-950"></span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-bold text-white truncate group-hover:text-blue-400 transition">${m.name}</h4>
                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded-md border ${roleBadgeColor}">${m.role}</span>
              </div>
              <p class="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>টিকেট: <strong class="text-amber-400 font-mono">${m.ticketsCount}টি</strong></span>
                <span>•</span>
                <span>জয়: <strong class="text-emerald-400 font-mono">৳${m.winAmount.toLocaleString()}</strong></span>
              </p>
            </div>
          </div>
          <div class="shrink-0 text-slate-500 group-hover:text-blue-400 transition pl-2">
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </div>
        </div>
      `;
    }).join("");

    // Attach click listeners to member cards to open profile
    container.querySelectorAll(".member-card").forEach(card => {
      card.addEventListener("click", () => {
        const memId = card.getAttribute("data-member-id");
        const member = this.members.find(x => x.id === memId);
        if (member && (window as any).app && typeof (window as any).app.openMemberProfile === 'function') {
          (window as any).app.openMemberProfile(member);
        }
      });
    });
  }
}

export const membersListManager = new MembersListManager();
