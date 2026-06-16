const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key present:', !!apiKey);
  if (!apiKey) {
    console.log('No API Key found in process.env.GEMINI_API_KEY');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-pro'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello. Reply with one word 'OK' if you can read this.");
        console.log(`✓ Model ${modelName} worked! Response:`, result.response.text().trim());
        return;
      } catch (err) {
        console.log(`✗ Model ${modelName} failed:`, err.message);
      }
    }
  } catch (err) {
    console.error('Diagnostic error:', err);
  }
}

test();
