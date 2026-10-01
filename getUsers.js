import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from 'fs';

async function fetchUsers() {
  try {
    const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
    const app = initializeApp(config);
    const db = getFirestore(app);

    const docRef = doc(db, "app_data", "lottery_winner_db");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const parsedDb = typeof data.db === 'string' ? JSON.parse(data.db) : data.db;
      console.log("Total users in Firebase:", parsedDb?.users?.length || 0);
      if (parsedDb && Array.isArray(parsedDb.users)) {
        const uNames = parsedDb.users.map(u => ({ username: u.username, role: u.role, status: u.status }));
        console.log("Users:", JSON.stringify(uNames, null, 2));
      }
    } else {
      console.log("lottery_winner_db doc does not exist!");
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

fetchUsers();
