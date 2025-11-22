import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

// Tell Next.js to disable its default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Parse form-data (text + image)
const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

export async function POST(req) {
  try {
    const { fields, files } = await parseForm(req);

    const userMessage = fields.message || "";

    const imageFile = files.image
      ? fs.readFileSync(files.image.filepath)
      : null;

    let content = [];

    // Add text message
    if (userMessage) {
      content.push({ type: "text", text: userMessage });
    }

    // Add image if available
    if (imageFile) {
      content.push({
        type: "input_image",
        image: imageFile.toString("base64"),
      });
    }

    // GPT-4o-mini Vision request
    const completion = await client.responses.create({
      model: "gpt-4o-mini",
      input: content,
    });

    const responseText = completion.output_text || "No response";

    return new Response(JSON.stringify({ result: responseText }), {
      status: 200,
    });
  } catch (err) {
    console.error("ERROR:", err);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500 }
    );
  }
}
