async function callGenerate(name, scores, memo) {
  console.log(`\n--- Calling API for: ${name} ---`);
  try {
    const response = await fetch('http://localhost:5000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        childInfo: { name, age: 7, gender: '남', guardianName: '보호자', consultationDate: '2026-04-24', institutionName: '기관', counselorName: '상담사' }, 
        scores, 
        observationMemo: memo 
      })
    });
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`ReportText Received: ${data.reportText ? 'YES (Length: ' + data.reportText.length + ')' : 'NO'}`);
    console.log(`PayloadUsed Provided: ${data.payloadUsed ? 'YES' : 'NO'}`);
  } catch (e) {
    console.log(`[ERROR] ${e.message}`);
  }
}

async function runTests() {
  await callGenerate("Stable Case", { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3 }, "원만한 아이입니다.");
  await callGenerate("Emotion Severe Case", { q1: 3, q2: 3, q3: 5, q4: 5, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3 }, "화가 많고 충동적입니다.");
  await callGenerate("High Social Case", { q1: 3, q2: 3, q3: 3, q4: 3, q5: 5, q6: 5, q7: 3, q8: 3, q9: 3, q10: 3 }, "친구들과 아주 잘 어울립니다.");
}

runTests();
