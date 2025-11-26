import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getLLMResponse(
  history: { role: "user" | "assistant" | "system"; content: string }[]
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful and friendly AI assistant." },
        ...history,
      ],
      model: "gpt-3.5-turbo", // Or gpt-4o-mini if available/cheaper
    });

    return completion.choices[0].message.content || "Sorry, I am speechless.";
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "I'm having trouble thinking right now. Please try again later.";
  }
}

