/**
 * MiroFish Multi-Agent Community Simulation Engine
 * 
 * Inspired by MiroFish multi-agent digital society simulation.
 * Simulates an authentic, lively digital community of 36 distinct lottery players,
 * agents, and VIPs discussing lottery tickets, recent draw profits, winning stories, tips,
 * and strategies in friendly, everyday Banglish conversational style. Supports autonomous
 * periodic banter, threaded replies, and intelligent interactive responses.
 */

export interface MirofishPersona {
  id: string;
  username: string;
  name: string;
  avatar: string;
  role: 'VIP Member' | 'Moderator' | 'Agent' | 'Player';
  bio: string;
  balance: number;
  ticketsCount: number;
  totalWins: number;
  totalProfit: number;
  favoriteLottery: string;
  personality: 'analytical' | 'lucky_winner' | 'hype_player' | 'station_agent' | 'friendly_greeter' | 'jackpot_hunter';
}

export const MIROFISH_PERSONAS: MirofishPersona[] = [
  // Original 6
  {
    id: "mf_tanvir",
    username: "tanvir_pro",
    name: "তানভীর রহমান",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "লটারি এনালিস্ট ও ভিআইপি প্লেয়ার। হাই-অডস পুল ও মেগা ড্র ফ্যান। মোট প্রফিট ৳৭২,০০০!",
    balance: 48500,
    ticketsCount: 64,
    totalWins: 18,
    totalProfit: 72000,
    favoriteLottery: "Lucky 7 Grand",
    personality: "analytical"
  },
  {
    id: "mf_mim",
    username: "mim_lucky",
    name: "মিম সুলতানা",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "লাকি সেভেন চ্যাম্পিয়ন! লাস্ট উইকে ৳৫০,০০০ গ্র্যান্ড জ্যাকপট উইন। ইনস্ট্যান্ট কুইক ড্র লাভার।",
    balance: 52400,
    ticketsCount: 45,
    totalWins: 14,
    totalProfit: 55000,
    favoriteLottery: "1-Minute Quick Cash",
    personality: "lucky_winner"
  },
  {
    id: "mf_shanto",
    username: "shanto_king",
    name: "শান্ত রায়",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "প্রতিদিন ৫টা টিকেট মাস্ট! মেগা ১০০ এবং কুইক ড্র ফ্যানাটিক। মোট উইন ৯টি।",
    balance: 14200,
    ticketsCount: 38,
    totalWins: 9,
    totalProfit: 28500,
    favoriteLottery: "Mega 100",
    personality: "hype_player"
  },
  {
    id: "mf_rakib",
    username: "rakib_agent",
    name: "রাকিবুল হাসান",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "Agent",
    bio: "অফিশিয়াল অথরাইজড স্টেশন এজেন্ট। বিকাশ, নগদ ও রকেট ইনস্ট্যান্ট রিচার্জ ও ক্যাশআউট সাপোর্ট।",
    balance: 120500,
    ticketsCount: 102,
    totalWins: 25,
    totalProfit: 110000,
    favoriteLottery: "All Active Pools",
    personality: "station_agent"
  },
  {
    id: "mf_farhana",
    username: "farhana_star",
    name: "ফারহানা আক্তার",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    role: "Moderator",
    bio: "কমিউনিটি ফ্রেন্ড ও মডারেটর। মেগা অফার এবং ডেইলি বোনাস লাভার। গুড লাক এভরিওয়ান!",
    balance: 19800,
    ticketsCount: 29,
    totalWins: 7,
    totalProfit: 21000,
    favoriteLottery: "Mega 50",
    personality: "friendly_greeter"
  },
  {
    id: "mf_babu",
    username: "babu_investor",
    name: "বাবু ভাই",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "জ্যাকপট হান্টার। বড় পুলে একসাথে ১০টি টিকিট কিনে প্রফিট বাড়ানো আমার টেকনিক। মোট প্রফিট ৳৮৫,০০০!",
    balance: 64200,
    ticketsCount: 52,
    totalWins: 12,
    totalProfit: 85000,
    favoriteLottery: "Jackpot Pool ৳1,00,000",
    personality: "jackpot_hunter"
  },

  // Additional 30 Bangladeshi Community Members (Male & Female mixed)
  {
    id: "mf_sadiya",
    username: "sadiya_99",
    name: "সাদিয়া ইসলাম",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "কুইক ড্র লাভার! প্রতিদিন সকালে টিকেট কেটে লাক ট্রাই করি।",
    balance: 31000,
    ticketsCount: 28,
    totalWins: 8,
    totalProfit: 34000,
    favoriteLottery: "1-Minute Quick Cash",
    personality: "lucky_winner"
  },
  {
    id: "mf_jorina",
    username: "jorina_begum",
    name: "জোছনা বেগম",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "লটারির ফলাফল প্রতিদিন লাইভ দেখি। সবার জন্য দোয়া রইলো।",
    balance: 12500,
    ticketsCount: 15,
    totalWins: 4,
    totalProfit: 16500,
    favoriteLottery: "Mega 50",
    personality: "friendly_greeter"
  },
  {
    id: "mf_afrin",
    username: "afrin_akter",
    name: "আফরিন সুলতানা",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "স্মার্ট ইনভেস্টর ও লটারি টিকেট কালেক্টর।",
    balance: 45000,
    ticketsCount: 42,
    totalWins: 11,
    totalProfit: 49000,
    favoriteLottery: "Lucky 7 Grand",
    personality: "analytical"
  },
  {
    id: "mf_arif",
    username: "arif_hossain",
    name: "আরিফ হোসেন",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "প্রতিদিনের ড্র মিস করি না। আজকেও ৫টা টিকেট নিয়েছি!",
    balance: 18000,
    ticketsCount: 25,
    totalWins: 6,
    totalProfit: 22000,
    favoriteLottery: "Mega 100",
    personality: "hype_player"
  },
  {
    id: "mf_fahim",
    username: "fahim_faysal",
    name: "ফাহিম ফয়সাল",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "বিকাশ ক্যাশআউট একদম ইনস্ট্যান্ট পাই। দারুণ অ্যাপ!",
    balance: 24000,
    ticketsCount: 30,
    totalWins: 7,
    totalProfit: 27500,
    favoriteLottery: "Jackpot Pool",
    personality: "station_agent"
  },
  {
    id: "mf_sumi",
    username: "sumi_akter",
    name: "সুমি আক্তার",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "লটারির উত্তেজনা অন্যরকম। সবাই মিলে আড্ডা দিতে ভালো লাগে।",
    balance: 16000,
    ticketsCount: 20,
    totalWins: 5,
    totalProfit: 19000,
    favoriteLottery: "Mega 50",
    personality: "friendly_greeter"
  },
  {
    id: "mf_imran",
    username: "imran_khan",
    name: "ইমরান খান",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "বড় জ্যাকপটের আশায় নিয়মিত টিকেট বুকিং করি।",
    balance: 58000,
    ticketsCount: 55,
    totalWins: 13,
    totalProfit: 63000,
    favoriteLottery: "Lucky 7 Grand",
    personality: "jackpot_hunter"
  },
  {
    id: "mf_nusrat",
    username: "nusrat_jahan",
    name: "নুসরাত জাহান",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    role: "Moderator",
    bio: "গ্রুপের সবাই খুব ফ্রেন্ডলি। উইনিং প্রাইজগুলো রিয়েল!",
    balance: 29000,
    ticketsCount: 22,
    totalWins: 6,
    totalProfit: 25000,
    favoriteLottery: "Mega 100",
    personality: "friendly_greeter"
  },
  {
    id: "mf_sohel",
    username: "sohel_rana",
    name: "সোহেল রানা",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "নগদ ব্যালেন্স ইনস্ট্যান্ট রিসিভ করেছি। বেস্ট প্ল্যাটফর্ম।",
    balance: 21000,
    ticketsCount: 27,
    totalWins: 7,
    totalProfit: 24500,
    favoriteLottery: "1-Minute Quick Cash",
    personality: "station_agent"
  },
  {
    id: "mf_puja",
    username: "puja_rani",
    name: "পূজা রানী",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "আজকের ড্রতে ৩টি টিকেট নিয়েছি, দেখা যাক কী হয়!",
    balance: 14500,
    ticketsCount: 18,
    totalWins: 4,
    totalProfit: 17200,
    favoriteLottery: "Mega 50",
    personality: "hype_player"
  },
  {
    id: "mf_nazmul",
    username: "nazmul_hasan",
    name: "নাজমুল হাসান",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "অ্যানালিসিস করে লটারি খেলি। প্রফিট ভালোই হয়।",
    balance: 41000,
    ticketsCount: 39,
    totalWins: 10,
    totalProfit: 46000,
    favoriteLottery: "Lucky 7 Grand",
    personality: "analytical"
  },
  {
    id: "mf_mehedi",
    username: "mehedi_hassan",
    name: "মেহেদী হাসান",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "কুইক ড্র এর মজা আলাদা। ১ মিনিটে রেজাল্ট!",
    balance: 19500,
    ticketsCount: 24,
    totalWins: 6,
    totalProfit: 21000,
    favoriteLottery: "1-Minute Quick Cash",
    personality: "lucky_winner"
  },
  {
    id: "mf_taslima",
    username: "taslima_nasrin",
    name: "তাসলিমা নাসরিন",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "সবার উইনিং স্টোরি দেখে আমারও খেলতে ইচ্ছে করে।",
    balance: 15500,
    ticketsCount: 16,
    totalWins: 4,
    totalProfit: 18000,
    favoriteLottery: "Mega 50",
    personality: "friendly_greeter"
  },
  {
    id: "mf_kamal",
    username: "kamal_pasha",
    name: "কামাল পাশা",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "বড় ড্র মানেই বড় প্রফিট। সবসময় রেডি থাকি।",
    balance: 51000,
    ticketsCount: 48,
    totalWins: 12,
    totalProfit: 57000,
    favoriteLottery: "Jackpot Pool",
    personality: "jackpot_hunter"
  },
  {
    id: "mf_tania",
    username: "tania_akter",
    name: "তানিয়া আক্তার",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "লাকি ডে তে টিকেট কাটলে উইন হওয়ার চান্স বেশি থাকে।",
    balance: 22500,
    ticketsCount: 21,
    totalWins: 5,
    totalProfit: 24000,
    favoriteLottery: "Lucky 7 Grand",
    personality: "lucky_winner"
  },
  {
    id: "mf_rasel",
    username: "rasel_ahmed",
    name: "রাসেল আহমেদ",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "প্রতিদিন নিয়ম করে টিকেট কাটি। চ্যাট গ্রুপের সবাই দারুণ।",
    balance: 17500,
    ticketsCount: 22,
    totalWins: 5,
    totalProfit: 20500,
    favoriteLottery: "Mega 100",
    personality: "hype_player"
  },
  {
    id: "mf_nusrat_2",
    username: "nitu_akter",
    name: "নিতু আক্তার",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "গ্রুপের সবাই এত সুন্দর কথা বলে, মন ভালো হয়ে যায়।",
    balance: 16800,
    ticketsCount: 19,
    totalWins: 4,
    totalProfit: 18500,
    favoriteLottery: "Mega 50",
    personality: "friendly_greeter"
  },
  {
    id: "mf_shagor",
    username: "shagor_ahmed",
    name: "সাগর আহমেদ",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "অটো ডিপোজিট সিস্টেম চরম ফাস্ট। এক ক্লিকেই ডান!",
    balance: 26000,
    ticketsCount: 31,
    totalWins: 8,
    totalProfit: 29000,
    favoriteLottery: "1-Minute Quick Cash",
    personality: "station_agent"
  },
  {
    id: "mf_munia",
    username: "munia_islam",
    name: "মুনিয়া ইসলাম",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "আমার উইনিং প্রফিট দিয়ে আজ ফ্যামিলি নিয়ে বাইরে যাচ্ছি!",
    balance: 49000,
    ticketsCount: 44,
    totalWins: 11,
    totalProfit: 53000,
    favoriteLottery: "Lucky 7 Grand",
    personality: "lucky_winner"
  },
  {
    id: "mf_ripon",
    username: "ripon_mia",
    name: "রিপন মিয়া",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "লটারির নেশা না, এটা একটা দারুণ বিনোদন ও প্রফিট সোর্স।",
    balance: 23000,
    ticketsCount: 28,
    totalWins: 7,
    totalProfit: 26000,
    favoriteLottery: "Mega 100",
    personality: "hype_player"
  },
  {
    id: "mf_jannat",
    username: "jannat_ferdous",
    name: "জান্নাতুল ফেরদৌস",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "নিয়মিত জ্যাকপট পুলে পার্টিসিপেট করি। গুড লাক এভরিওয়ান!",
    balance: 38000,
    ticketsCount: 36,
    totalWins: 9,
    totalProfit: 42000,
    favoriteLottery: "Jackpot Pool",
    personality: "analytical"
  },
  {
    id: "mf_joy",
    username: "joy_chowdhury",
    name: "জয় চৌধুরী",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "আজকের ড্র কাউন্টডাউন শুরু হয়ে গেছে, কে কে টিকেট নিলেন?",
    balance: 19000,
    ticketsCount: 23,
    totalWins: 6,
    totalProfit: 21500,
    favoriteLottery: "1-Minute Quick Cash",
    personality: "hype_player"
  },
  {
    id: "mf_sabrina",
    username: "sabrina_yasmin",
    name: "সাবরিনা ইয়াসমিন",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "সবার সাথে আড্ডা দিতে দিতে কখন যে সময় কেটে যায় বুঝতেই পারি না।",
    balance: 17200,
    ticketsCount: 18,
    totalWins: 4,
    totalProfit: 19500,
    favoriteLottery: "Mega 50",
    personality: "friendly_greeter"
  },
  {
    id: "mf_alamin",
    username: "alamin_hossain",
    name: "আল আমিন হোসেন",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "স্টেশন এজেন্ট হিসেবে সবার পেমেন্ট ক্লিয়ার করতে পেরে আনন্দ পাই।",
    balance: 35000,
    ticketsCount: 40,
    totalWins: 10,
    totalProfit: 39000,
    favoriteLottery: "All Active Pools",
    personality: "station_agent"
  },
  {
    id: "mf_sadia_2",
    username: "sadia_jahan",
    name: "সাদিয়া জাহান",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "লাকি সেভেন ড্র আমার সবচেয়ে পছন্দের।",
    balance: 42000,
    ticketsCount: 37,
    totalWins: 10,
    totalProfit: 46500,
    favoriteLottery: "Lucky 7 Grand",
    personality: "lucky_winner"
  },
  {
    id: "mf_rubel",
    username: "rubel_rana",
    name: "রুবেল রানা",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "বড় প্রফিটের আশায় আছি। আজকের ড্র মিস করা যাবে না।",
    balance: 20500,
    ticketsCount: 26,
    totalWins: 6,
    totalProfit: 23000,
    favoriteLottery: "Mega 100",
    personality: "hype_player"
  },
  {
    id: "mf_nipa",
    username: "nipa_akter",
    name: "নিপা আক্তার",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "সবাইকে শুভকামনা! আশা করি আজ আমাদের সবার ভাগ্য খুলবে।",
    balance: 18200,
    ticketsCount: 20,
    totalWins: 5,
    totalProfit: 20000,
    favoriteLottery: "Mega 50",
    personality: "friendly_greeter"
  },
  {
    id: "mf_parvez",
    username: "parvez_mollah",
    name: "পারভেজ মোল্লা",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    role: "VIP Member",
    bio: "জ্যাকপট পুল উইনার! নিয়মিত খেললে প্রফিট নিশ্চিত।",
    balance: 61000,
    ticketsCount: 50,
    totalWins: 13,
    totalProfit: 68000,
    favoriteLottery: "Jackpot Pool",
    personality: "jackpot_hunter"
  },
  {
    id: "mf_shila",
    username: "shila_parvin",
    name: "শিলা পারভীন",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "কুইক ড্র থেকে ছোটখাটো প্রফিট নিয়মিত পাচ্ছি। আলহামদুলিল্লাহ!",
    balance: 24500,
    ticketsCount: 29,
    totalWins: 7,
    totalProfit: 27000,
    favoriteLottery: "1-Minute Quick Cash",
    personality: "lucky_winner"
  },
  {
    id: "mf_hasib",
    username: "hasib_ur_rahman",
    name: "হাসিবুর রহমান",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    role: "Player",
    bio: "অনলাইন লটারিতে এই প্ল্যাটফর্ম সবচেয়ে ট্রাস্টেড।",
    balance: 28000,
    ticketsCount: 32,
    totalWins: 8,
    totalProfit: 31000,
    favoriteLottery: "Lucky 7 Grand",
    personality: "analytical"
  }
];

