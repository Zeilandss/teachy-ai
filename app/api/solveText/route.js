// route.js (or route.ts in Next.js API route)

import formidable from "formidable";
import fs from "fs";
import { Configuration, OpenAIApi } from "openai";

// Disable default Next.js body parser so formidable can handle files
export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ answer: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ answer: "Error processing your request." });
    }

    const question = fields.question || "";
    const category = fields.category || "General";
    const imageFile = files.image;

    let imageBuffer = null;
    let imageMime = null;

    if (imageFile) {
      // Read image into buffer
      try {
        imageBuffer = fs.readFileSync(imageFile.filepath);
        imageMime = imageFile.mimetype;
      } catch (e) {
        console.error("Error reading image file:", e);
        return res.status(500).json({ answer: "Error reading the uploaded image." });
      }
    }

    // Now build the messages for the OpenAI chat
    const messages = [];

    // System / persona message
    messages.push({
      role: "system",
      content: "You are a friendly teacher AI who can analyze images and answer questions clearly.",
    });

    // User's text question
    if (question) {
      messages.push({
        role: "user",
        content: question,
      });
    }

    // If there is an image, add it as a “user” message with image content
    if (imageBuffer) {
      // Convert the image to base64
      const base64 = imageBuffer.toString("base64");
      const dataUrl = `data:${imageMime};base64,${base64}`;

      // Attach as image — this syntax follows OpenAI's multimodal message format
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
            },
          },
        ],
      });
    }

    // You can also add a category context
    if (category) {
      messages.push({
        role: "assistant",
        content: `Category: ${category}`,
      });
    }

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-4o",  // or another vision‑enabled GPT‑4 model you have access to
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const answer = completion.data.choices[0].message.content;
      return res.status(200).json({ answer });
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      return res.status(500).json({ answer: "Error generating response from AI." });
    }
  });
}
