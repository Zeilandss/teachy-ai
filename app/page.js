"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Teachy() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("General");
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const chatEndRef = useRef(null);
  const categories = ["General", "Math", "Science", "History"];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`teachy_history_${category}`);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }
  }, [category]);

  useEffect(() => {
    localStorage.setItem(`teachy_history_${category}`, JSON.stringify(history));
  }, [history, category]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() && !imageFile) return;

    setLoading(true);
    setHistory(prev => [...prev, { sender: "user", text: question || "(image)" }]);

    let imageBase64 = null;
    if (imageFile) {
      imageBase64 = await fileToBase64(imageFile);
    }

    setQuestion("");
    setImageFile(null);

    try {
      const res = await fetch("/api/solveText", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, category, imageBase64 }),
      });
      const data = await res.json();
      setHistory(prev => [...prev, { sender: "ai", text: data.result }]);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { sender: "ai", text: "Error: Could not get answer." }]);
    }

    setLoading(false);
  };

  const colors = darkMode
    ? { background: "#111", sidebar: "#1A1A1A", text: "#E5E5E5", inputBg: "#222", userMsg: "#FF8C42", aiMsg: "#2C2C2C", button: "#FF8C42", highlight: "#FF7F50" }
    : { background: "#F7F7F7", sidebar: "#FFF", text: "#1A1A1A", inputBg: "#EFEFEF", userMsg: "#FF8C42", aiMsg: "#E0E0E0", button: "#FF8C42", highlight: "#FF7F50" };

  return (
    <div className="teachy-container" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`} style={{ backgroundColor: colors.sidebar, color: colors.text }}>
        <h1 className="sidebar-title">Teachy</h1>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`category-btn ${category === cat ? "active" : ""}`}
            style={{ backgroundColor: category === cat ? colors.highlight : "transparent", color: category === cat ? "#fff" : colors.text }}
          >
            {cat}
          </button>
        ))}
        <button onClick={() => setDarkMode(!darkMode)} className="darkmode-btn" style={{ backgroundColor: colors.button }}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Chat Area */}
      <div className="chat-area" style={{ backgroundColor: colors.background, color: colors.text }}>
        {/* Top bar for mobile */}
        <div className="mobile-topbar" style={{ backgroundColor: colors.sidebar, color: colors.text }}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="menu-toggle" style={{ backgroundColor: colors.button }}>≡</button>
          <h2 className="category-label">Category: {category}</h2>
        </div>

        {/* Chat history */}
        <div className="chat-history">
          {history.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.sender}`}>
              <div className="msg-bubble" style={{ backgroundColor: msg.sender === "user" ? colors.userMsg : colors.aiMsg }}>
                {msg.sender === "ai" ? <ReactMarkdown children={msg.text || ""} /> : msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input */}
        <form className="chat-input" onSubmit={handleSubmit}>
          <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
            placeholder={loading ? "Waiting for AI..." : "Type your question..."} disabled={loading} />
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ borderRadius: "10px", padding: "6px" }} />
          <button type="submit" disabled={loading} style={{ backgroundColor: colors.button }}>Send</button>
        </form>
      </div>

      <style jsx>{`
        .teachy-container { display: flex; height: 100vh; }
        .sidebar { width: 260px; padding: 25px; display: flex; flex-direction: column; transition: transform 0.3s ease; }
        .sidebar .sidebar-title { font-size: 24px; margin-bottom: 40px; font-weight: bold; }
        .category-btn { padding: 12px 15px; margin-bottom: 12px; border-radius: 10px; border: none; cursor: pointer; text-align: left; font-weight: 500; }
        .category-btn.active { font-weight: 600; }
        .darkmode-btn { margin-top: auto; padding: 12px; border: none; border-radius: 10px; color: #fff; cursor: pointer; font-weight: 600; }
        .chat-area { flex: 1; display: flex; flex-direction: column; }
        .mobile-topbar { display: none; padding: 12px; align-items: center; gap: 10px; position: sticky; top: 0; z-index: 10; }
        .menu-toggle { padding: 6px 12px; border: none; border-radius: 8px; color: #fff; cursor: pointer; font-weight: 600; }
        .chat-history { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
        .chat-msg { display: flex; }
        .chat-msg.user { justify-content: flex-end; }
        .msg-bubble { max-width: 70%; padding: 16px 20px; border-radius: 20px; word-break: break-word; box-shadow: 0 4px 12px rgba(0,0,0,0.2); line-height: 1.7; font-size: 0.95rem; }
        .chat-input { display: flex; padding: 12px 15px; border-top: 1px solid #333; gap: 8px; align-items: center; }
        .chat-input input[type="text"] { flex: 1; padding: 14px 20px; border-radius: 25px; border: none; outline: none; font-size: 0.95rem; }
        .chat-input button { padding: 14px 25px; border-radius: 25px; border: none; color: #fff; font-weight: 600; cursor: pointer; }
        @media (max-width: 768px) {
          .teachy-container { flex-direction: column; }
          .sidebar { position: absolute; top: 0; left: 0; height: 100%; transform: translateX(-100%); z-index: 50; }
          .sidebar.open { transform: translateX(0); }
          .mobile-topbar { display: flex; }
        }
      `}</style>
    </div>
  );
}
