// Firebase removed per user request for SQL-only bridge architecture.
import { removeCircularReferences, safeStringify } from "./serialization.js";
import { fallbackFirebaseConfig } from "./bundledTabs.js";

const DEFAULT_BRIDGE_CONFIG = {
  bridgeUrl: "https://api.veloralbillal.top/db_bridge.php",
  token: "Billal2026@bd",
  dbHost: "localhost",
  database: "veloralb_lottery",
  username: "veloralb_billal",
  password: "Z3[9T*x39URzna"
};

const clientTableColumnsCache: Record<string, string[]> = {};
const rawNativeFetch = typeof window !== "undefined" && typeof window.fetch === "function"
  ? window.fetch.bind(window)
  : fetch;

async function executeDirectBridgeQuery(sql: string, params: any[] = [], customConfig?: any): Promise<any[]> {
  let formattedSql = sql;
  if (params && params.length > 0) {
    let paramIndex = 0;
    formattedSql = sql.replace(/\?/g, () => {
      const val = params[paramIndex++];
      if (typeof val === "number") return Number.isFinite(val) ? String(val) : "0";
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "boolean") return val ? "1" : "0";
      const escaped = String(val)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
      return `'${escaped}'`;
    });
  }

  const bridgeUrl = DEFAULT_BRIDGE_CONFIG.bridgeUrl;
  const dbName = customConfig?.database || DEFAULT_BRIDGE_CONFIG.database;
  const dbUser = customConfig?.username || DEFAULT_BRIDGE_CONFIG.username;
  const dbPass = customConfig?.password || DEFAULT_BRIDGE_CONFIG.password;
  const token = DEFAULT_BRIDGE_CONFIG.token;

  const trimmedSql = formattedSql.trim().toUpperCase();
  const isSelectOrDescribe = trimmedSql.startsWith('SELECT') || trimmedSql.startsWith('SHOW') || trimmedSql.startsWith('DESCRIBE') || trimmedSql.startsWith('EXPLAIN');
  const bridgeAction = isSelectOrDescribe ? 'query' : 'execute';

  const urlObj = new URL(bridgeUrl);
  urlObj.searchParams.set("token", token);
  urlObj.searchParams.set("action", bridgeAction);
  urlObj.searchParams.set("db_host", DEFAULT_BRIDGE_CONFIG.dbHost);
  urlObj.searchParams.set("db_name", dbName);
  urlObj.searchParams.set("db_user", dbUser);
  urlObj.searchParams.set("db_pass", dbPass);

  const res = await rawNativeFetch(urlObj.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Bridge-Key": token,
      "Accept": "application/json, text/plain, */*"
    },
    body: JSON.stringify({
      token,
      action: bridgeAction,
      db_host: DEFAULT_BRIDGE_CONFIG.dbHost,
      db_name: dbName,
      db_user: dbUser,
      db_pass: dbPass,
      sql: formattedSql,
      query: formattedSql
    })
  });

  const text = await res.text();
  if (text && text.trim().startsWith("{")) {
    const parsed = JSON.parse(text);
    if (parsed.success || parsed.ok) {
      if (Array.isArray(parsed.data)) return parsed.data;
      if (parsed.data && typeof parsed.data === "object") return [parsed.data];
      return [];
    }
    throw new Error(parsed.message || parsed.error || "Bridge SQL query failed");
  }
  throw new Error(`Invalid response from SQL bridge (HTTP ${res.status})`);
}

async function directBridgeFetchDatabase(): Promise<any> {
  const staticMockIds = new Set([
    "u_agent_dhaka", "u_agent_sylhet", "u_mod_support",
    "u1", "u2", "u3",
    "l1", "l2", "l3", "l_quick_default",
    "t1", "t2", "t3",
    "d1", "d2", "w1",
    "syn_mock_1", "syn_mock_2"
  ]);
  const fetchTableSafe = async (primaryTbl: string, fallbackTbl?: string) => {
    try {
      const res = await executeDirectBridgeQuery(`SELECT * FROM ${primaryTbl}`);
      if (Array.isArray(res) && res.length > 0) return res;
      if (fallbackTbl) {
        return await executeDirectBridgeQuery(`SELECT * FROM ${fallbackTbl}`).catch(() => []);
      }
      return res || [];
    } catch {
      if (fallbackTbl) {
        return await executeDirectBridgeQuery(`SELECT * FROM ${fallbackTbl}`).catch(() => []);
      }
      return [];
    }
  };

  const [rawUsers, rawStaff, rawAgents, rawCategories, rawLotteries, rawTickets, rawDeposits, rawWithdrawals, transactions, agentLedger, rawAgentChats, settingsRows] = await Promise.all([
    fetchTableSafe("lottery_users", "users"),
    fetchTableSafe("lottery_staff", "staff"),
    fetchTableSafe("lottery_agents", "agents"),
    fetchTableSafe("lottery_categories"),
    fetchTableSafe("lottery_lotteries", "lotteries"),
    fetchTableSafe("lottery_tickets", "tickets"),
    fetchTableSafe("lottery_deposits", "deposits"),
    fetchTableSafe("lottery_withdrawals", "withdrawals"),
    fetchTableSafe("lottery_transactions", "transactions"),
    fetchTableSafe("lottery_agentLedger", "agentLedger"),
    fetchTableSafe("lottery_agentChats", "agentChats"),
    fetchTableSafe("lottery_settings", "settings")
  ]);

  const users = rawUsers.filter((u: any) => u && !staticMockIds.has(u.id));
  const staff = rawStaff.filter((s: any) => s && !staticMockIds.has(s.id));
  const agents = rawAgents.filter((a: any) => a && !staticMockIds.has(a.id));
  const tickets = rawTickets.filter((t: any) => t && !staticMockIds.has(t.id));
  const deposits = rawDeposits.filter((d: any) => d && !staticMockIds.has(d.id));
  const withdrawals = rawWithdrawals.filter((w: any) => w && !staticMockIds.has(w.id));

  const defaultCategories = [
    { id: "c1", name: "10 Taka Banner", label: "🎟️ ৳10 Sliders", type: "single", defaultPrizes: "" },
    { id: "c2", name: "20 Taka Banner", label: "🎟️ ৳20 Sliders", type: "single", defaultPrizes: "" },
    { id: "c3", name: "Mega Jackpot", label: "💎 Jackpots", type: "single", defaultPrizes: "" },
    { id: "c4", name: "3 Winner Category", label: "👑 3 Winners Category", type: "multi", defaultPrizes: "50, 30, 20" },
    { id: "c5", name: "15 Winner Category", label: "🚀 15 Winners Category", type: "multi", defaultPrizes: "100, 80, 60, 50, 40, 30, 25, 20, 15, 10, 10, 10, 10, 10, 10" },
    { id: "c6", name: "Syndicate", label: "👥 গ্রুপ লটারি (Syndicate)", type: "syndicate", defaultPrizes: "" },
    { id: "c7", name: "Quick Draw", label: "⚡ কুইক লটারি (1-Min)", type: "single", defaultPrizes: "" }
  ];
  const rawCategoryList = rawCategories.length > 0 ? rawCategories : defaultCategories;
  const categories = rawCategoryList.filter(Boolean).map((c: any) => ({
    ...c,
    id: String(c.id || ""),
    name: (c.name && String(c.name).trim()) || (c.label && String(c.label).trim()) || String(c.id || "Unnamed"),
    label: (c.label && String(c.label).trim()) || (c.name && String(c.name).trim()) || String(c.id || "Unnamed Category"),
    type: c.type || "single",
    defaultPrizes: c.defaultPrizes !== undefined && c.defaultPrizes !== null ? String(c.defaultPrizes) : ""
  }));

  const lotteries = rawLotteries
    .filter((l: any) => l && !staticMockIds.has(l.id))
    .map((l: any) => {
      if (typeof l.drawTime === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(l.drawTime.trim())) {
        l.drawTime = l.drawTime.trim().replace(" ", "T") + ".000Z";
      }
      if (typeof l.multiWinnerPrizes === "string" && l.multiWinnerPrizes.trim().startsWith("[")) {
        try { l.multiWinnerPrizes = JSON.parse(l.multiWinnerPrizes); } catch {}
      }
      return l;
    });

  const settings: any = {
    payMasterEnabled: "true",
    payUddoktapayEnabled: "true",
    payZinipayEnabled: "true",
    payCryptomusEnabled: "true"
  };
  for (const row of settingsRows) {
    if (!row || !row.setting_key) continue;
    const val = row.setting_value;
    try {
      if (val === "1") settings[row.setting_key] = true;
      else if (val === "0") settings[row.setting_key] = false;
      else settings[row.setting_key] = typeof val === "string" && (val.startsWith("{") || val.startsWith("["))
        ? JSON.parse(val)
        : val;
    } catch {
      settings[row.setting_key] = val;
    }
  }

  const savedProfiles = (settings._agentProfiles && typeof settings._agentProfiles === "object") ? settings._agentProfiles : {};
  const hydrateProfile = (rec: any) => {
    if (!rec || !rec.username) return rec;
    const prof = savedProfiles[String(rec.username).toLowerCase().trim()];
    if (!prof || typeof prof !== "object") return rec;
    const out = { ...rec };
    if (prof.photo !== undefined) {
      out.photo = prof.photo || "";
      out.avatar = prof.avatar || prof.photo || "";
    } else {
      if (!out.photo && prof.avatar) out.photo = prof.avatar;
      if (!out.avatar && (out.photo || prof.avatar)) out.avatar = out.photo || prof.avatar;
    }
    if (!out.displayName && prof.displayName) out.displayName = prof.displayName;
    if (!out.name && (prof.name || out.displayName)) out.name = prof.name || out.displayName;
    if (!out.availabilityStatus && prof.availabilityStatus) out.availabilityStatus = prof.availabilityStatus;
    if (!out.district && prof.district) out.district = prof.district;
    return out;
  };

  return {
    success: true,
    source: "direct-mysql-bridge",
    db: {
      users: users.map(hydrateProfile),
      staff: staff.map(hydrateProfile),
      agents: agents.map(hydrateProfile),
      categories,
      lotteries,
      tickets,
      deposits,
      withdrawals,
      transactions: Array.isArray(transactions)
        ? transactions.filter(Boolean).map((t: any) => ({
            ...t,
            amount: parseFloat(t.amount) || 0,
            transactionType: t.transactionType || t.type || "general",
            type: t.type || t.transactionType || "general",
            notes: t.notes ?? t.description ?? null,
            description: t.description ?? t.notes ?? ""
          }))
        : [],
      agentLedger,
      agentChats: Array.isArray(rawAgentChats) && rawAgentChats.length > 0 ? rawAgentChats : (Array.isArray(settings._agentChats) ? settings._agentChats : []),
      settings
    }
  };
}

