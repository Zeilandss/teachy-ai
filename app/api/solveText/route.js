import OpenAI from "openai";


export const config = {
api: { bodyParser: false },
};


const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export async function POST(req) {
try {
const form = await req.formData();
const text = form.get("message") || "";
const imageFile = form.get("image");


const input = [];
if (text) input.push({ type: "text", text });


if (imageFile && typeof imageFile.arrayBuffer === "function") {
const bytes = Buffer.from(await imageFile.arrayBuffer());
input.push({ type: "input_image", image: bytes.toString("base64") });
}


const completion = await client.responses.create({
model: "gpt-4o-mini",
input,
max_output_tokens: 150,
});


return Response.json({ result: completion.output_text });
} catch (e) {
console.error(e);
return Response.json({ error: "Error" }, { status: 500 });
}
}