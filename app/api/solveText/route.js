import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const data = await req.json();
    const question = data?.question || "Hello";
    const category = data?.category || "General";

    if (!process.env.OPENAI_API_KEY) {
      console.error("[Teachy] Missing OpenAI API key");
      return NextResponse.json({ answer: "Server missing OpenAI API key." });
    }

    const messages = [
      { role: "system", content: `You are an AI tutor specialized in ${category}. Answer clearly.` },
      { role: "user", content: question },
    ];

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gpt-5-mini", messages }),
    });

    if (!apiRes.ok) {
      console.error("[Teachy] OpenAI request failed:", apiRes.status, await apiRes.text());
      return NextResponse.json({ answer: "Teachy could not get a response from OpenAI." });
    }

    const apiData = await apiRes.json();
    const answer = apiData?.choices?.[0]?.message?.content || "Teachy could not generate an answer.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[Teachy] Unexpected error:", err);
    return NextResponse.json({ answer: "Error processing your question." });
  }
}