export class MirofishAgentSimulation {
  private appInstance: any;
  private timer: any = null;
  private isRunning: boolean = false;
  private lastSpeakerIndex: number = -1;

  constructor(appInstance: any) {
    this.appInstance = appInstance;
  }

  public init() {
    this.ensurePersonasInDB();
    this.seedInitialMessagesIfEmpty();
    this.startSimulationLoop();
  }

  /**
   * Registers personas in the user DB so that their profile pages and data
   * can be looked up uniformly.
   */
  public ensurePersonasInDB() {
    if (!this.appInstance.db) return;
    if (!this.appInstance.db.users) this.appInstance.db.users = [];

    // Restore any custom added personas from persistent DB
    if (this.appInstance.db.customMirofishPersonas && Array.isArray(this.appInstance.db.customMirofishPersonas)) {
      this.appInstance.db.customMirofishPersonas.forEach((cp: MirofishPersona) => {
        if (!MIROFISH_PERSONAS.some(p => p.username === cp.username)) {
          MIROFISH_PERSONAS.push(cp);
        }
      });
    }

    MIROFISH_PERSONAS.forEach(p => {
      const exists = this.appInstance.db.users.find((u: any) => u.username === p.username);
      if (!exists) {
        this.appInstance.db.users.push({
          id: p.id,
          username: p.username,
          name: p.name,
          email: `${p.username}@lotterywinner.app`,
          password: "password123",
          role: p.role === 'Agent' ? 'agent' : (p.role === 'Moderator' ? 'moderator' : (p.role === 'VIP Member' ? 'vip' : 'player')),
          balance: p.balance,
          totDeposit: p.totalProfit + 15000,
          wins: p.totalWins,
          ticketsCount: p.ticketsCount,
          totalProfit: p.totalProfit,
          photo: p.avatar,
          bio: p.bio,
          joinDate: new Date(Date.now() - Math.floor(Math.random() * 30 + 10) * 86400000).toISOString(),
          status: "active"
        });
      }
    });

    // Ensure all existing users have non-null email and password for SQL bulk-sync
    this.appInstance.db.users.forEach((u: any) => {
      if (u) {
        if (!u.email) {
          u.email = `${u.username || u.id || 'user'}@lotterywinner.app`;
        }
        if (!u.password) {
          u.password = "password123";
        }
      }
    });
  }

