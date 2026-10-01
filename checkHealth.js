async function checkHealth() {
  try {
    const response = await fetch('http://localhost:3000/api/database/health');
    const res = await response.json();
    console.log("Health Result:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

checkHealth();
