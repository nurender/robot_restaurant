const { GoogleGenerativeAI } = require('@google/generative-ai');
const textToSpeech = require('@google-cloud/text-to-speech');
const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const ai = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
console.log(ai ? '✅ Sentient Gemini Brain: ACTIVE' : '⚠️  AI Brain: Missing Key (Limited Experience)');

const OPENAI_REALTIME_API_KEY = process.env.OPENAI_REALTIME_API_KEY;

// 🎙️ Official Google Neural TTS Engine
let ttsClient = null;
if (process.env.GOOGLE_TTS_KEY) {
    const credentials = JSON.parse(process.env.GOOGLE_TTS_KEY);
    // 🔥 VERY IMPORTANT (private key fix)
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    ttsClient = new textToSpeech.TextToSpeechClient({ credentials: credentials });
}

async function generateNeuralTTS(text, lang) {
    if (!ttsClient) return null;
    try {
        const request = {
            input: { text },
            voice: {
                languageCode: 'hi-IN',
                name: 'hi-IN-Neural2-A', // Premium Neural2 voices
                ssmlGender: 'FEMALE'
            },
            audioConfig: { audioEncoding: 'MP3' },
        };
        const [response] = await ttsClient.synthesizeSpeech(request);
        return response.audioContent.toString('base64');
    } catch (e) {
        console.error("Neural TTS Helper Error:", e.message);
        return null;
    }
}

module.exports = { ai, openai, OPENAI_REALTIME_API_KEY, generateNeuralTTS };
