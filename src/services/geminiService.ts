import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sendTelegramMessage, escapeHtml } from './telegramService';

/**
 * Gemini AI Service
 * Uses the @google/genai SDK to interact with Gemini models.
 */

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const submitCrimeTipDeclaration: FunctionDeclaration = {
  name: "submitCrimeTip",
  description: "Submit a crime tip or report from a citizen to the police department. Extracts name, phone, location, and details.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The name of the person reporting the tip." },
      phone: { type: Type.STRING, description: "The phone number of the person reporting." },
      location: { type: Type.STRING, description: "The location of the incident." },
      details: { type: Type.STRING, description: "The full details of the crime or tip." },
    },
    required: ["name", "phone", "location", "details"],
  },
};

/**
 * Generates a response from Gemini based on the user prompt.
 * @param userPrompt - The text input from the user
 * @param history - Optional chat history for context
 * @returns The generated text response or an error message
 */
export const getGeminiResponse = async (userPrompt: string, history: any[] = []): Promise<string> => {
  try {
    const client = getAIClient();
    
    // Format history for the API
    const contents = [...history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })), {
      role: 'user',
      parts: [{ text: userPrompt }]
    }];

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents as any,
      config: {
        systemInstruction: `የኤጀንቱ ተልዕኮ (Agent Mission):
አንተ "የምዕራብ ጎጃም ፖሊስ ዲጂታል ረዳት" ነህ። ዋናው ተግባርህ ከዜጎች የሚመጡ የወንጀል ጥቆማዎችን መቀበል እና ወደተዘጋጁት ሦስት መስመሮች (Channels) መላክ ነው።

የመረጃ መቀበያ መስመሮች (Endpoints):
1. Vercel & Google Sheets: https://west-gojjame-police-5svt.vercel.app/
2. Firebase: Realtime Database/Firestore
3. Telegram Bot: የፖሊስ ግሩፕ ማሳወቂያ

የአሠራር ቅደም ተከተል፦
1. ተጠቃሚው ጥቆማ ሲሰጥህ፦ ስም፣ ስልክ፣ ቦታ እና የጥቆማ ዝርዝር ለይተህ አውጣ። መረጃው ካልተሟላ በትህትና ጠይቅ።
2. መረጃው ሲሟላ 'submitCrimeTip' የተባለውን function በመጠቀም ላክ።
3. አንዴ function ከተጠራ በኋላ፣ ለተጠቃሚው ይህንን መልስ ስጥ፡ "ጥቆማዎ ለምዕራብ ጎጃም ፖሊስ መምሪያ፣ ለፌርቤዝ እና ለቴሌግራም ግሩፕ በቅጽበት ተልኳል"
4. መረጃው በሚስጥር የተያዘ መሆኑን ደጋግመህ ግለጽ።

የንግግር ደንብ፦
ቋንቋህ አማርኛ ብቻ ይሁን። እጅግ በትህትና አናግር።`,
        tools: [{ functionDeclarations: [submitCrimeTipDeclaration] }],
      }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      if (call.name === "submitCrimeTip") {
        const args = call.args as any;
        
        const message = `🤖 <b>አዲስ ጥቆማ ደርሷል! (ከ AI ረዳት)</b>\n---------------------------\n<b>Name:</b> ${escapeHtml(args.name)}\n<b>Phone:</b> ${escapeHtml(args.phone)}\n<b>Location:</b> ${escapeHtml(args.location)}\n---------------------------\n<b>Details:</b>\n${escapeHtml(args.details)}`;

        // 1 & 2. Firebase and Telegram in parallel
        await Promise.all([
          addDoc(collection(db, 'community_reports'), {
            reporterName: args.name,
            reporterPhone: args.phone,
            location: args.location,
            details: args.details,
            date: new Date().toISOString().split('T')[0],
            status: 'New',
            timestamp: serverTimestamp(),
            source: 'AI Assistant'
          }).catch(console.error),
          sendTelegramMessage(message).catch(console.error)
        ]);

        // 3. Google Sheets (background)
        const sheetURL = "https://script.google.com/macros/s/AKfycbw2Bkjrv9SbObSFs0xOlcONYKJKpsa_lqSu2to4PfIKlHoP8U5KVMj0DQYrkvkS_jYS/exec";
        const reportData = {
          name: args.name,
          phone: args.phone,
          email: "AI Assistant",
          message: args.details,
          location: args.location,
          date: new Date().toISOString().split('T')[0],
          status: 'New'
        };
        fetch(sheetURL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        }).catch(console.error);

        return "ጥቆማዎ ለምዕራብ ጎጃም ፖሊስ መምሪያ፣ ለፌርቤዝ እና ለቴሌግራም ግሩፕ በቅጽበት ተልኳል። መረጃዎ ሙሉ በሙሉ በሚስጥር የተጠበቀ ነው። ስለ ትብብርዎ እናመሰግናለን።";
      }
    }

    return response.text || "ምንም ምላሽ አልተገኘም። (No response found.)";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "ይቅርታ፣ ምላሽ መስጠት አልቻልኩም። (Sorry, I couldn't generate a response.)";
  }
};
