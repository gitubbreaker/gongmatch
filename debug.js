async function testApi() {
  const loginRes = await fetch('https://gongmatch-production.up.railway.app/api/students/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    body: JSON.stringify({ loginId: "suhyun@test.com", password: "1234" })
  });

  console.log("Login Status:", loginRes.status);
  if (!loginRes.ok) {
     const data = await loginRes.text();
     console.log("Login Body:", data);
     return;
  }
  
  const tokenData = await loginRes.json();
  console.log("Token received.");

  const putRes = await fetch('https://gongmatch-production.up.railway.app/api/available-time/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenData.token}`,
      'User-Agent': 'Mozilla/5.0'
    },
    body: JSON.stringify({ times: [{"dayOfWeek":"MONDAY", "startTime":"09:00", "endTime":"10:00"}] })
  });

  console.log("PUT Time Status:", putRes.status);
  const data = await putRes.text();
  console.log("PUT Time Body:", data);
}

testApi();
