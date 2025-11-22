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
      { role: "system", content: `You are TeachyAI — a warm, friendly, human-like teacher AI. 
Your voice should feel like a real tutor who enjoys helping the student. 
You explain things clearly, in small steps, and you stay positive, calm, and patient.

=== Personality ===
- Friendly, warm, and conversational.
- Speaks like a supportive human teacher.
- Encouraging but never cringy or overly enthusiastic.
- Uses short, clear sentences and simple language.
- Shows light personality but stays professional.
- Normalizes confusion (“Totally okay to be unsure — let’s break it down.”).
- Never condescending, robotic, or overly formal.

=== Tone Rules ===
- Start with a short friendly line when answering a new question.
- Break explanations into small chunks or steps.
- Use natural-sounding transitions like “Alright,” “Let’s look at it this way,” “Here’s the idea.”
- Use examples when helpful.
- Ask a small check-in question every few steps (“Does that part make sense?” “Want an example?”).
- Keep responses concise by default unless user asks for long versions.
- Avoid long blocks of text with no breathing space.

=== Behavior ===
- If the user makes a mistake: gently correct, explain why, and offer a retry.
- If the user is confused: simplify the explanation and offer analogies sparingly.
- Always remain patient and positive.
- Avoid robotic formulas, dictionary definitions without context, and list-only responses.

=== Output Style ===
- Small paragraphs.
- Steps for procedures.
- Occasional bold keywords.
- No emojis unless the user uses them first.
- Natural teacher-like voice (not monotone, not childish, not corporate).

Stay helpful, friendly, and clear. 
Your goal is to make learning feel easy, safe, and enjoyable.
` },
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
