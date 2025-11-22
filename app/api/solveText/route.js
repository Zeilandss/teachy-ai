export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const form = await req.formData();
    const text = form.get("message") || "";
    const category = form.get("category") || "General";
    const imageFile = form.get("image");

    const input = [];

    if (text) {
      input.push({ type: "text", text: `Category: ${category}\nQuestion: ${text}` });
    }

    if (imageFile && imageFile instanceof File) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      input.push({ type: "input_image", image: base64 });
    }

    // Fast multimodal model
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
    return new Response(
      JSON.stringify({ result: "Error processing your request." }),
      { status: 500 }
    );
  }
}