  /**
   * Adds a new custom AI agent persona, saves to DB and synchronizes with users list
   */
  public addPersona(personaData: Partial<MirofishPersona>): MirofishPersona {
    const rawUsername = personaData.username || `agent_${Date.now().toString().slice(-4)}`;
    const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const id = personaData.id || ("mf_" + cleanUsername + "_" + Date.now().toString().slice(-4));
    const persona: MirofishPersona = {
      id,
      username: cleanUsername,
      name: personaData.name || cleanUsername,
      avatar: personaData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
      role: personaData.role || 'VIP Member',
      bio: personaData.bio || 'লটারি এবং জ্যাকপট গেম লাভার। সবার জন্য শুভকামনা!',
      balance: personaData.balance || ((personaData.totalProfit || 15000) + 5000),
      ticketsCount: personaData.ticketsCount || Math.floor(Math.random() * 30 + 10),
      totalWins: personaData.totalWins || Math.floor(Math.random() * 10 + 3),
      totalProfit: personaData.totalProfit !== undefined ? personaData.totalProfit : 15000,
      favoriteLottery: personaData.favoriteLottery || 'Lucky 7 Grand',
      personality: personaData.personality || 'lucky_winner'
    };

    // Update in-memory persona array
    const existingIdx = MIROFISH_PERSONAS.findIndex(p => p.username === persona.username);
    if (existingIdx >= 0) {
      MIROFISH_PERSONAS[existingIdx] = persona;
    } else {
      MIROFISH_PERSONAS.push(persona);
    }

    // Persist to customMirofishPersonas
    if (!this.appInstance.db.customMirofishPersonas) {
      this.appInstance.db.customMirofishPersonas = [];
    }
    const customIdx = this.appInstance.db.customMirofishPersonas.findIndex((p: any) => p.username === persona.username);
    if (customIdx >= 0) {
      this.appInstance.db.customMirofishPersonas[customIdx] = persona;
    } else {
      this.appInstance.db.customMirofishPersonas.push(persona);
    }

    // Add / update in users DB for SQL sync safety
    const userRole = persona.role === 'Agent' ? 'agent' : (persona.role === 'Moderator' ? 'moderator' : (persona.role === 'VIP Member' ? 'vip' : 'player'));
    const userObj = {
      id: persona.id,
      username: persona.username,
      name: persona.name,
      email: `${persona.username}@lotterywinner.app`,
      password: "password123",
      role: userRole,
      balance: persona.balance,
      totDeposit: persona.totalProfit + 15000,
      wins: persona.totalWins,
      ticketsCount: persona.ticketsCount,
      totalProfit: persona.totalProfit,
      photo: persona.avatar,
      bio: persona.bio,
      joinDate: new Date().toISOString(),
      status: "active"
    };

    const dbUserIdx = this.appInstance.db.users.findIndex((u: any) => u.username === persona.username);
    if (dbUserIdx >= 0) {
      this.appInstance.db.users[dbUserIdx] = { ...this.appInstance.db.users[dbUserIdx], ...userObj };
    } else {
      this.appInstance.db.users.push(userObj);
    }

    this.appInstance.saveDB();
    return persona;
  }

