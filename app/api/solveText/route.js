export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json(); // Frontend sends JSON with message + imageBase64
    const { message, category, imageBase64 } = body;

    const input = [];

    if (message) input.push({ type: "text", text: `Category: ${category || "General"}\nQuestion: ${message}` });
    if (imageBase64) input.push({ type: "input_image", image: imageBase64 });

    const completion = await client.responses.create({
      model: "gpt-4o-mini",
      input,
      max_output_tokens: 250,
      temperature: 0.6,
    });

    const result =
      completion.output_text ||
      completion.output?.[0]?.content?.[0]?.text ||
      "I couldn't generate an answer.";

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("solveText error:", err);
    return new Response(JSON.stringify({ result: "Error processing your request." }), { status: 500 });
  }
}
