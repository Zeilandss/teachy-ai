"use server";

import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const form = await req.formData();

    const question = form.get("question") || "";
    const category = form.get("category") || "General";
    const image = form.get("image");

    // Build chat messages
    const messages = [];

    messages.push({
      role: "system",
      content:
        "You are TeachyAI, a friendly humanoid teacher who explains things clearly, kindly, and simply. You encourage students and never lecture them.",
    });

    if (question) {
      messages.push({
        role: "user",
        content: question,
      });
    }

    // If an image was sent, attach it as base64
    if (image && typeof image !== "string") {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = image.type;

      const base64 = `data:${mime};base64,${buffer.toString("base64")}`;

      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: base64 },
          },
        ],
      });
    }

    // Add category context
    messages.push({
      role: "assistant",
      content: `Category: ${category}`,
    });

    // OpenAI Request
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer =
      completion.choices?.[0]?.message?.content ||
      "I couldn't generate a good answer.";

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API ERROR:", err);
    return new Response(
      JSON.stringify({ answer: "Error processing your request." }),
      { status: 500 }
    );
  }
}