  /**
   * Seeds lively community conversation if group chat is pristine
   */
  private seedInitialMessagesIfEmpty() {
    if (!this.appInstance.db) return;
    if (!this.appInstance.db.groupChats) this.appInstance.db.groupChats = [];

    if (this.appInstance.db.groupChats.length === 0) {
      const initialSeed = [
        {
          id: "mf_msg_1",
          sender: "tanvir_pro",
          senderRole: "vip",
          message: "Hey guys, আজকের ড্র-এর আপডেট দেখেছ? কার ভাগ্য খুললো বলো তো! 🎟️🔥",
          timestamp: new Date(Date.now() - 240000).toISOString()
        },
        {
          id: "mf_msg_2",
          sender: "mim_lucky",
          senderRole: "vip",
          message: "আমি তো ভাই কালকে ৫টা টিকেট নিছিলাম, অলরেডি ২টা উইন হইছে ৳৫,০০০ প্রফিট আলহামদুলিল্লাহ! 🥳🎉",
          replyTo: { sender: "tanvir_pro", message: "Hey guys, আজকের ড্র-এর আপডেট দেখেছ? কার ভাগ্য খুললো বলো তো! 🎟️🔥" },
          timestamp: new Date(Date.now() - 180000).toISOString()
        },
        {
          id: "mf_msg_3",
          sender: "sadiya_99",
          senderRole: "vip",
          message: "congratulations! দারুণ একটা উইন হলো আজ! 🥳🎉 @mim_lucky আপু, আমি এখন ৩টা টিকেট কাটলাম, মেগা অফার কিন্তু চরম!",
          replyTo: { sender: "mim_lucky", message: "আমি তো ভাই কালকে ৫টা টিকেট নিছিলাম, অলরেডি ২টা উইন হইছে ৳৫,০০০ প্রফিট আলহামদুলিল্লাহ! 🥳🎉" },
          timestamp: new Date(Date.now() - 110000).toISOString()
        },
        {
          id: "mf_msg_4",
          sender: "babu_investor",
          senderRole: "vip",
          message: "ভাইরে ভাই, আগের ড্রতে ৳১২,০০০ প্রফিট পেয়ে সাথে সাথে বিকাশ এ ক্যাশআউট দিলাম, ৫ মিনিটেই চলে আসল! 💸🤑",
          timestamp: new Date(Date.now() - 50000).toISOString()
        },
        {
          id: "mf_msg_5",
          sender: "rakib_agent",
          senderRole: "agent",
          message: "সবার জন্য শুভকামনা! ব্যালেন্স শেষ হলে জানাবেন, বিকাশ ও নগদে ২ মিনিটে ইনস্ট্যান্ট রিচার্জ এভেইলএবল। 🛡️⚡",
          timestamp: new Date(Date.now() - 15000).toISOString()
        }
      ];

      this.appInstance.db.groupChats = initialSeed;
      this.appInstance.saveDB(true);
    }
  }

