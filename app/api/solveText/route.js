import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const form = await req.formData();
    const text = form.get("message") || "";
    const category = form.get("category") || "General";
    const imageFile = form.get("image");

    // Build input array for the responses API (fast)
    const input = [];

    // Add text if present
    if (text) {
      input.push({ type: "text", text: `Category: ${category}\nQuestion: ${text}` });
    }

    // If image was uploaded, attach as base64 in-memory
    if (imageFile && typeof imageFile.arrayBuffer === "function") {
      const bytes = Buffer.from(await imageFile.arrayBuffer());
      // push an input_image (this format is accepted by many OpenAI multimodal endpoints)
      input.push({ type: "input_image", image: bytes.toString("base64") });
    }

    // Call the Responses API (fast model)
    const completion = await client.responses.create({
      model: "gpt-4o-mini",      // fast vision-capable model
      input,
      max_output_tokens: 250,    // keep reasonably small for speed
      temperature: 0.6,
    });

    // responses API returns output_text or items; prefer output_text
    const result = completion.output_text || (completion.output?.[0]?.content?.[0]?.text) || "I couldn't generate an answer.";

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("solveText error:", err);
    return new Response(JSON.stringify({ result: "Error processing your request." }), { status: 500 });
  }
}
