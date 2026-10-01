async function check() {
  try {
    const bridgeUrl = 'https://api.veloralbillal.top/db_bridge.php';
    const dbHost = 'localhost';
    const database = 'veloralb_Digital';
    const username = 'veloralb_Digital';
    const password = 'UcWg.75@wv+Ijzh#';

    const urlObj = new URL(bridgeUrl);
    urlObj.searchParams.set('token', 'Billal50598326');
    urlObj.searchParams.set('action', 'query');
    urlObj.searchParams.set('db_host', dbHost);
    urlObj.searchParams.set('db_name', database);
    urlObj.searchParams.set('db_user', username);
    urlObj.searchParams.set('db_pass', password);

    const response = await fetch(urlObj.toString(), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: new URLSearchParams({
        token: 'Billal50598326',
        action: 'query',
        db_host: dbHost,
        db_name: database,
        db_user: username,
        db_pass: password,
        sql: "SELECT * FROM users WHERE LOWER(username) = 'manna'"
      })
    });

    const text = await response.text();
    console.log("Raw Response:", text);
    if (text.startsWith('{')) {
      const res = JSON.parse(text);
      console.log("SQL Result for manna:", JSON.stringify(res, null, 2));
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

check();
