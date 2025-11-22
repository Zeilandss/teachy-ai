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
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const chatEndRef = useRef(null);
  const categories = ["General", "Math", "Science", "History"];

  // Load category-specific history
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`teachy_history_${category}`);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }
  }, [category]);

  // Save history
  useEffect(() => {
    localStorage.setItem(`teachy_history_${category}`, JSON.stringify(history));
  }, [history, category]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() && !selectedImage) return;

    setLoading(true);
    setHistory(prev => [
      ...prev,
      { sender: "user", text: question || "📷 Sent an image", image: selectedImage ? URL.createObjectURL(selectedImage) : null }
    ]);
    setQuestion("");
    setIsTyping(true);

    const formData = new FormData();
    formData.append("question", question);
    formData.append("category", category);
    if (selectedImage) formData.append("image", selectedImage);

    try {
      const res = await fetch("/api/solveText", {
        method: "POST",
        body: formData
      });

      let data;
      try {
        data = await res.json();
      } catch {
        console.error("Failed to parse API JSON");
        data = { answer: "Error: AI response invalid." };
      }

      await new Promise(r => setTimeout(r, 300));

      setHistory(prev => [...prev, { sender: "ai", text: data.answer }]);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { sender: "ai", text: "Error: Could not get answer." }]);
    }

    setSelectedImage(null);
    setIsTyping(false);
    setLoading(false);
  };

  const colors = darkMode
    ? {
        background: "#111",
        sidebar: "#1A1A1A",
        text: "#E5E5E5",
        inputBg: "#222",
        userMsg: "#FF8C42",
        aiMsg: "#2C2C2C",
        button: "#FF8C42",
        highlight: "#FF7F50",
      }
    : {
        background: "#F7F7F7",
        sidebar: "#FFF",
        text: "#1A1A1A",
        inputBg: "#EFEFEF",
        userMsg: "#FF8C42",
        aiMsg: "#E0E0E0",
        button: "#FF8C42",
        highlight: "#FF7F50",
      };

  return (
    <div className="teachy-container">
      {/* Sidebar */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`} style={{ backgroundColor: colors.sidebar, color: colors.text }}>
        <h1 className="sidebar-title">Teachy</h1>

        {/* Close button for mobile */}
        {menuOpen && (
          <button
            onClick={() => setMenuOpen(false)}
            className="close-sidebar"
            style={{
              marginBottom: "20px",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: colors.button,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            ← Close
          </button>
        )}

        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setMenuOpen(false);
            }}
            className={`category-btn ${category === cat ? "active" : ""}`}
            style={{
              backgroundColor: category === cat ? colors.highlight : "transparent",
              color: category === cat ? "#fff" : colors.text,
            }}
          >
            {cat}
          </button>
        ))}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="darkmode-btn"
          style={{ backgroundColor: colors.button }}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Chat Area */}
      <div className="chat-area" style={{ backgroundColor: colors.background, color: colors.text }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar" style={{ backgroundColor: colors.sidebar, color: colors.text }}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="menu-toggle" style={{ backgroundColor: colors.button }}>
            ≡
          </button>
          <h2 className="category-label">Category: {category}</h2>
        </div>

        {/* Chat history */}
        <div className="chat-history">
          {history.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.sender}`}>
              <div className="msg-bubble" style={{
                backgroundColor: msg.sender === "user" ? colors.userMsg : colors.aiMsg,
                maxWidth: "90%",
              }}>
                {msg.image && (
                  <img src={msg.image} alt="user-upload" style={{ maxWidth: "100%", borderRadius: "12px", marginBottom: "8px" }} />
                )}
                {msg.sender === "ai" ? (
                  <ReactMarkdown children={msg.text || ""} components={{
                    code({ children }) { return <code style={{ backgroundColor: darkMode ? "#333" : "#ddd", color: darkMode ? "#FF8C42" : "#FF4500", padding: "3px 6px", borderRadius: "5px", fontFamily: "monospace" }}>{children}</code>; },
                    pre({ children }) { return <pre style={{ backgroundColor: darkMode ? "#222" : "#eee", padding: "12px", borderRadius: "12px", overflowX: "auto", color: darkMode ? "#FF8C42" : "#FF4500", fontFamily: "monospace" }}>{children}</pre>; },
                    li({ children }) { return <li style={{ marginBottom: "6px" }}>• {children}</li>; },
                    strong({ children }) { return <strong style={{ color: "#FF8C42" }}>{children}</strong>; },
                    em({ children }) { return <em style={{ color: "#FFA500" }}>{children}</em>; },
                  }} />
                ) : msg.text}
              </div>
            </div>
          ))}

          {/* Typing animation */}
          {isTyping && (
            <div className="chat-msg ai">
              <div className="msg-bubble" style={{ backgroundColor: colors.aiMsg, display: "flex", alignItems: "center", gap: 6, maxWidth: "90%" }}>
                <div className="dot"></div>
                <div className="dot" style={{ animationDelay: "0.2s" }}></div>
                <div className="dot" style={{ animationDelay: "0.4s" }}></div>
                <span style={{ fontSize: 12, color: "#aaa" }}>TeachyAI is typing...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input */}
        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={loading ? "Waiting for AI..." : "Type your question..."}
            disabled={loading}
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setSelectedImage(e.target.files[0])}
            disabled={loading}
            style={{ marginLeft: "8px" }}
          />
          <button type="submit" disabled={loading} style={{ backgroundColor: colors.button }}>Send</button>
        </form>
      </div>

      {/* Styles */}
      <style jsx>{`
        .teachy-container { display: flex; height: 100vh; font-family: 'Inter', sans-serif; }
        .sidebar { width: 260px; padding: 25px; display: flex; flex-direction: column; transition: transform 0.3s ease; z-index: 100; }
        .sidebar .sidebar-title { font-size: 24px; margin-bottom: 20px; font-weight: bold; }
        .category-btn { padding: 12px 15px; margin-bottom: 12px; border-radius: 10px; border: none; cursor: pointer; text-align: left; font-weight: 500; }
        .category-btn.active { font-weight: 600; }
        .darkmode-btn { margin-top: auto; padding: 12px; border: none; border-radius: 10px; color: #fff; cursor: pointer; font-weight: 600; }
        .chat-area { flex: 1; display: flex; flex-direction: column; position: relative; }
        .mobile-topbar { display: none; padding: 12px; align-items: center; gap: 10px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
        .menu-toggle { padding: 6px 12px; border: none; border-radius: 8px; color: #fff; cursor: pointer; font-weight: 600; }
        .chat-history { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
        .chat-msg { display: flex; }
        .chat-msg.user { justify-content: flex-end; }
        .msg-bubble { max-width: 70%; padding: 16px 20px; border-radius: 20px; word-break: break-word; box-shadow: 0 4px 12px rgba(0,0,0,0.2); line-height: 1.7; font-size: 0.95rem; }
        .chat-input { display: flex; padding: 12px 15px; border-top: 1px solid #333; gap: 8px; align-items: center; position: sticky; bottom: 0; background: inherit; }
        .chat-input input[type="text"] { flex: 1; padding: 14px 20px; border-radius: 25px; border: none; outline: none; font-size: 0.95rem; }
        .chat-input input[type="file"] { cursor: pointer; }
        .chat-input button { padding: 14px 25px; border-radius: 25px; border: none; color: #fff; font-weight: 600; cursor: pointer; }

        .dot { width: 6px; height: 6px; border-radius: 50%; background-color: #aaa; animation: bounce 1s infinite; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

        @media (max-width: 768px) {
          .teachy-container { flex-direction: column; }
          .sidebar { position: fixed; top: 0; left: 0; height: 100%; transform: translateX(-100%); background-color: inherit; transition: transform 0.3s ease; width: 80%; max-width: 300px; }
          .sidebar.open { transform: translateX(0); }
          .mobile-topbar { display: flex; }
          .chat-area { flex: 1; padding-bottom: 80px; }
          .msg-bubble { max-width: 90%; }
        }
      `}</style>
    </div>
  );
}
