import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    // Read FormData from request
    const form = await req.formData();
    const question = form.get("question") || "";
    const category = form.get("category") || "General";
    const image = form.get("image"); // File object or null

    let imageBase64 = null;

    // Convert image to Base64 for GPT-5 Vision
    if (image && image.size > 0) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageBase64 = buffer.toString("base64");
    }

    // System prompt
    const systemPrompt = `You are an AI tutor specialized in ${category}. 
Provide clear explanations and step-by-step reasoning only when helpful.`;


    // Build OpenAI messages
    const userContent = [];

    if (question.trim().length > 0) {
      userContent.push({
        type: "text",
        text: question,
      });
    }

    if (imageBase64) {
      userContent.push({
        type: "image",
        image: imageBase64,
      });
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ];

    // Send to OpenAI GPT-5 Vision
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-vision-mini",
        messages,
      }),
    });

    const data = await apiRes.json();
    const answer = data?.choices?.[0]?.message?.content || "No response";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { answer: "Failed to process request." },
      { status: 500 }
    );
  }
}
