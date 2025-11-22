"use client";
import { useState, useRef } from "react";


export default function Home() {
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(false);
const [image, setImage] = useState(null);
const fileInputRef = useRef(null);


async function sendMessage(e) {
e.preventDefault();
const text = e.target.message.value;
if (!text && !image) return;


setLoading(true);


const form = new FormData();
form.append("message", text);
if (image) form.append("image", image);


const newMsg = { role: "user", content: text, image: image ? URL.createObjectURL(image) : null };
setMessages((prev) => [...prev, newMsg]);


const res = await fetch("/api/solveText", { method: "POST", body: form });
const data = await res.json();


setMessages((prev) => [...prev, { role: "assistant", content: data.result }]);
setLoading(false);
setImage(null);
e.target.reset();
}


return (
<div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
<header style={{ position: "sticky", top: 0, background: "white", zIndex: 1000, padding: "10px", borderBottom: "1px solid #ccc" }}>
<h2>TeachyAI</h2>
</header>


<div style={{ marginTop: "20px" }}>
{messages.map((msg, i) => (
<div key={i} style={{ marginBottom: "15px" }}>
<strong>{msg.role === "user" ? "You:" : "Teachy:"}</strong>
<p>{msg.content}</p>
{msg.image && <img src={msg.image} alt="uploaded" style={{ width: "100%", borderRadius: "10px" }} />}
</div>
))}


{loading && <p>Typing...</p>}
</div>


<form onSubmit={sendMessage} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
<textarea name="message" placeholder="Ask something..." style={{ padding: "10px", width: "100%", borderRadius: "8px", border: "1px solid #ccc" }}></textarea>


<button type="button" onClick={() => fileInputRef.current.click()} style={{ padding: "10px", background: "#eee", borderRadius: "8px", border: "1px solid #ccc" }}>
Upload Image
</button>
<input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setImage(e.target.files[0])} />


<button type="submit" style={{ padding: "10px", background: "black", color: "white", borderRadius: "8px" }}>Send</button>
</form>
</div>
);
}