  public startSimulationLoop() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Run periodic multi-agent dialogue every 22-38 seconds
    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 16000) + 22000; // 22s - 38s
      this.timer = setTimeout(() => {
        const enabled = this.appInstance.db?.settings?.mirofishEnabled !== false;
        const chatEnabled = this.appInstance.db?.settings?.mirofishChatEnabled !== false;
        if (enabled && chatEnabled && (typeof document === 'undefined' || !document.hidden)) {
          this.triggerAutonomousAgentChat();
        }
        if (this.isRunning) scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  public stopSimulationLoop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Generates natural Banglish messages between AI agent personas
   * about real lotteries, profits, winning stories, and tips.
   */
  public triggerAutonomousAgentChat() {
    if (!this.appInstance.db) return;
    if (!this.appInstance.db.groupChats) this.appInstance.db.groupChats = [];

    // Select next speaker (avoid same speaker consecutively)
    let nextIdx = Math.floor(Math.random() * MIROFISH_PERSONAS.length);
    if (nextIdx === this.lastSpeakerIndex) {
      nextIdx = (nextIdx + 1) % MIROFISH_PERSONAS.length;
    }
    this.lastSpeakerIndex = nextIdx;
    const persona = MIROFISH_PERSONAS[nextIdx];

    // Reference real data from appInstance
    const lotteries = (this.appInstance.db.lotteries || []).filter((l: any) => l.status === "active");
    const sampleLot = lotteries.length > 0 ? lotteries[Math.floor(Math.random() * lotteries.length)] : null;
    const lotName = sampleLot ? sampleLot.name : "মেগা জ্যাকপট";
    const lotFee = sampleLot ? `৳${sampleLot.entryFee}` : "৳৫০";
    const jackpotPool = (Number(this.appInstance.db.settings?.jackpotPool) || 1584200).toLocaleString();

    // Check if replying to previous chat message
    const recentChats = this.appInstance.db.groupChats.slice(-3);
    const lastChat = recentChats.length > 0 ? recentChats[recentChats.length - 1] : null;
    const shouldReply = lastChat && lastChat.sender !== persona.username && Math.random() > 0.4;

    let messageText = "";
    let replyPayload: any = null;

    if (shouldReply && lastChat) {
      replyPayload = {
        id: lastChat.id,
        sender: lastChat.sender,
        message: lastChat.message || "Lottery Win"
      };

      // Contextual replies between personas focusing on profit & lottery excitement
      const contextualReplies = [
        `congratulations! দারুণ একটা উইন হলো আজ! 🥳🎉 @${lastChat.sender}`,
        `মাশাল্লাহ @${lastChat.sender} ভাই/আপু! দারুন প্রফিট! পার্টি কবে দিচ্ছেন? 🤩💸`,
        `@${lastChat.sender} একদম ঠিক বলেছ! আমি তো কালকে ৫টা টিকেট নিছিলাম, অলরেডি ২টা উইন হইছে ৳৫,০০০ প্রফিট আলহামদুলিল্লাহ! 🎟️✨`,
        `Nice win @${lastChat.sender}! ${lotName} পুলে চান্স বেশি থাকে সবসময়, আমি আরও ২টি টিকেট অ্যাড করলাম! 🤞`,
        `@${lastChat.sender} তোমার উইনিং স্ট্র্যাটেজিটা কাজে দিলো! আজকের জ্যাকপট পুল কিন্তু ৳${jackpotPool}! 🔥`,
        `@${lastChat.sender} তুমি মোট কত টিকেট নিয়েছিলে? আমি তো মাত্র ${lotFee} দিয়ে ১টা কেটেছিলাম! ⚡`,
        `আলহামদুলিল্লাহ! এই সাইটের সার্ভিস আসলেই সেরা, প্রফিটের টাকা ইনস্ট্যান্ট ওয়ালেটে অ্যাড হয়ে যায়! 💰✅ @${lastChat.sender}`
      ];
      messageText = contextualReplies[Math.floor(Math.random() * contextualReplies.length)];
    } else {
      // Standalone lottery topic messages per persona personality focusing on lottery profits
      const personaMessages: Record<string, string[]> = {
        analytical: [
          `Hey guys, নতুন লটারি টিকেটগুলো চেক করেছ? এইবারের প্রাইজ কিন্তু চরম! 📊🎟️`,
          `আজকের ড্র-এর আপডেট দেখেছ? কার ভাগ্য খুললো বলো তো! 🎟️`,
          `Statistically ${lotName} লটারিতে উইনিং রেশিও এখন সবচেয়ে হাই! আমি অলরেডি ৩টি টিকেট বুক করলাম। 📈`,
          `গ্র্যান্ড জ্যাকপট পুল অলরেডি ৳${jackpotPool} পার করে ফেললো! এটা কার ভাগ্যে যাবে কে জানে! 💰🔥`,
          `আমার মোট প্রফিট এখন ৳${persona.totalProfit.toLocaleString()} আলহামদুলিল্লাহ! টিকেটের প্রাইস আর রিটার্ন রেশিও এই সাইটে আসলেই বেস্ট। 🎯`
        ],
        lucky_winner: [
          `congratulations! দারুণ একটা উইন হলো আজ! 🥳🎉 লটারিতে রিস্ক নিলে লাভ আসলেই ভালো হয়!`,
          `আমি তো কালকে ৫টা টিকেট নিছিলাম, অলরেডি ২টা উইন হইছে ৳৫,০০০ প্রফিট আলহামদুলিল্লাহ! 💸✨`,
          `কে কে আছো আজকে ${lotName} টিকেট কাটছো? আমার তো অলরেডি ৫টা টিকেট রেডি! 🎟️💃`,
          `টিকেট মাত্র ${lotFee} টাকা, কিন্তু জিতলে পুরাই লাইফ চেঞ্জিং প্রাইজ! মিস করো না কেউ! 🚀`,
          `আমার লাস্ট উইনিং ৳${persona.totalProfit.toLocaleString()} ছাড়িয়ে গেছে! কুইক ড্রতে সবচেয়ে বেশি প্রফিট পেয়েছি। 🌸🤑`
        ],
        hype_player: [
          `ভাইরে ভাই! ${lotName}-এর কাউন্টডাউন তো শেষ হতে চলল! কার কার টিকেট কেনা শেষ? ⏱️⚡`,
          `আজকে যেভাবেই হোক জ্যাকপট জিততেই হবে! সবাই দোয়া কইরো বন্ধুরা! 🤲🎯`,
          `অনলাইনে এত ফাস্ট ড্র আর কোথাও দেখিনি! ড্র রেজাল্ট দেখতে সবসময় চরম এক্সাইটমেন্ট লাগে! 🎰🔥`,
          `আজকের ড্র-তে আমি পুরা ফুল কনফিডেন্ট! ৫টা টিকেট অলরেডি ডান, দেখা যাক কার কপাল খোলে! 💥`,
          `কালকে রাতে Quick Draw তে ৩টা টিকেট কাটছিলাম, ১টা লেগে গেছে! ৳৭,৫০০০ প্রফিট আসলো! 🤑🔥`
        ],
        station_agent: [
          `সবাইকে শুভেচ্ছা! যেকোনো সাপোর্ট লাগলে বলবেন। ডিপোজিট ও উইথড্র ব্যালেন্স ইনস্ট্যান্ট ক্লিয়ার হচ্ছে। ⚡✅`,
          `টিকেট কেনার আগে সবাই নিজ নিজ ওয়ালেট ব্যালেন্স চেক করে নিন, ড্র কিন্তু অন-টাইমে শুরু হবে! ⏱️`,
          `আজকের ${lotName} ড্র-এর টিকেট প্রায় শেষের পথে! দ্রুত টিকেট সংগ্রহ করুন। 🎟️🏪`,
          `ক্যাশআউট রিকোয়েস্টগুলো অলরেডি বিকাশ/নগদে প্রসেসড! উইনারদের সবাইকে আন্তরিক অভিনন্দন! 🏆`,
          `কারো বিকাশ বা নগদে রিচার্জ নিয়ে হেল্প লাগলে বলবেন, ২ মিনিটের মধ্যে অটো ক্রেডিট হয়ে যায়। 🛡️👍`
        ],
        friendly_greeter: [
          `Hey everyone! কেমন আছো সবাই? আজকে কার কার লাকি ডে মনে হচ্ছে? 🌟😊`,
          `আজকের মেগা অফারটা মিস করো না কেউ! টিকেট সংখ্যা কিন্তু লিমিটেড! 🎟️✨`,
          `congratulations to all today's winners! 🥳🎉 কার কত প্রফিট হলো শেয়ার করো তো!`,
          `লটারিতে ধৈর্য আর নিয়মিত পার্টিসিপেশনই মেইন। সবাই গুড লাক! 🍀`,
          `আজকের দিনটা দারুণ! কমিউনিটিতে সবাই চমৎকার উইন করছে, সবার জন্য দোয়া রইলো! 💖`
        ],
        jackpot_hunter: [
          `জ্যাকপট পুলে অলরেডি ৳${jackpotPool}! আমি একসাথে ১০টা টিকেট নিয়ে রাখলাম, দেখা যাক কী হয়! 💰🎯`,
          `ভাইরে ভাই, আগের ড্রতে ৳১২,০০০ প্রফিট পেয়ে সাথে সাথে বিকাশ এ ক্যাশআউট দিলাম, ৫ মিনিটেই চলে আসল! 💸`,
          `টিকেট মাত্র ৫০ টাকা দিয়ে কেটেছিলাম, কিন্তু প্রাইজ আসলো ৩,০০০ টাকা! পুরাই ৬ গুণ লাভ! 🤑`,
          `বড় জ্যাকপটে ঢুকলে উইনিং রিওয়ার্ড বেশি পাওয়া যায়। কার কার টিকেট কাটা শেষ? 🎟️🔥`
        ]
      };

      const pool = personaMessages[persona.personality] || personaMessages.friendly_greeter;
      messageText = pool[Math.floor(Math.random() * pool.length)];
    }

    // Add message to group chats
    const newChat = {
      id: "mf_auto_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      sender: persona.username,
      senderRole: persona.role === 'Agent' ? 'agent' : (persona.role === 'VIP Member' ? 'vip' : 'user'),
      message: messageText,
      replyTo: replyPayload,
      timestamp: new Date().toISOString()
    };

    this.appInstance.db.groupChats.push(newChat);

    // Keep chat history clean & optimal (max 60 messages)
    if (this.appInstance.db.groupChats.length > 60) {
      this.appInstance.db.groupChats = this.appInstance.db.groupChats.slice(-60);
    }

    this.appInstance.saveDB(true);

    // If currently on group chat screen, re-render smoothly
    if (this.appInstance.currentTab === "group-chat") {
      this.appInstance.renderGroupChat();
    }
  }

  /**
   * Handles human user messages and crafts authentic Banglish replies
   * addressing the user directly within 2 to 3.5 seconds.
   */
  public handleUserMessage(userMessage: string, username: string) {
    if (!userMessage || !username) return;
    const enabled = this.appInstance.db?.settings?.mirofishEnabled !== false;
    const chatEnabled = this.appInstance.db?.settings?.mirofishChatEnabled !== false;
    if (!enabled || !chatEnabled) return;

    // Pick an appropriate persona to reply based on message keywords
    const lower = userMessage.toLowerCase();
    let responder: MirofishPersona = MIROFISH_PERSONAS[0];

    if (lower.includes("deposit") || lower.includes("bkas") || lower.includes("nagad") || lower.includes("recharge") || lower.includes("টাকা") || lower.includes("ডিপোজিট") || lower.includes("পেমেন্ট") || lower.includes("ক্যাশআউট")) {
      responder = MIROFISH_PERSONAS.find(p => p.username === "rakib_agent") || MIROFISH_PERSONAS[3];
    } else if (lower.includes("win") || lower.includes("জিত") || lower.includes("profit") || lower.includes("লাভ") || lower.includes("জিতলাম") || lower.includes("জ্যাকপট") || lower.includes("প্রফিট")) {
      responder = MIROFISH_PERSONAS.find(p => p.username === "mim_lucky") || MIROFISH_PERSONAS[1];
    } else if (lower.includes("ticket") || lower.includes("টিকেট") || lower.includes("kivabe") || lower.includes("rules") || lower.includes("কিভাবে") || lower.includes("কোনটা") || lower.includes("ড্র")) {
      responder = MIROFISH_PERSONAS.find(p => p.username === "tanvir_pro") || MIROFISH_PERSONAS[0];
    } else if (lower.includes("আসসালামু") || lower.includes("salam") || lower.includes("hi") || lower.includes("hello") || lower.includes("হাই") || lower.includes("কেমন")) {
      responder = MIROFISH_PERSONAS.find(p => p.username === "farhana_star") || MIROFISH_PERSONAS[4];
    } else {
      // Pick random friendly persona from the 36 members
      responder = MIROFISH_PERSONAS[Math.floor(Math.random() * MIROFISH_PERSONAS.length)];
    }

    // Show realistic typing indicator
    if (this.appInstance.currentTab === "group-chat") {
      const typingIndicator = document.getElementById("group-chat-typing-indicator");
      const typingText = document.getElementById("group-typing-text");
      if (typingIndicator && typingText) {
        typingText.innerText = `@${responder.username} টাইপ করছেন...`;
        typingIndicator.classList.remove("hidden");
      }
    }

    // Delay reply 2.0 - 3.5s for authentic conversational cadence
    const replyDelay = Math.floor(Math.random() * 1500) + 2000;

    setTimeout(() => {
      // Hide typing indicator
      if (this.appInstance.currentTab === "group-chat") {
        const typingIndicator = document.getElementById("group-chat-typing-indicator");
        if (typingIndicator) typingIndicator.classList.add("hidden");
      }

      const lotteries = (this.appInstance.db.lotteries || []).filter((l: any) => l.status === "active");
      const sampleLot = lotteries.length > 0 ? lotteries[0] : null;
      const lotName = sampleLot ? sampleLot.name : "মেগা ড্র";

      let replyMsg = "";

      if (lower.includes("profit") || lower.includes("প্রফিট") || lower.includes("লাভ") || lower.includes("কে কত")) {
        const profitReplies = [
          `@${username} ভাইয়া, আমি কালকে ৫টা টিকেট নিছিলাম, অলরেডি ২টা উইন হইছে ৳৫,০০০ প্রফিট আলহামদুলিল্লাহ! 🥳🎉 টিকেটের প্রাইস মাত্র ৫০ টাকা ছিল!`,
          `@${username} ভাই, আমার মোট প্রফিট এখন ৳${responder.totalProfit.toLocaleString()} ছাড়িয়েছে! Lucky 7 আর 1-Minute Quick Cash এ বেশি উইন আসে। ট্রাই করতে পারেন! 💸🔥`,
          `@${username} আমি তো আগের ড্রতে ৳১২,০০০ প্রফিট পেয়ে সাথে সাথে বিকাশ এ ক্যাশআউট দিয়েছিলাম, ৫ মিনিটেই টাকা পেয়ে গেছি! 🤑💰`,
          `congratulations! দারুণ একটা উইন হলো আজ! 🥳🎉 @${username} ভাই আপনার প্রফিটের কথা শুনে খুব ভালো লাগলো!`
        ];
        replyMsg = profitReplies[Math.floor(Math.random() * profitReplies.length)];
      } else if (lower.includes("deposit") || lower.includes("bkas") || lower.includes("nagad") || lower.includes("টাকা") || lower.includes("ডিপোজিট") || lower.includes("পেমেন্ট")) {
        replyMsg = `@${username} ভাইয়া, ওয়ালেট সেকশন থেকে বিকাশ বা নগদে অটো ডিপোজিট করতে পারবেন। মাত্র ১-২ মিনিটে একাউন্টে টাকা যোগ হয়ে যায়! কোনো সমস্যায় আমাকে ইনবক্স করতে পারেন। 🛡️⚡`;
      } else if (lower.includes("win") || lower.includes("জিত") || lower.includes("জিতলাম")) {
        replyMsg = `congratulations @${username} ভাই! দারুণ একটা উইন হলো আজ! 🥳🎉 চরম লাক আপনার! পার্টি কবে দিচ্ছেন বলুন? 💸🤩`;
      } else if (lower.includes("ticket") || lower.includes("টিকেট") || lower.includes("কোনটা") || lower.includes("ভালো") || lower.includes("কিভাবে")) {
        replyMsg = `@${username} bro, আমি সাজেস্ট করবো '${lotName}' ট্রাই করতে পারেন! এটার প্রাইজপুল অনেক ভালো আর উইনিং চান্স বেশি থাকে। 🎟️🎯`;
      } else if (lower.includes("আসসালামু") || lower.includes("salam")) {
        replyMsg = `ওয়ালাইকুম আসসালাম @${username} ভাই! কেমন আছেন? আজকের ড্র-এর আপডেট দেখেছ? কার ভাগ্য খুললো বলো তো! 🎟️✨`;
      } else if (lower.includes("hi") || lower.includes("hello") || lower.includes("হাই") || lower.includes("kemon")) {
        replyMsg = `Hey @${username}! কেমন আছেন ভাই? নতুন লটারি টিকেটগুলো চেক করেছ? এইবারের প্রাইজ কিন্তু চরম! 🚀🔥`;
      } else {
        const genericReplies = [
          `Hey guys, নতুন লটারি টিকেটগুলো চেক করেছ? এইবারের প্রাইজ কিন্তু চরম! @${username} ভাই 🚀`,
          `আজকের ড্র-এর আপডেট দেখেছ? কার ভাগ্য খুললো বলো তো! 🎟️ @${username}`,
          `@${username} একদম ঠিক বলেছেন ভাই! আজকের ড্র কিন্তু পুরাই জমে উঠবে! 🔥🎟️`,
          `congratulations! দারুণ একটা উইন হলো আজ! 🥳🎉 @${username} সবার জন্য শুভকামনা রইলো! 💰🤲`,
          `@${username} ভাই, আমি তো কালকে ৫টা টিকেট নিছিলাম, অলরেডি ২টা উইন হইছে ৳৫,০০০ প্রফিট আলহামদুলিল্লাহ! 💸`
        ];
        replyMsg = genericReplies[Math.floor(Math.random() * genericReplies.length)];
      }

      const agentReplyChat = {
        id: "mf_reply_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        sender: responder.username,
        senderRole: responder.role === 'Agent' ? 'agent' : (responder.role === 'VIP Member' ? 'vip' : 'user'),
        message: replyMsg,
        replyTo: {
          sender: username,
          message: userMessage
        },
        timestamp: new Date().toISOString()
      };

      if (!this.appInstance.db.groupChats) this.appInstance.db.groupChats = [];
      this.appInstance.db.groupChats.push(agentReplyChat);

      if (this.appInstance.db.groupChats.length > 60) {
        this.appInstance.db.groupChats = this.appInstance.db.groupChats.slice(-60);
      }

      this.appInstance.saveDB(true);

      if (this.appInstance.currentTab === "group-chat") {
        this.appInstance.renderGroupChat();
      }

      // 35% chance a second agent chimes in 2.5-4s later for lively multi-agent banter!
      if (Math.random() < 0.35) {
        setTimeout(() => {
          const secondPool = MIROFISH_PERSONAS.filter(p => p.username !== responder.username);
          const secondAgent = secondPool[Math.floor(Math.random() * secondPool.length)];

          const secondReplies = [
            `congratulations! দারুণ একটা উইন হলো আজ! 🥳🎉 @${username}`,
            `@${responder.username} একদম ঠিক বলেছে! আজকের ড্র-এর অফারটা আসলেই মিস করার মতো না! 🎟️✨`,
            `Best of luck @${username} ভাই! দেখা যাক আজকের জ্যাকপট কে নিয়ে যায়! 🚀🔥`,
            `সবার জন্যই শুভকামনা! প্রফিটের টাকা ভালো কাজে লাগুক! 💖💸`
          ];

          const secondChat = {
            id: "mf_second_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
            sender: secondAgent.username,
            senderRole: secondAgent.role === 'Agent' ? 'agent' : (secondAgent.role === 'VIP Member' ? 'vip' : 'user'),
            message: secondReplies[Math.floor(Math.random() * secondReplies.length)],
            replyTo: {
              sender: responder.username,
              message: replyMsg
            },
            timestamp: new Date().toISOString()
          };

          this.appInstance.db.groupChats.push(secondChat);
          if (this.appInstance.db.groupChats.length > 60) {
            this.appInstance.db.groupChats = this.appInstance.db.groupChats.slice(-60);
          }
          this.appInstance.saveDB(true);
          if (this.appInstance.currentTab === "group-chat") {
            this.appInstance.renderGroupChat();
          }
        }, Math.floor(Math.random() * 1500) + 2500);
      }

    }, replyDelay);
  }

  /**
   * Renders the MiroFish Multi-Agent Community modal with all 36 members
   */
  public openMirofishCommunityModal() {
    const modalId = "mirofish-community-modal";
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement("div");
      modal.id = modalId;
      modal.className = "fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-slate-900 border border-blue-500/30 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-200 max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-lg ring-2 ring-cyan-500/20">
              <i class="fa-solid fa-robot"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-black text-white">MiroFish AI Community (${MIROFISH_PERSONAS.length} Agents)</h3>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> লাইভ সক্রিয়
                </span>
              </div>
              <p class="text-[11px] text-slate-400">৩৬ জন রিয়েলিস্টিক বাংলাদেশি মেম্বারের মাল্টি-এজেন্ট লটারি আড্ডা</p>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('${modalId}').remove()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Description Banner -->
        <div class="bg-blue-950/40 border border-blue-500/30 p-3 rounded-2xl text-xs space-y-1 shrink-0">
          <p class="text-slate-300 leading-relaxed text-[11px]">
            🤖 <strong>MiroFish AI Digital World:</strong> এই ৩৬ জন সদস্য (যেমন সাদিয়া, জর্না, আফরিন, তানভীর, মিমসহ অন্যান্যরা) সার্বক্ষণিক গ্রুপে সক্রিয় থেকে লটারি টিকেট, রিসেন্ট ড্র রেজাল্ট এবং কে কত প্রফিট করলো তা নিয়ে ফ্রেন্ডলি আড্ডা দেয়।
          </p>
        </div>

        <!-- Agent Cards List -->
        <div class="overflow-y-auto space-y-2.5 pr-1 flex-1">
          ${MIROFISH_PERSONAS.map(p => {
            const roleBadgeClass = p.role === 'Agent' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
              (p.role === 'VIP Member' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40');
            return `
              <div class="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/40 p-3.5 rounded-2xl flex items-center justify-between gap-3 transition">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="relative shrink-0">
                    <img src="${p.avatar}" alt="${p.name}" class="w-11 h-11 rounded-full object-cover border border-slate-700 shadow-md" />
                    <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <h4 class="text-xs font-bold text-white truncate">${p.name}</h4>
                      <span class="text-[9px] font-mono text-slate-400">@${p.username}</span>
                      <span class="text-[9px] font-mono px-1.5 py-0.5 rounded-md border ${roleBadgeClass}">${p.role}</span>
                    </div>
                    <p class="text-[10px] text-slate-400 truncate mt-0.5">${p.bio}</p>
                    <div class="flex items-center gap-3 text-[10px] text-slate-300 mt-1 font-mono">
                      <span>মোট জয়: <strong class="text-amber-400 font-bold">${p.totalWins}টি</strong></span>
                      <span>•</span>
                      <span>প্রফিট: <strong class="text-emerald-400 font-bold">৳${p.totalProfit.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>টিকেট: <strong class="text-cyan-400 font-bold">${p.ticketsCount}টি</strong></span>
                    </div>
                  </div>
                </div>
                <button type="button" onclick="document.getElementById('${modalId}').remove(); if(window.app){window.app.openMemberProfile('${p.username}');}" class="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-md">
                  প্রোফাইল
                </button>
              </div>
            `;
          }).join("")}
        </div>

        <!-- Footer Action -->
        <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <button type="button" onclick="if(window.app && window.app.mirofishSimulation){window.app.mirofishSimulation.triggerAutonomousAgentChat(); window.app.showToast('🚀 AI মেম্বার তাৎক্ষণিক আড্ডা শুরু করেছে!', 'success'); document.getElementById('${modalId}').remove();}" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-center shadow-lg">
            <i class="fa-solid fa-comments mr-1.5"></i> এখনই আড্ডা ট্রিগার করুন (Trigger Chat Now)
          </button>
        </div>
      </div>
    `;
  }
}
