import { NextResponse } from "next/server";
import {
  Client,
  WebhookEvent,
  MessageAPIResponseBase,
  TextMessage,
} from "@line/bot-sdk";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Message from "@/models/Message";
import { getLLMResponse } from "@/lib/llm";

// Setup all LINE client and Express configurations.
const clientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.CHANNEL_SECRET || "",
};

const client = new Client(clientConfig);

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const body = await req.json();
    const events: WebhookEvent[] = body.events;

    const results = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        return handleEvent(event);
      })
    );

    return NextResponse.json({
      status: "success",
      results,
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      {
        status: "error",
      },
      { status: 500 }
    );
  }
}

async function handleEvent(
  event: WebhookEvent
): Promise<MessageAPIResponseBase | undefined> {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(undefined);
  }

  const userId = event.source.userId;
  if (!userId) return Promise.resolve(undefined);

  // 1. Update User Info (Optimistic)
  try {
    await User.findOneAndUpdate(
      { lineUserId: userId },
      { lineUserId: userId },
      { upsert: true, new: true }
    );
  } catch (e) {
    console.error("Error saving user:", e);
  }

  // 2. Save User Message
  try {
    await Message.create({
      lineUserId: userId,
      role: "user",
      content: event.message.text,
    });
  } catch (e) {
    console.error("Error saving user message:", e);
  }

  // 3. Prepare Response (LLM)
  let replyText = "";
  try {
    // Fetch last 10 messages for context
    const recentMessages = await Message.find({ lineUserId: userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Reverse to chronological order and map to LLM format
    const history = recentMessages.reverse().map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    replyText = await getLLMResponse(history);
  } catch (e) {
    console.error("LLM Error:", e);
    replyText = "Sorry, I'm having a bit of trouble connecting to my brain right now.";
  }

  const replyMessage: TextMessage = {
    type: "text",
    text: replyText,
  };

  // 4. Save Assistant Message
  try {
    await Message.create({
      lineUserId: userId,
      role: "assistant",
      content: replyText,
    });
  } catch (e) {
    console.error("Error saving assistant message:", e);
  }

  // 5. Reply
  return client.replyMessage(event.replyToken, replyMessage);
}