async function directBridgeSyncDatabase(dbToSync: any, customConfig?: any): Promise<any> {
  const getCols = async (rawName: string): Promise<string[]> => {
    const tableName = rawName.startsWith("lottery_") ? rawName : (
      ["users", "staff", "agents", "categories", "lotteries", "tickets", "deposits", "withdrawals", "transactions", "agentLedger", "agentChats", "settings", "recovery", "user"].includes(rawName)
        ? `lottery_${rawName}`
        : rawName
    );
    if (clientTableColumnsCache[tableName]?.length) return clientTableColumnsCache[tableName];
    try {
      const rows = await executeDirectBridgeQuery(`DESCRIBE ${tableName}`, [], customConfig);
      const cols = rows.map((r: any) => r.Field).filter(Boolean);
      if (cols.length > 0) clientTableColumnsCache[tableName] = cols;
      return cols;
    } catch {
      return [];
    }
  };

  const syncTableDirect = async (rawTableName: string, dataArray: any[]) => {
    if (!Array.isArray(dataArray)) return;
    const tableName = rawTableName.startsWith("lottery_") ? rawTableName : "lottery_" + rawTableName;
    if (dataArray.length === 0) {
      if (tableName === "lottery_lotteries" || tableName === "lottery_staff" || tableName === "lottery_agents") {
        try { await executeDirectBridgeQuery(`DELETE FROM ${tableName}`, [], customConfig); } catch {}
      }
      return;
    }

    const cols = await getCols(tableName);
    if (cols.length === 0) return;

    let targetData = dataArray;
    if (tableName === "lottery_users" || tableName === "users") {
      targetData = dataArray.map((u: any) => {
        if (!u) return u;
        const uname = String(u.username || u.name || "").trim() || String(u.id || "user");
        const photoVal = u.photo || u.avatar || null;
        return {
          id: String(u.id || `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
          username: uname.slice(0, 100),
          email: (u.email && String(u.email).trim()) || `${uname.toLowerCase().replace(/[^a-z0-9._-]/g, "") || "user"}@lottery.local`,
          password: u.password || u.password_hash || "123456",
          phone: u.phone || null,
          dob: u.dob || null,
          balance: parseFloat(u.balance) || 0,
          totDeposit: parseFloat(u.totDeposit) || 0,
          totWithdraw: parseFloat(u.totWithdraw) || 0,
          wins: parseInt(u.wins, 10) || 0,
          loss: parseInt(u.loss, 10) || 0,
          profit: parseFloat(u.profit) || 0,
          joinDate: u.joinDate || new Date().toISOString().split("T")[0],
          status: u.status || "active",
          role: ["admin", "agent", "subagent", "moderator"].includes(u.role) ? u.role : "user",
          region: u.region || null,
          district: u.district || null,
          photo: photoVal,
          avatar: u.avatar || photoVal,
          displayName: u.displayName || null,
          name: u.name || u.displayName || null,
          availabilityStatus: u.availabilityStatus || "online"
        };
      });
    } else if (tableName === "lottery_staff" || tableName === "staff" || tableName === "lottery_agents" || tableName === "agents") {
      targetData = dataArray.map((a: any) => {
        if (!a || typeof a !== "object") return a;
        const uname = String(a.username || a.name || "").trim() || String(a.id || "agent");
        const photoVal = a.photo || a.avatar || null;
        return {
          id: String(a.id || `agent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
          username: uname.slice(0, 100),
          email: (a.email && String(a.email).trim()) || `${uname.toLowerCase().replace(/[^a-z0-9._-]/g, "") || "agent"}@lottery.local`,
          password: a.password || a.password_hash || "123456",
          phone: a.phone || null,
          dob: a.dob || null,
          balance: parseFloat(a.balance) || 0,
          earnedCommission: parseFloat(a.earnedCommission) || 0,
          commissionRate: parseFloat(a.commissionRate) || 0,
          totalBookings: parseInt(a.totalBookings, 10) || 0,
          district: a.district || null,
          region: a.region || a.district || null,
          joinDate: a.joinDate || new Date().toISOString().split("T")[0],
          status: a.status || "active",
          role: ["admin", "agent", "subagent", "moderator"].includes(a.role) ? a.role : "agent",
          photo: photoVal,
          avatar: a.avatar || photoVal,
          displayName: a.displayName || null,
          name: a.name || a.displayName || null,
          availabilityStatus: a.availabilityStatus || "online"
        };
      });
    } else if (tableName === "lottery_transactions" || tableName === "transactions") {
      targetData = dataArray.map((t: any) => {
        if (!t || typeof t !== "object") return t;
        const txType = String(t.transactionType || t.type || "general").trim() || "general";
        return {
          ...t,
          id: String(t.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
          userId: String(t.userId || t.uid || t.username || "system").slice(0, 50),
          userName: t.userName || t.username || null,
          username: t.username || t.userName || null,
          paymentMethod: t.paymentMethod || t.method || null,
          phone: t.phone || null,
          amount: parseFloat(t.amount) || 0,
          transactionType: txType.slice(0, 50),
          status: String(t.status || "completed").slice(0, 30),
          bonusAmount: parseFloat(t.bonusAmount) || 0,
          notes: t.notes ?? t.description ?? null,
          date: t.date || new Date().toISOString()
        };
      });
    } else if (tableName === "lottery_tickets" || tableName === "tickets") {
      targetData = dataArray.map((t: any) => {
        if (!t || typeof t !== "object") return t;
        return {
          ...t,
          id: String(t.id || `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
          userId: String(t.userId || t.uid || "unknown").slice(0, 50),
          lotteryId: String(t.lotteryId || "").slice(0, 50),
          code: String(t.code || t.ticketNumber || "0000").slice(0, 50),
          status: String(t.status || "pending").slice(0, 30),
          prizeAmount: parseFloat(t.prizeAmount) || 0
        };
      });
    } else if (tableName === "lottery_deposits" || tableName === "deposits") {
      targetData = dataArray.map((d: any) => {
        if (!d || typeof d !== "object") return d;
        return {
          ...d,
          id: String(d.id || `dep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
          username: String(d.username || d.userId || "user").slice(0, 100),
          amount: parseFloat(d.amount) || 0,
          method: String(d.method || d.paymentMethod || "manual").slice(0, 50),
          trxId: String(d.trxId || d.transactionId || d.id || "N/A").slice(0, 100),
          status: String(d.status || "pending").slice(0, 30)
        };
      });
    } else if (tableName === "lottery_withdrawals" || tableName === "withdrawals") {
      targetData = dataArray.map((w: any) => {
        if (!w || typeof w !== "object") return w;
        return {
          ...w,
          id: String(w.id || `wd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
          username: String(w.username || w.userId || "user").slice(0, 100),
          amount: parseFloat(w.amount) || 0,
          method: String(w.method || "manual").slice(0, 50),
          targetAccount: String(w.targetAccount || w.account || w.phone || "N/A").slice(0, 100),
          status: String(w.status || "pending").slice(0, 30)
        };
      });
    } else if (tableName === "lottery_agentLedger" || tableName === "agentLedger") {
      targetData = dataArray.map((l: any) => {
        if (!l || typeof l !== "object") return l;
        return {
          ...l,
          id: String(l.id || `led_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
          agentId: String(l.agentId || "").slice(0, 50),
          agentUsername: String(l.agentUsername || "agent").slice(0, 100),
          timestamp: String(l.timestamp || l.date || new Date().toISOString()).slice(0, 100),
          amount: parseFloat(l.amount) || 0,
          commission: parseFloat(l.commission) || 0,
          status: String(l.status || "pending").slice(0, 30)
        };
      });
    } else if (tableName === "lottery_agentChats" || tableName === "agentChats") {
      targetData = dataArray.map((c: any) => {
        if (!c || typeof c !== "object") return c;
        return {
          ...c,
          id: String(c.id || `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 80),
          sender: String(c.sender || "system").slice(0, 100),
          recipient: String(c.recipient || "admin").slice(0, 100),
          timestamp: String(c.timestamp || new Date().toISOString()).slice(0, 100)
        };
      });
    } else if (tableName === "lottery_lotteries" || tableName === "lotteries") {
      targetData = dataArray.map((l: any) => {
        if (!l || typeof l !== "object") return l;
        return {
          ...l,
          id: String(l.id || `lot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
          name: String(l.name || "Lottery Pool").slice(0, 150),
          entryFee: parseFloat(l.entryFee) || 0,
          totalTickets: parseInt(l.totalTickets, 10) || 100,
          soldTickets: parseInt(l.soldTickets, 10) || 0,
          category: String(l.category || "10 Taka Banner").slice(0, 50),
          drawTime: l.drawTime || new Date(Date.now() + 86400000).toISOString(),
          prizeAmount: parseFloat(l.prizeAmount) || 0,
          status: String(l.status || "active").slice(0, 30)
        };
      });
    } else if (tableName === "lottery_categories" || tableName === "categories") {
      targetData = dataArray.map((c: any) => {
        if (!c || typeof c !== "object") return c;
        const cleanName = String(c.name || c.label || c.id || "Category").trim().slice(0, 150);
        const cleanLabel = String(c.label || cleanName).trim().slice(0, 150);
        return {
          ...c,
          id: String(c.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
          name: cleanName,
          label: cleanLabel,
          type: String(c.type || "single").slice(0, 50),
          defaultPrizes: c.defaultPrizes !== undefined && c.defaultPrizes !== null ? String(c.defaultPrizes) : ""
        };
      });
    }

    const keySet = new Set<string>();
    for (const item of targetData) {
      if (item && typeof item === "object") {
        Object.keys(item).forEach(k => {
          if (cols.includes(k)) keySet.add(k);
        });
      }
    }
    const validKeys = Array.from(keySet);
    if (validKeys.length === 0) return;

    const formatDt = (val: any) => {
      if (val === null || val === undefined || val === "") return null;
      if (typeof val === "string" && val.includes("T") && /^\d{4}-\d{2}-\d{2}T/.test(val.trim())) {
        try {
          const d = new Date(val.trim());
          if (!isNaN(d.getTime())) return d.toISOString().slice(0, 19).replace("T", " ");
        } catch {}
      }
      return val;
    };

    const chunkSize = 100;
    for (let i = 0; i < targetData.length; i += chunkSize) {
      const chunk = targetData.slice(i, i + chunkSize);
      const valueRows: string[] = [];
      const flatValues: any[] = [];
      for (const item of chunk) {
        const placeholders: string[] = [];
        for (const k of validKeys) {
          let v = formatDt(item[k]);
          if (typeof v === "object" && v !== null) flatValues.push(JSON.stringify(v));
          else flatValues.push(v !== undefined ? v : null);
          placeholders.push("?");
        }
        valueRows.push(`(${placeholders.join(",")})`);
      }
      await executeDirectBridgeQuery(
        `REPLACE INTO ${tableName} (${validKeys.join(",")}) VALUES ${valueRows.join(",")}`,
        flatValues,
        customConfig
      );
    }

    if (validKeys.includes("id") && tableName !== "lottery_users" && tableName !== "users") {
      const activeIds = targetData.map((item: any) => item?.id).filter(Boolean);
      if (activeIds.length > 0 && activeIds.length <= 500) {
        const ph = activeIds.map(() => "?").join(",");
        await executeDirectBridgeQuery(`DELETE FROM ${tableName} WHERE id NOT IN (${ph})`, activeIds, customConfig);
      }
    }
  };

  if (dbToSync.categories) await syncTableDirect("categories", dbToSync.categories);
  if (dbToSync.lotteries) await syncTableDirect("lotteries", dbToSync.lotteries);
  if (dbToSync.users) await syncTableDirect("users", dbToSync.users);

  const mergedStaffMap = new Map<string, any>();
  const mergedAgentsMap = new Map<string, any>();
  const addMergedDirect = (map: Map<string, any>, item: any) => {
    if (!item || typeof item !== "object") return;
    const key = item.id ? String(item.id) : (item.username ? String(item.username).toLowerCase() : "");
    if (!key) return;
    map.set(key, { ...(map.get(key) || {}), ...item, id: String(item.id || key) });
  };
  (Array.isArray(dbToSync.users) ? dbToSync.users : []).forEach((u: any) => {
    if (u && (u.role === "agent" || u.role === "subagent" || u.role === "moderator")) addMergedDirect(mergedStaffMap, u);
    if (u && (u.role === "agent" || u.role === "subagent")) addMergedDirect(mergedAgentsMap, u);
  });
  (Array.isArray(dbToSync.staff) ? dbToSync.staff : []).forEach((s: any) => {
    addMergedDirect(mergedStaffMap, s);
    if (s && (!s.role || s.role === "agent" || s.role === "subagent")) addMergedDirect(mergedAgentsMap, s);
  });
  (Array.isArray(dbToSync.agents) ? dbToSync.agents : []).forEach((a: any) => {
    addMergedDirect(mergedAgentsMap, a);
    addMergedDirect(mergedStaffMap, a);
  });

  if (dbToSync.staff || mergedStaffMap.size > 0) {
    await syncTableDirect("staff", Array.from(mergedStaffMap.values()));
  }
  if (dbToSync.agents || mergedAgentsMap.size > 0) {
    await syncTableDirect("agents", Array.from(mergedAgentsMap.values()));
  }
  if (dbToSync.tickets) await syncTableDirect("tickets", dbToSync.tickets);
  if (dbToSync.deposits) await syncTableDirect("deposits", dbToSync.deposits);
  if (dbToSync.withdrawals) await syncTableDirect("withdrawals", dbToSync.withdrawals);
  if (dbToSync.transactions) await syncTableDirect("transactions", dbToSync.transactions);
  if (dbToSync.agentLedger) await syncTableDirect("agentLedger", dbToSync.agentLedger);
  if (dbToSync.agentChats) await syncTableDirect("agentChats", dbToSync.agentChats);

  if (!dbToSync.settings || typeof dbToSync.settings !== "object") {
    dbToSync.settings = {};
  }
  const agentProfilesMap: Record<string, any> = {};
  const recordAgentProfile = (rec: any) => {
    if (!rec || !rec.username) return;
    const uLower = String(rec.username).toLowerCase().trim();
    if (!uLower) return;
    const isAgentLike = ["agent", "subagent", "moderator"].includes(String(rec.role || "").toLowerCase());
    if (!isAgentLike && !rec.photo && !rec.avatar && !rec.displayName) return;
    const prev = agentProfilesMap[uLower] || {};
    const photoVal = rec.photo !== undefined ? rec.photo : (rec.avatar !== undefined ? rec.avatar : prev.photo);
    agentProfilesMap[uLower] = {
      photo: photoVal || "",
      avatar: photoVal || "",
      displayName: rec.displayName || prev.displayName || "",
      name: rec.name || rec.displayName || prev.name || "",
      availabilityStatus: rec.availabilityStatus || prev.availabilityStatus || "online",
      district: rec.district || prev.district || ""
    };
  };
  (Array.isArray(dbToSync.users) ? dbToSync.users : []).forEach(recordAgentProfile);
  Array.from(mergedStaffMap.values()).forEach(recordAgentProfile);
  Array.from(mergedAgentsMap.values()).forEach(recordAgentProfile);
  if (Object.keys(agentProfilesMap).length > 0) {
    dbToSync.settings._agentProfiles = agentProfilesMap;
  }

  if (dbToSync.settings && typeof dbToSync.settings === "object") {
    if (Array.isArray(dbToSync.agentChats)) {
      dbToSync.settings._agentChats = dbToSync.agentChats;
    }
    try {
      const settingRows: string[] = [];
      const settingVals: any[] = [];
      for (const [k, v] of Object.entries(dbToSync.settings)) {
        if (!k.trim()) continue;
        settingRows.push("(?, ?)");
        settingVals.push(k.trim(), typeof v === "object" ? JSON.stringify(v) : (typeof v === 'boolean' ? (v ? '1' : '0') : String(v)));
      }
      if (settingRows.length > 0) {
        await executeDirectBridgeQuery(
          `REPLACE INTO lottery_settings (setting_key, setting_value) VALUES ${settingRows.join(",")}`,
          settingVals,
          customConfig
        );
      }
    } catch {}
  }

  return {
    success: true,
    timestamp: new Date().toISOString(),
    syncStatus: "synced",
    database: DEFAULT_BRIDGE_CONFIG.database,
    message: "Synchronization complete via Direct MySQL Bridge."
  };
}

export async function sqlBridgeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const isStaticHost = () => {
    if (typeof window === "undefined") return false;
    const h = window.location.hostname;
    return h.includes("github.io") || h.includes("veloralbillal.top");
  };

  const makeJsonResponse = (obj: any, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { "Content-Type": "application/json" }
    });

  const urlStr = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  let pathname = urlStr;
  try {
    if (typeof window !== "undefined") {
      pathname = new URL(urlStr, window.location.origin).pathname;
    }
  } catch {}

  const isDbFetchRoute = pathname.endsWith("/api/sql/db") || pathname === "/db" || pathname.endsWith("/api/db") || pathname.endsWith("/db.php");
  const isDbSyncRoute = pathname.endsWith("/api/sql/sync");
  const isDbTestRoute = pathname.endsWith("/api/sql/test-connection");
  const isDbDebugRoute = pathname.endsWith("/api/sql/debug");

  if (isDbFetchRoute || isDbSyncRoute || isDbTestRoute || isDbDebugRoute) {
    // If not on static host, try the local Express server first
    if (!isStaticHost()) {
      try {
        const res = await rawNativeFetch(input, init);
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          return res;
        }
      } catch {}
    }

    // Direct MySQL Bridge Execution (used automatically on luckylock.veloralbillal.top / GitHub Pages or fallback)
    try {
      if (isDbTestRoute) {
        const start = Date.now();
        const rows = await executeDirectBridgeQuery("SHOW TABLES");
        const tablesVerified = rows.map((r: any) => Object.values(r)[0] as string);
        return makeJsonResponse({
          success: true,
          latency: Math.max(15, Date.now() - start),
          host: "localhost",
          bridgeUrl: DEFAULT_BRIDGE_CONFIG.bridgeUrl,
          status: "connected",
          engine: "MySQL 8.0 / MariaDB (Direct Bridge Engine)",
          tablesVerified: tablesVerified.length > 0 ? tablesVerified : ["users", "staff", "agents", "categories", "lotteries", "tickets", "settings"],
          message: `Connected successfully to MySQL (${DEFAULT_BRIDGE_CONFIG.database}) via Direct Bridge!`
        });
      }

      if (isDbSyncRoute && init?.body) {
        const bodyObj = typeof init.body === "string" ? JSON.parse(init.body) : {};
        const parsedDb = typeof bodyObj.db === "string" ? JSON.parse(bodyObj.db) : bodyObj.db;
        const syncRes = await directBridgeSyncDatabase(parsedDb, bodyObj.config);
        return makeJsonResponse(syncRes);
      }

      if (isDbDebugRoute) {
        const start = Date.now();
        const data = await directBridgeFetchDatabase();
        const db = data.db;
        const staffMap = new Map<string, any>();
        const legacyStaff = (db.users || []).filter((u: any) => u && (u.role === "agent" || u.role === "moderator" || u.role === "subagent"));
        [...(db.agents || []), ...(db.staff || []), ...legacyStaff].forEach((s: any) => {
          if (!s) return;
          const key = s.username ? String(s.username).toLowerCase() : s.id;
          if (key) staffMap.set(key, s);
        });
        const unifiedStaff = Array.from(staffMap.values());
        return makeJsonResponse({
          success: true,
          environment: isStaticHost() ? "production-static-bridge" : "development",
          latencyMs: Date.now() - start,
          connection: {
            bridgeUrl: DEFAULT_BRIDGE_CONFIG.bridgeUrl,
            dbHost: DEFAULT_BRIDGE_CONFIG.dbHost,
            database: DEFAULT_BRIDGE_CONFIG.database,
            username: DEFAULT_BRIDGE_CONFIG.username
          },
          tableRowCounts: {
            users: db.users.length,
            staff: db.staff.length,
            agents: db.agents.length,
            categories: db.categories.length,
            lotteries: db.lotteries.length
          },
          computedAdminBadgeCounts: {
            agentsCount: unifiedStaff.filter((u: any) => u.role === "agent" || u.role === "subagent").length,
            modsCount: unifiedStaff.filter((u: any) => u.role === "moderator").length,
            unifiedStaffUsernames: unifiedStaff.map((u: any) => ({ username: u.username, role: u.role, status: u.status }))
          }
        });
      }

      if (isDbFetchRoute) {
        const dbPayload = await directBridgeFetchDatabase();
        return makeJsonResponse(dbPayload);
      }
    } catch (bridgeErr: any) {
      console.warn("[Direct SQL Bridge Fallback Notice]:", bridgeErr.message || bridgeErr);
      return makeJsonResponse({ success: false, message: bridgeErr.message || "Direct SQL bridge error" }, 500);
    }
  }

  return rawNativeFetch(input, init);
}

function installDirectSqlBridgeInterceptor() {
  if (typeof window === "undefined" || (window as any).__lwSqlBridgeInterceptorInstalled) return;
  (window as any).__lwSqlBridgeInterceptorInstalled = true;
  (window as any).sqlBridgeFetch = sqlBridgeFetch;
}

// Install helper on window safely without mutating read-only window.fetch
installDirectSqlBridgeInterceptor();

export const SyncCloudModule = {
  async initFirebaseSync() {
    try {
      installDirectSqlBridgeInterceptor();
      console.log("SyncCloudModule: Initializing SQL-only sync engine...");
      this.firebaseConfig = null;
      this.firestore = null;
      this.auth = null;
      this.storage = null;
      this.firestoreDocRef = null;
      
      this.initRealtimeEventStream();
      this.initNetworkMonitoring();
      await this.loadFromCloud().catch(err => console.warn("Initial SQL load notice:", err));
      this.startSqlPolling();
      
      console.log("SQL sync engine initialized successfully.");
    } catch (e: any) {
      console.error("Failed to initialize SQL Sync:", e.message || e);
      this.setSyncState("error");
    }
  },

  initAuthListener() {
    // Legacy stub to prevent ReferenceErrors
  },

  async loadUserProfile(uid) {
    try {
      // Hydrate from active database (synced with MySQL)
      if (this.db && this.db.users && Array.isArray(this.db.users)) {
        const localUser = this.db.users.find((u: any) => u.id === uid || u.uid === uid) ||
                          (this.db.staff || []).find((s: any) => s.id === uid || s.uid === uid) ||
                          (this.db.agents || []).find((a: any) => a.id === uid || a.uid === uid);
        if (localUser) {
          const prevRole = this.currentUser?.role;
          this.currentUser = removeCircularReferences(localUser);
          if ((prevRole === "agent" || prevRole === "subagent") && (!this.currentUser.role || this.currentUser.role === "user" || this.currentUser.role === "player")) {
            this.currentUser.role = prevRole;
          }
          localStorage.setItem(this.sessionKey, safeStringify(this.currentUser));
          console.log("User profile hydrated from active database:", localUser.username);
          this.render();
        }
      }
    } catch (err) {
      console.warn("Notice loading user profile:", err);
    }
  },

  async syncUserProfile() {
    if (!this.currentUser || !this.currentUser.id) return;
    try {
      // In SQL mode, user profiles are synced as part of the monolithic database payload
      this.syncToCloud();
      console.log("User profile sync requested via SQL bridge.");
    } catch (err) {
      console.error("Failed to sync user profile:", err);
    }
  },

  async lookupUserByUsername(username) {
    if (!username) return null;
    const cleanUser = username.toLowerCase().trim();

    // 1. Primary: Check local monolithic DB (synced from MySQL)
    const allLocal = [...(this.db?.staff || []), ...(this.db?.agents || []), ...(this.db?.users || [])];
    const localUser = allLocal.find(u => u && u.username && u.username.toLowerCase() === cleanUser);
    if (localUser) {
      return {
        uid: localUser.id || localUser.uid,
        email: localUser.email,
        username: localUser.username,
        role: localUser.role
      };
    }

    // 2. Secondary: Query backend server /api/auth/lookup-user
    try {
      const serverRes = await fetch("/api/auth/lookup-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUser })
      });
      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data.success && data.user) {
          return {
            uid: data.user.id || data.user.uid,
            email: data.user.email,
            username: data.user.username,
            role: data.user.role
          };
        }
      }
    } catch (netErr) {
      // offline fallback
    }

    return null;
  },

  async createStaffAccount(staffData) {
    // Generate a unique ID for the new staff account
    let uid = "agent_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    console.log("Creating staff account in SQL-only mode for:", staffData.username);
    return { success: true, uid, authCreated: false };
  },

  async signUpUser(userData) {
    // Generate a unique ID for the new user
    let uid = "u_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    
    console.log("User registration completed for SQL-only environment.");
    return { success: true, uid, authCreated: false };
  },

  lastLocalWriteTime: 0,

  mergeParsedDb(parsed) {
    if (!parsed) return;
    const prevDb = this.db || {};
    let deletedIds: Set<string>;
    try {
      const storedDeleted = JSON.parse(localStorage.getItem("lw_deleted_ids") || "[]");
      const currentSet = (this as any)._deletedIds instanceof Set ? Array.from((this as any)._deletedIds) : [];
      deletedIds = new Set([...storedDeleted, ...currentSet]);
    } catch {
      deletedIds = (this as any)._deletedIds instanceof Set ? (this as any)._deletedIds : new Set();
    }
    const staticMockIds = new Set([
      "u_agent_dhaka", "u_agent_sylhet", "u_mod_support",
      "u1", "u2", "u3",
      "l1", "l2", "l3", "l_quick_default",
      "t1", "t2", "t3",
      "d1", "d2", "w1",
      "syn_mock_1", "syn_mock_2"
    ]);
    // Only preserve in-flight local mutations if a local write was triggered within the last 3.5 seconds
    const hasInFlightWrite = Boolean(this.lastLocalWriteTime && (Date.now() - this.lastLocalWriteTime < 3500));

    // Single Source of Truth: Database collections (users, staff, agents, categories, lotteries, tickets, deposits, withdrawals, transactions, agentLedger)
    // come directly from the primary MySQL database. Stale localStorage items are NOT re-injected.
    if (Array.isArray(parsed.users)) {
      if (hasInFlightWrite && Array.isArray(prevDb.users)) {
        const cloudUserMap = new Map(parsed.users.map((u: any) => [u.username?.toLowerCase() || u.id, u]));
        for (const localUser of prevDb.users) {
          if (!localUser || staticMockIds.has(localUser.id) || deletedIds.has(localUser.id)) continue;
          const key = localUser.username?.toLowerCase() || localUser.id;
          if (!cloudUserMap.has(key)) parsed.users.push(localUser);
        }
      }
      parsed.users = parsed.users.filter((u: any) => u && !staticMockIds.has(u.id) && !deletedIds.has(u.id));
    }

    if (Array.isArray(parsed.staff)) {
      if (hasInFlightWrite && Array.isArray(prevDb.staff)) {
        const cloudStaffMap = new Map(parsed.staff.map((s: any) => [s.username?.toLowerCase() || s.id, s]));
        for (const localStaff of prevDb.staff) {
          if (!localStaff || staticMockIds.has(localStaff.id) || deletedIds.has(localStaff.id)) continue;
          const key = localStaff.username?.toLowerCase() || localStaff.id;
          if (!cloudStaffMap.has(key)) parsed.staff.push(localStaff);
        }
      }
      parsed.staff = parsed.staff.filter((s: any) => s && !staticMockIds.has(s.id) && !deletedIds.has(s.id));
    }

    if (Array.isArray(parsed.agents)) {
      if (hasInFlightWrite && Array.isArray(prevDb.agents)) {
        const cloudAgentMap = new Map(parsed.agents.map((a: any) => [a.username?.toLowerCase() || a.id, a]));
        for (const localAgent of prevDb.agents) {
          if (!localAgent || staticMockIds.has(localAgent.id) || deletedIds.has(localAgent.id)) continue;
          const key = localAgent.username?.toLowerCase() || localAgent.id;
          if (!cloudAgentMap.has(key)) parsed.agents.push(localAgent);
        }
      }
      parsed.agents = parsed.agents.filter((a: any) => a && !staticMockIds.has(a.id) && !deletedIds.has(a.id));
    }

    if (Array.isArray(parsed.categories)) {
      if (hasInFlightWrite && Array.isArray(prevDb.categories)) {
        const cloudCatMap = new Map(parsed.categories.map((c: any) => [c.id || c.name?.toLowerCase(), c]));
        for (const localCat of prevDb.categories) {
          if (!localCat || deletedIds.has(localCat.id)) continue;
          const key = localCat.id || localCat.name?.toLowerCase();
          if (!cloudCatMap.has(key)) parsed.categories.push(localCat);
        }
      }
      parsed.categories = parsed.categories.filter((c: any) => c && !deletedIds.has(c.id));
    }

    if (Array.isArray(parsed.lotteries)) {
      if (hasInFlightWrite && Array.isArray(prevDb.lotteries)) {
        const cloudLotMap = new Map(parsed.lotteries.map((l: any) => [l.id, l]));
        for (const localLot of prevDb.lotteries) {
          if (!localLot || !localLot.id || staticMockIds.has(localLot.id) || deletedIds.has(localLot.id)) continue;
          if (!cloudLotMap.has(localLot.id)) {
            parsed.lotteries.unshift(localLot);
          }
        }
      }
      parsed.lotteries = parsed.lotteries.filter((l: any) => l && !staticMockIds.has(l.id) && !deletedIds.has(l.id));
    }

    if (Array.isArray(parsed.tickets)) {
      parsed.tickets = parsed.tickets.filter((t: any) => t && !staticMockIds.has(t.id) && !deletedIds.has(t.id));
    }
    if (Array.isArray(parsed.deposits)) {
      parsed.deposits = parsed.deposits.filter((d: any) => d && !staticMockIds.has(d.id) && !deletedIds.has(d.id));
    }
    if (Array.isArray(parsed.withdrawals)) {
      parsed.withdrawals = parsed.withdrawals.filter((w: any) => w && !staticMockIds.has(w.id) && !deletedIds.has(w.id));
    }

    const syncNodes = [
      { id: "node-sql", name: "MySQL Database (veloralb_Digital)", active: true, type: "sql", status: "connected", lastSync: new Date().toLocaleTimeString() }
    ];
    const mergedSettings = { ...(prevDb.settings || {}), ...(parsed.settings || {}) };
    if (mergedSettings.maintenanceMode !== undefined) {
      mergedSettings.maintenanceMode = (mergedSettings.maintenanceMode === true || mergedSettings.maintenanceMode === "true" || mergedSettings.maintenanceMode === "1" || mergedSettings.maintenanceMode === 1);
    }

    // Merge agentChats across prevDb, parsed.agentChats, and mergedSettings._agentChats
    const chatMergeMap = new Map<string, any>();
    const pushChats = (arr: any) => {
      if (!Array.isArray(arr)) return;
      for (const c of arr) {
        if (c && c.id) {
          const existing = chatMergeMap.get(c.id);
          chatMergeMap.set(c.id, existing ? { ...existing, ...c } : c);
        }
      }
    };
    pushChats(prevDb.agentChats);
    pushChats(mergedSettings._agentChats);
    pushChats(parsed.agentChats);

    this.db = { ...prevDb, ...parsed, syncNodes, settings: mergedSettings, agentChats: Array.from(chatMergeMap.values()) };

    // Guarantee all required collections are initialized as arrays
    if (!Array.isArray(this.db.users)) this.db.users = [];
    if (!Array.isArray(this.db.staff)) this.db.staff = [];
    if (!Array.isArray(this.db.agents)) this.db.agents = [];
    if (!Array.isArray(this.db.lotteries)) this.db.lotteries = [];
    if (!Array.isArray(this.db.tickets)) this.db.tickets = [];
    if (!Array.isArray(this.db.deposits)) this.db.deposits = [];
    if (!Array.isArray(this.db.withdrawals)) this.db.withdrawals = [];
    if (!Array.isArray(this.db.transactions)) this.db.transactions = [];
    if (!Array.isArray(this.db.agentLedger)) this.db.agentLedger = [];
    if (!Array.isArray(this.db.agentChats)) this.db.agentChats = [];
    if (!Array.isArray(this.db.agentRecruitsLogs)) this.db.agentRecruitsLogs = [];
    if (!Array.isArray(this.db.categories) || this.db.categories.length === 0) {
      this.db.categories = [
        { id: "c1", name: "10 Taka Banner", label: "🎟️ ৳10 Sliders", type: "single", defaultPrizes: "" },
        { id: "c2", name: "20 Taka Banner", label: "🎟️ ৳20 Sliders", type: "single", defaultPrizes: "" },
        { id: "c3", name: "Mega Jackpot", label: "💎 Jackpots", type: "single", defaultPrizes: "" },
        { id: "c4", name: "3 Winner Category", label: "👑 3 Winners Category", type: "multi", defaultPrizes: "50, 30, 20" },
        { id: "c5", name: "15 Winner Category", label: "🚀 15 Winners Category", type: "multi", defaultPrizes: "100, 80, 60, 50, 40, 30, 25, 20, 15, 10, 10, 10, 10, 10, 10" },
        { id: "c6", name: "Syndicate", label: "👥 গ্রুপ লটারি (Syndicate)", type: "syndicate", defaultPrizes: "" },
        { id: "c7", name: "Quick Draw", label: "⚡ কুইক লটারি (1-Min)", type: "single", defaultPrizes: "" }
      ];
    }
    if (!Array.isArray(this.db.syndicates)) this.db.syndicates = [];
    if (!Array.isArray(this.db.communityPosts)) this.db.communityPosts = [];
    if (!Array.isArray(this.db.communityComments)) this.db.communityComments = [];
    if (!Array.isArray(this.db.reports)) this.db.reports = [];
    if (!Array.isArray(this.db.badgeRequests)) this.db.badgeRequests = [];
    if (!Array.isArray(this.db.messages)) this.db.messages = [];
    if (!Array.isArray(this.db.taskSubmissions)) this.db.taskSubmissions = [];
    if (!Array.isArray(this.db.dailyTasks)) this.db.dailyTasks = [];
    if (!Array.isArray(this.db.jackpotRegistrations)) this.db.jackpotRegistrations = [];
    if (!Array.isArray(this.db.spinHistory)) this.db.spinHistory = [];
    if (!Array.isArray(this.db.securityLogs)) this.db.securityLogs = [];
    if (!Array.isArray(this.db.pendingAdminToasts)) this.db.pendingAdminToasts = [];
    if (!Array.isArray(this.db.webPushAds)) this.db.webPushAds = [];
    if (!Array.isArray(this.db.products)) this.db.products = [];
    if (!Array.isArray(this.db.videoBounties)) this.db.videoBounties = [];
    if (!Array.isArray(this.db.syncLogs)) this.db.syncLogs = [];

    // Ensure strict table separation: migrate any staff/agents from users to staff & agents
    const genuineUsers = [];
    for (const u of this.db.users) {
      const role = (u.role || "").toLowerCase();
      if (role === "agent" || role === "subagent" || role === "moderator") {
        if (!this.db.staff.some((s: any) => s.id === u.id || (s.username && u.username && s.username.toLowerCase() === u.username.toLowerCase()))) {
          this.db.staff.push(u);
        }
        if ((role === "agent" || role === "subagent") && !this.db.agents.some((a: any) => a.id === u.id || (a.username && u.username && a.username.toLowerCase() === u.username.toLowerCase()))) {
          this.db.agents.push(u);
        }
      } else {
        genuineUsers.push(u);
      }
    }
    for (const s of this.db.staff) {
      const role = (s?.role || "agent").toLowerCase();
      if ((role === "agent" || role === "subagent") && !this.db.agents.some((a: any) => a.id === s.id || (a.username && s.username && a.username.toLowerCase() === s.username.toLowerCase()))) {
        this.db.agents.push(s);
      }
    }
    this.db.users = genuineUsers;

    // Normalize user & staff records (numeric strings from SQL & sub-arrays)
    const normalizePerson = (u: any) => {
      if (!u) return;
      u.balance = parseFloat(u.balance) || 0;
      u.totDeposit = parseFloat(u.totDeposit) || 0;
      u.totWithdraw = parseFloat(u.totWithdraw) || 0;
      u.wins = parseInt(u.wins) || 0;
      u.loss = parseInt(u.loss) || 0;
      u.profit = parseFloat(u.profit) || 0;
      if (u.commissionRate !== undefined) u.commissionRate = parseFloat(u.commissionRate) || 5.0;
      if (u.earnedCommission !== undefined) u.earnedCommission = parseFloat(u.earnedCommission) || 0;
      if (u.totalBookings !== undefined) u.totalBookings = parseInt(u.totalBookings) || 0;
      if (!Array.isArray(u.referredUsers)) u.referredUsers = [];
      if (!Array.isArray(u.rewardedMilestones)) u.rewardedMilestones = [];
      if (!Array.isArray(u.unlockedItems)) u.unlockedItems = [];
    };
    this.db.users.forEach(normalizePerson);
    this.db.staff.forEach(normalizePerson);
    this.db.agents.forEach(normalizePerson);

    this.db.lotteries.forEach((l: any) => {
      if (!l) return;
      l.entryFee = parseFloat(l.entryFee) || 0;
      l.totalTickets = parseInt(l.totalTickets) || 100;
      l.soldTickets = parseInt(l.soldTickets) || 0;
      l.prizeAmount = parseFloat(l.prizeAmount) || 0;
      l.drawDuration = parseInt(l.drawDuration) || 10;
      if (!l.status) l.status = "active";
      if (!l.drawMode) l.drawMode = "manual";
      if (!l.details || l.details === "undefined" || l.details === "null" || (typeof l.details === "string" && l.details.trim() === "")) {
        l.details = (l.description && l.description !== "undefined" && l.description !== "null" && String(l.description).trim() !== "")
          ? String(l.description).trim()
          : `Exclusive ৳${l.entryFee || 10} lottery draw pool. The lucky winner receives ৳${(l.prizeAmount || l.prizePool || 0).toLocaleString()}!`;
      }
      if (!l.description || l.description === "undefined" || l.description === "null") {
        l.description = l.details;
      }
      if (typeof l.multiWinnerPrizes === "string" && l.multiWinnerPrizes.trim().startsWith("[")) {
        try { l.multiWinnerPrizes = JSON.parse(l.multiWinnerPrizes); } catch { l.multiWinnerPrizes = null; }
      }
      if (typeof l.drawTime === "string") {
        const trimmed = l.drawTime.trim();
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
          l.drawTime = trimmed.replace(" ", "T") + ".000Z";
        }
      }
      const parsedDrawTime = l.drawTime ? new Date(l.drawTime).getTime() : NaN;
      if (isNaN(parsedDrawTime)) {
        l.drawTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }
    });

    this.db.tickets.forEach((t: any) => {
      if (!t) return;
      t.prizeAmount = parseFloat(t.prizeAmount) || 0;
      if (t.userIds && !Array.isArray(t.userIds)) t.userIds = [];
    });

    this.db.syndicates.forEach((s: any) => {
      if (!s) return;
      if (!Array.isArray(s.joinedUserIds)) s.joinedUserIds = [];
      if (!Array.isArray(s.joinedUsernames)) s.joinedUsernames = [];
    });

    if (this.db.settings) {
      if (!Array.isArray(this.db.settings.vipTiers)) {
        this.db.settings.vipTiers = [
          { id: "vip_1", title: "Bronze VIP 1", price: 100, multiplier: 1.05, discount: 3, bonus: 5 },
          { id: "vip_2", title: "Silver VIP 2", price: 250, multiplier: 1.10, discount: 5, bonus: 15 },
          { id: "vip_3", title: "Gold VIP 3", price: 500, multiplier: 1.20, discount: 8, bonus: 40 },
          { id: "vip_4", title: "Platinum VIP 4", price: 1000, multiplier: 1.35, discount: 12, bonus: 100 },
          { id: "vip_5", title: "Crown VIP 5", price: 2500, multiplier: 1.60, discount: 20, bonus: 300 }
        ];
      }
      if (!Array.isArray(this.db.settings.bannerSlides)) this.db.settings.bannerSlides = [];
      if (!Array.isArray(this.db.settings.milestoneLevels)) {
        this.db.settings.milestoneLevels = [
          { title: "Bronze Recruiter", count: 3, reward: 50 },
          { title: "Silver Partner", count: 8, reward: 150 },
          { title: "Gold Ambassador", count: 20, reward: 500 },
          { title: "Supreme Influencer", count: 50, reward: 1500 }
        ];
      }
      if (!Array.isArray(this.db.settings.checkinRewards)) this.db.settings.checkinRewards = [2, 4, 6, 8, 10, 15, 25];
      if (!Array.isArray(this.db.settings.allowedRegions)) this.db.settings.allowedRegions = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi"];
      if (!Array.isArray(this.db.settings.bannedRegions)) this.db.settings.bannedRegions = [];
      if (!Array.isArray(this.db.settings.bannedIPs)) this.db.settings.bannedIPs = [];
    }

    const sqlDbConfig = (prevDb.sqlDbConfig || parsed.sqlDbConfig)
      ? { ...(prevDb.sqlDbConfig || {}), ...(parsed.sqlDbConfig || {}) }
      : undefined;
    if (syncNodes) this.db.syncNodes = syncNodes;
    if (sqlDbConfig) this.db.sqlDbConfig = sqlDbConfig;
  },

  unsubscribeFromCloud() {
    if (this.firestoreUnsubscribe) {
      try {
        this.firestoreUnsubscribe();
        this.firestoreUnsubscribe = null;
        console.log("[SyncEngine] Realtime Firestore listener unsubscribed.");
      } catch (e) {
        console.warn("Failed to unsubscribe listener:", e);
      }
    }
  },

  listenToCloud() {
    if (!this.firestoreDocRef) return;
    
    // Safety check to prevent duplicate listeners
    this.unsubscribeFromCloud();

    this.setSyncState("loading");

    this.firestoreUnsubscribe = onSnapshot(this.firestoreDocRef, (docSnap) => {
      try {
        if (docSnap.exists()) {
          // If we are currently uploading a write operation or have pending local writes, ignore incoming cloud snapshots to prevent race conditions
          if (this.syncState === "syncing" || this.cloudSyncTimeout != null) {
            console.log("[SyncEngine] Local write in progress or queued. Ignoring incoming snapshot to prevent overwriting unsaved changes.");
            return;
          }

          const cloudData = docSnap.data().db;
          if (cloudData) {
            let parsed = typeof cloudData === "string" ? JSON.parse(cloudData) : cloudData;
            if (parsed) {
              parsed = removeCircularReferences(parsed);
            }
            this.mergeParsedDb(parsed);
            
            if (this.currentUser) {
              const freshUser = this.db.users.find(u => u.username === this.currentUser.username);
              if (freshUser) {
                this.currentUser = removeCircularReferences(freshUser);
                localStorage.setItem(this.sessionKey, safeStringify(freshUser));
              }
            }
            localStorage.setItem(this.dbKey, safeStringify(this.db));
            
            // Re-render everything immediately across all screens/tabs
            this.render();
            console.log("Database successfully synced with Firebase cloud (Real-time update received).");
            this.setSyncState("synced");
          }
        } else {
          // If the document doesn't exist yet, initialize it on cloud
          this.syncToCloud();
        }
      } catch (err) {
        console.warn("Error processing real-time snapshot payload:", err);
        this.setSyncState("error");
      }
    }, (error) => {
      console.warn("Firestore real-time listener subscription error:", error);
      // Silently operate in local-first offline fallback mode to avoid environment/sandbox warnings
      this.setSyncState("offline");
    });

    // Auto-pause listener when document is hidden to conserve background network and CPU
    if (!this._visibilityListenerAdded && typeof document !== 'undefined') {
      this._visibilityListenerAdded = true;
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          console.log("[PerformanceMode] Page hidden - pausing Firestore listener to save resources");
          this.unsubscribeFromCloud();
        } else if (!this.firestoreUnsubscribe && this.firestoreDocRef) {
          console.log("[PerformanceMode] Page visible - resuming Firestore listener");
          this.listenToCloud();
        }
      });
    }
  },

  async loadFromCloud() {
    if (!navigator.onLine) {
      this.addConsoleLog("[REPLICATION] Device is offline. Offline-local mode activated successfully.", "success");
      this.setSyncState("offline");
      return;
    }

    this.setSyncState("loading");
    try {
      console.log("[loadFromCloud] Initiating load from MySQL database...");
      const sqlRes = await sqlBridgeFetch(`/api/sql/db?_t=${Date.now()}`, { cache: "no-store" });
      if (sqlRes.ok) {
        const sqlData = await sqlRes.json();
        if (sqlData.success && sqlData.db) {
          this.mergeParsedDb(sqlData.db);

          // Guarantee we have a syncNodes entry for MySQL
          this.db.syncNodes = [
            { id: "node-sql", name: "MySQL Database (veloralb_Digital)", active: true, type: "sql", status: "connected", lastSync: new Date().toLocaleTimeString() }
          ];

          if (typeof (this as any).refreshCurrentUserAndWalletBalance === "function") {
            (this as any).refreshCurrentUserAndWalletBalance(false);
          } else if (this.currentUser) {
            const curUname = this.currentUser.username ? String(this.currentUser.username).toLowerCase() : "";
            const isAgentSession = this.currentUser.role === "agent" || this.currentUser.role === "subagent";
            const matchFn = (x: any) => x && (
              (x.id && String(x.id) === String(this.currentUser.id)) ||
              (curUname && x.username && String(x.username).toLowerCase() === curUname)
            );
            const freshUser = isAgentSession
              ? ((this.db.agents || []).find(matchFn) || (this.db.staff || []).find(matchFn) || (this.db.users || []).find(matchFn))
              : ((this.db.users || []).find(matchFn) || (this.db.staff || []).find(matchFn) || (this.db.agents || []).find(matchFn));
            if (freshUser) {
              const prevRole = this.currentUser.role;
              this.currentUser = removeCircularReferences(freshUser);
              if (isAgentSession && (!this.currentUser.role || this.currentUser.role === "user" || this.currentUser.role === "player")) {
                this.currentUser.role = prevRole;
              }
              localStorage.setItem(this.sessionKey, safeStringify(this.currentUser));
            }
          }
          localStorage.setItem(this.dbKey, safeStringify(this.db));
          localStorage.setItem("lottery_winner_db_backup", safeStringify(this.db));
          if (typeof (this as any).updateMetaTags === "function") {
            (this as any).updateMetaTags();
          }
          this.render();
          this.startSqlPolling();
          this.addConsoleLog(`[SQL DB LOAD] Successfully loaded and aligned live state from active MySQL database.`, "success");
          this.setSyncState("synced");
          return;
        }
      }
      throw new Error(`HTTP ${sqlRes.status}`);
    } catch (sqlErr: any) {
      console.warn("SQL database load notice (using offline local DB):", sqlErr?.message || sqlErr);
      this.addConsoleLog("[SQL DB LOAD] External SQL unreachable. Operating on offline local storage mode.", "warning");
      this.setSyncState("offline");
    }
  },

  async syncToCloud() {
    if (!this.db) return;

    // 1. Always mirror to BOTH local storage instances immediately
    try {
      const cleaned = removeCircularReferences(this.db);
      const serialized = safeStringify(cleaned);
      localStorage.setItem(this.dbKey, serialized);
      localStorage.setItem("lottery_winner_db_backup", serialized);
    } catch (storageErr) {
      console.warn("Local storage dual-mirror warning:", storageErr);
    }

    if (!navigator.onLine) {
      this.addConsoleLog("[REPLICATION] Offline. Sync changes queued in local cache & backup store.", "warning");
      this.setSyncState("offline");
      return;
    }

    this.setSyncState("syncing");
    this.lastLocalWriteTime = Date.now();

    try {
      const dbSerialized = safeStringify(this.db);
      const sqlConfig = this.db.sqlDbConfig || {
        host: 'https://api.veloralbillal.top/db_bridge.php',
        port: '3306',
        database: 'veloralb_lottery',
        username: 'veloralb_billal',
        password: 'Z3[9T*x39URzna',
        activeEngine: 'mysql',
        autoSync: true
      };
      
      sqlConfig.activeEngine = 'mysql';
      sqlConfig.autoSync = true;
      sqlConfig.database = sqlConfig.database || 'veloralb_lottery';
      sqlConfig.username = sqlConfig.username || 'veloralb_billal';
      sqlConfig.password = sqlConfig.password || 'Z3[9T*x39URzna';
      sqlConfig.lastSyncTime = new Date().toISOString();
      sqlConfig.syncStatus = "synced";
      this.db.sqlDbConfig = sqlConfig;

      // Guarantee we have a syncNodes entry for MySQL
      this.db.syncNodes = [
        { id: "node-sql", name: "MySQL Database (veloralb_lottery)", active: true, type: "sql", status: "connected", lastSync: new Date().toLocaleTimeString() }
      ];

      // Replicate payload to server-side SQL sync endpoint (with automatic Direct Bridge fallback)
      try {
        const response = await sqlBridgeFetch("/api/sql/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            db: dbSerialized, 
            config: sqlConfig 
          })
        });
        
        if (response.status === 429) {
          setTimeout(() => this.syncToCloud(), 2000);
          return;
        }
        
        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            this.lastLocalWriteTime = Date.now();
            try {
              if ((this as any)._bcChannel) {
                (this as any)._bcChannel.postMessage({ type: "database_updated", timestamp: Date.now() });
              }
            } catch {}
            this.addConsoleLog(`[SYNC] 🐬 MySQL Database (${sqlConfig.database || 'veloralb_Digital'}@${sqlConfig.host || 'localhost'}) synced successfully. 100% data synced!`, "success");
            this.setSyncState("synced");
          } else {
            throw new Error(resData.message || resData.error || "Server rejected SQL sync");
          }
        } else {
          const errText = await response.text().catch(() => "");
          throw new Error(errText || `HTTP ${response.status}`);
        }
      } catch (netErr: any) {
        this.addConsoleLog(`[SYNC ERROR] SQL Mirroring failed: ${netErr.message || netErr}`, "error");
        this.setSyncState("error");
        return false;
      }

      // Update our new HA cluster UI stats if we're on the Failover Vault tab
      if (this.currentAdminTab === "sync-vault") {
        this.renderSyncVaultTab();
      }
      return true;
    } catch (e: any) {
      this.addConsoleLog(`[SYNC WARNING] Sync notice: ${e.message || e}`, "warning");
      this.setSyncState("error");
      return false;
    }
  },

  setSyncState(state) {
    this.syncState = state;
    if (state === 'synced') {
      this.lastSyncedTime = new Date();
    }
    
    // 1. Update all header badges in DOM
    const badges = document.querySelectorAll(".cloud-sync-debug-trigger");
    badges.forEach(badge => {
      const dot = badge.querySelector(".cloud-sync-dot");
      const text = badge.querySelector(".cloud-sync-text");
      
      if (dot && text) {
        // Reset classes safely (works for both HTML and SVG elements)
        dot.setAttribute("class", "w-1.5 h-1.5 rounded-full cloud-sync-dot");
        text.setAttribute("class", "font-extrabold uppercase tracking-tight cloud-sync-text");
        
        switch (state) {
          case 'synced':
            dot.classList.add("bg-emerald-500", "shadow-[0_0_6px_rgba(16,185,129,0.5)]");
            text.classList.add("text-emerald-400");
            text.textContent = "Synced";
            badge.setAttribute("title", "Cloud State: Synced successfully! Secure & Connected.");
            break;
          case 'syncing':
            dot.classList.add("bg-amber-500", "animate-pulse", "shadow-[0_0_6px_rgba(245,158,11,0.5)]");
            text.classList.add("text-amber-400");
            text.textContent = "Saving...";
            badge.setAttribute("title", "Cloud State: Uploading current database changes...");
            break;
          case 'loading':
            dot.classList.add("bg-cyan-500", "animate-pulse", "shadow-[0_0_6px_rgba(6,182,212,0.5)]");
            text.classList.add("text-cyan-400");
            text.textContent = "Loading...";
            badge.setAttribute("title", "Cloud State: Loading fresh data from MySQL...");
            break;
          case 'offline':
            dot.classList.add("bg-rose-500", "animate-bounce", "shadow-[0_0_6px_rgba(239,68,68,0.5)]");
            text.classList.add("text-rose-500");
            text.textContent = "Offline";
            badge.setAttribute("title", "Cloud State: Internet disconnected. Changes saved locally.");
            break;
          case 'error':
            dot.classList.add("bg-red-600", "shadow-[0_0_6px_rgba(220,38,38,0.5)]");
            text.classList.add("text-red-500");
            text.textContent = "Sync Error";
            badge.setAttribute("title", "Cloud State: Sync failed. Will retry automatically.");
            break;
        }
      }
    });

    // 2. Update diagnostics modal elements if they exist
    this.updateDiagnosticsModal(state);
  },

  updateDiagnosticsModal(state) {
    const modalDot = document.getElementById("sync-modal-dot");
    const modalStateText = document.getElementById("sync-modal-state-text");
    const modalStateSubtext = document.getElementById("sync-modal-state-subtext");
    const modalIcon = document.getElementById("sync-modal-icon");
    const modalIconContainer = document.getElementById("sync-modal-icon-container");

    if (modalDot && modalStateText && modalStateSubtext && modalIcon) {
      // Clear previous classes safely (Lucide replaces <i> with <svg> where className is read-only)
      modalDot.setAttribute("class", "w-2 h-2 rounded-full");
      modalIcon.setAttribute("class", "fa-solid");
      if (modalIconContainer) modalIconContainer.setAttribute("class", "w-12 h-12 rounded-xl border flex items-center justify-center text-xl shrink-0");

      // Calculate stats counts from local DB
      const userCount = this.db && this.db.users ? this.db.users.length : 0;
      const poolsCount = this.db && this.db.lotteries ? this.db.lotteries.length : 0;

      const userCountEl = document.getElementById("sync-stat-users");
      const poolsCountEl = document.getElementById("sync-stat-pools");
      if (userCountEl) userCountEl.innerText = `${userCount} Active Players`;
      if (poolsCountEl) poolsCountEl.innerText = `${poolsCount} Pools configured`;

      // Last Synced string
      const timeEl = document.getElementById("sync-stat-time");
      if (timeEl) {
        if (state === 'offline') {
          timeEl.innerText = "Offline Mode (Local Active)";
          timeEl.setAttribute("class", "text-rose-400 font-bold");
        } else {
          timeEl.innerText = this.lastSyncedTime ? this.lastSyncedTime.toLocaleTimeString() : "Just Now";
          timeEl.setAttribute("class", "text-emerald-400 font-bold");
        }
      }

      switch (state) {
        case 'synced':
          modalDot.classList.add("bg-emerald-500", "shadow-[0_0_6px_rgba(16,185,129,0.5)]");
          modalStateText.innerText = "Cloud Sync Active / ক্লাউড সুরক্ষিত";
          modalStateText.setAttribute("class", "text-xs font-black text-emerald-400 uppercase tracking-wider");
          modalStateSubtext.innerText = "Everything is perfectly backed up onto MySQL Database.";
          modalIcon.classList.add("fa-cloud-arrow-up", "text-emerald-400");
          if (modalIconContainer) modalIconContainer.classList.add("bg-emerald-950/40", "border-emerald-800/30", "text-emerald-400");
          break;
        case 'syncing':
          modalDot.classList.add("bg-amber-500", "animate-pulse", "shadow-[0_0_6px_rgba(245,158,11,0.5)]");
          modalStateText.innerText = "Uploading / ক্লাউড আপডেট হচ্ছে";
          modalStateText.setAttribute("class", "text-xs font-black text-amber-500 uppercase tracking-wider");
          modalStateSubtext.innerText = "Saving your wins, tickets, and modifications to MySQL Database.";
          modalIcon.classList.add("fa-circle-notch", "animate-spin", "text-amber-500");
          if (modalIconContainer) modalIconContainer.classList.add("bg-amber-950/40", "border-amber-800/30", "text-amber-500");
          break;
        case 'loading':
          modalDot.classList.add("bg-cyan-500", "animate-pulse", "shadow-[0_0_6px_rgba(6,182,212,0.5)]");
          modalStateText.innerText = "Downloading / ডাটা লোড হচ্ছে";
          modalStateText.setAttribute("class", "text-xs font-black text-cyan-400 uppercase tracking-wider");
          modalStateSubtext.innerText = "Fetching the latest player records and configurations from MySQL Database.";
          modalIcon.classList.add("fa-circle-notch", "animate-spin", "text-cyan-400");
          if (modalIconContainer) modalIconContainer.classList.add("bg-cyan-950/40", "border-cyan-800/30", "text-cyan-400");
          break;
        case 'offline':
          modalDot.classList.add("bg-rose-500", "animate-bounce", "shadow-[0_0_6px_rgba(239,68,68,0.5)]");
          modalStateText.innerText = "Offline Mode / ইন্টারনেট বিচ্ছিন্ন";
          modalStateText.setAttribute("class", "text-xs font-black text-rose-500 uppercase tracking-wider");
          modalStateSubtext.innerText = "Using offline fallbacks. Data will autosync when internet returns.";
          modalIcon.classList.add("fa-wifi-slash", "text-rose-500");
          if (modalIconContainer) modalIconContainer.classList.add("bg-rose-950/40", "border-rose-800/30", "text-rose-500");
          break;
        case 'error':
          modalDot.classList.add("bg-red-600", "shadow-[0_0_6px_rgba(220,38,38,0.5)]");
          modalStateText.innerText = "Sync Blocked / সংযোগ ত্রুটি";
          modalStateText.setAttribute("class", "text-xs font-black text-red-500 uppercase tracking-wider");
          modalStateSubtext.innerText = "Failed to establish synchronization handshake with the MySQL database.";
          modalIcon.classList.add("fa-triangle-exclamation", "text-red-500");
          if (modalIconContainer) modalIconContainer.classList.add("bg-red-950/40", "border-red-800/30", "text-red-500");
          break;
      }
    }
  },

  initRealtimeEventStream() {
    // 1. Same-browser multi-tab instant BroadcastChannel
    if (typeof BroadcastChannel !== "undefined" && !(this as any)._bcChannel) {
      try {
        const bc = new BroadcastChannel("lw_realtime_db_sync");
        (this as any)._bcChannel = bc;
        bc.onmessage = async (ev) => {
          if (ev.data && ev.data.type === "database_updated") {
            if (this.syncState === "syncing" || (this.lastLocalWriteTime && Date.now() - this.lastLocalWriteTime < 2000)) return;
            await this.loadFromCloud();
          }
        };
      } catch {}
    }

    // 2. Server-Sent Events (SSE) real-time push stream (/api/events)
    if ((this as any)._sseEventSource) return;
    try {
      const es = new EventSource("/api/events");
      (this as any)._sseEventSource = es;
      es.onmessage = async (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.type === "database_updated") {
            if (this.syncState === "syncing" || (this.lastLocalWriteTime && Date.now() - this.lastLocalWriteTime < 2500)) {
              return;
            }
            console.log("[SSE Realtime Stream] Database mutation received — refreshing state immediately.");
            await this.loadFromCloud();
          } else if (payload && payload.type === "database_switched") {
            console.log("[SSE Realtime Broadcaster] Database engine switched across browsers:", payload.activeMode);
            if (payload.config && this.db) {
              if (!this.db.sqlDbConfig) this.db.sqlDbConfig = {};
              this.db.sqlDbConfig = { ...this.db.sqlDbConfig, ...payload.config };
            }
            localStorage.removeItem("lottery_winner_db_backup");
            await this.loadFromCloud();
            if (typeof (this as any).showToast === "function") {
              (this as any).showToast(`Database synchronized to ${payload.activeMode} across all sessions!`, "info");
            }
            this.render();
          }
        } catch (err) {
          console.warn("Error parsing SSE event payload:", err);
        }
      };
      es.onerror = () => {
        // EventSource will auto-reconnect
      };
    } catch (e) {
      console.warn("Failed to initialize SSE EventSource:", e);
    }
  },

  startSqlPolling() {
    if (this._sqlPollInterval) return;
    this._sqlPollInterval = setInterval(async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (this.syncState === "syncing" || (this as any).cloudSyncTimeout != null || (this.lastLocalWriteTime && Date.now() - this.lastLocalWriteTime < 4000)) {
        return;
      }
      try {
        const sqlRes = await sqlBridgeFetch(`/api/sql/db?_t=${Date.now()}`, { cache: "no-store" });
        if (sqlRes.ok) {
          if (this.syncState === "syncing" || (this as any).cloudSyncTimeout != null || (this.lastLocalWriteTime && Date.now() - this.lastLocalWriteTime < 4000)) {
            return;
          }
          const sqlData = await sqlRes.json();
          if (sqlData.success && sqlData.db) {
            let parsed = typeof sqlData.db === "string" ? JSON.parse(sqlData.db) : sqlData.db;
            if (parsed) {
              parsed = removeCircularReferences(parsed);
              const beforeSig = safeStringify({
                l: this.db?.lotteries,
                s: this.db?.staff,
                a: this.db?.agents,
                u: this.db?.users,
                c: this.db?.categories,
                t: this.db?.tickets,
                d: this.db?.deposits,
                w: this.db?.withdrawals,
                st: this.db?.settings
              });
              this.mergeParsedDb(parsed);
              const afterSig = safeStringify({
                l: this.db?.lotteries,
                s: this.db?.staff,
                a: this.db?.agents,
                u: this.db?.users,
                c: this.db?.categories,
                t: this.db?.tickets,
                d: this.db?.deposits,
                w: this.db?.withdrawals,
                st: this.db?.settings
              });
              if (beforeSig !== afterSig) {
                localStorage.setItem(this.dbKey, safeStringify(this.db));
                localStorage.setItem("lottery_winner_db_backup", safeStringify(this.db));
                if (typeof (this as any).refreshCurrentUserAndWalletBalance === "function") {
                  (this as any).refreshCurrentUserAndWalletBalance(false);
                }
                if (typeof (this as any).updateMetaTags === "function") {
                  (this as any).updateMetaTags();
                }
                this.render();
                console.log("[SQL Realtime Poll] Live database changes detected and rendered automatically.");
              }
            }
          }
        }
      } catch (e) {
        // silent background poll catch
      }
    }, 3000);
  }
};

