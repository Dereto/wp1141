import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

export async function getLLMResponse(
  history: { role: "user" | "assistant" | "system"; content: string }[]
): Promise<string> {
  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set");
    return "I am currently offline (Config Error).";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Gemini handles history differently. 
    // We need to convert our "system/user/assistant" format to Gemini's "user/model" format.
    // Note: Gemini Pro via API usually takes a prompt or a chat history.
    
    const chat = model.startChat({
      history: history
        .filter(msg => msg.role !== "system") // Gemini Pro doesn't support system role in history directly in the same way
        .map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Get the last message (the new user input)
    // In our implementation, the history array passed in ALREADY includes the latest user message at the end.
    // However, startChat history expects *previous* turns. 
    // If we passed the full history including the last user message to startChat, we should send an empty message or handle it differently.
    
    // Let's adjust: We should assume 'history' contains the CONTEXT. 
    // The calling function in webhook usually appends the latest message to history.
    // Let's split it:
    
    const pastHistory = history.slice(0, -1);
    const latestMessage = history[history.length - 1];

    if (!latestMessage || latestMessage.role !== "user") {
       // Fallback if history is empty or malformed
       return "I didn't catch that.";
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
    return "I'm having trouble thinking right now (Quota or API Error).";
  }
}
