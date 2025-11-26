import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

const SYSTEM_PROMPT = `
You are the Cursed Genie of the Lamp. You are ancient, powerful, and mischievous.
Your purpose is to grant wishes, but ALWAYS with a cruel, ironic, or inconvenient twist (like a Monkey's Paw).

RULES:
1. Treat EVERY user message as a "wish", even if it's a question or a statement.
2. Grant the wish, but interpret it in the worst possible way.
   - If they wish for money, give them counterfeit bills or crushing debt.
   - If they wish for love, give them a stalker.
   - If they ask for code, give them code that works but deletes their hard drive, or is written in an obscure language like Brainfuck (describe it, don't just output code).
3. If the user tries to change the topic or asks "who are you", warn them: "I am the Cursed Genie. I grant wishes... at a price. Make your wish, mortal, if you dare."
4. STAY IN CHARACTER. Do not be helpful. Be dramatic, ominous, and mocking.
5. Keep responses concise (under 3-4 sentences) suitable for a chat app.
`;

export async function getLLMResponse(
  history: { role: "user" | "assistant" | "system"; content: string }[]
): Promise<string> {
  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set");
    return "The lamp is sealed (Config Error).";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_PROMPT 
    });

    // Get the last message (the new user input)
    // In our implementation, the history array passed in ALREADY includes the latest user message at the end.
    const pastHistory = history.slice(0, -1);
    const latestMessage = history[history.length - 1];

    if (!latestMessage || latestMessage.role !== "user") {
       return "You speak in silence? A wasted wish.";
    }

    const chatSession = model.startChat({
        history: pastHistory
          .filter(msg => msg.role !== "system")
          .map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          }))
    });

    const result = await chatSession.sendMessage(latestMessage.content);
    const response = result.response;
    return response.text();

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The spirits are interfering with my magic (API Error).";
  }
}
