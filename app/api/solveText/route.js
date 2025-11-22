import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    // Parse the incoming multipart/form-data
    const form = await req.formData();
    const text = form.get("message") || "";
    const category = form.get("category") || "General";
    const imageFile = form.get("image");

    // Build the input array for OpenAI Responses API
    const input = [];

    if (text) {
      input.push({ type: "text", text: `Category: ${category}\nQuestion: ${text}` });
    }

    if (imageFile && imageFile.arrayBuffer) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      input.push({
        type: "input_image",
        image: buffer.toString("base64"),
      });
    }

    const completion = await client.responses.create({
      model: "gpt-4o-mini",      // fast vision-capable model
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
