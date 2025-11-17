"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Teachy() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("General");
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setHistory(prev => [...prev, { sender: "user", text: question }]);
    setQuestion("");

    try {
      const res = await fetch("/api/solveText", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, category }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        console.error("Failed to parse API JSON");
        data = { answer: "Error: AI response invalid." };
      }

      setHistory(prev => [...prev, { sender: "ai", text: data.answer }]);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { sender: "ai", text: "Error: Could not get answer." }]);
    }

    setLoading(false);
  };

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {}
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
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: menuOpen ? "260px" : "0",
          transition: "width 0.3s",
          backgroundColor: colors.sidebar,
          color: colors.text,
          display: "flex",
          flexDirection: "column",
          padding: menuOpen ? "25px" : "0",
          overflow: "hidden",
        }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "40px", fontWeight: "bold" }}>Teachy</h1>

        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "12px 15px",
              marginBottom: "12px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: category === cat ? colors.highlight : "transparent",
              color: category === cat ? "#fff" : colors.text,
              cursor: "pointer",
              textAlign: "left",
              fontWeight: category === cat ? "600" : "400",
              transition: "all 0.2s",
              boxShadow: category === cat ? "0 4px 10px rgba(0,0,0,0.3)" : "none",
            }}
          >
            {cat}
          </button>
        ))}

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            marginTop: "auto",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: colors.button,
            color: "#fff",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: colors.background, color: colors.text }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "25px", display: "flex", flexDirection: "column", gap: "15px" }}>
          {history.map((msg, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "70%", backgroundColor: msg.sender === "user" ? colors.userMsg : colors.aiMsg, color: "#fff", padding: "16px 20px", borderRadius: "20px", wordBreak: "break-word", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", position: "relative", lineHeight: "1.7", fontSize: "0.95rem" }}>
                {msg.sender === "ai" ? (
                  <ReactMarkdown
                    children={msg.text || ""}
                    components={{
                      code({ children }) { return <code style={{ backgroundColor: darkMode ? "#333" : "#ddd", color: darkMode ? "#FF8C42" : "#FF4500", padding: "3px 6px", borderRadius: "5px", fontFamily: "monospace" }}>{children}</code>; },
                      pre({ children }) { return <pre style={{ backgroundColor: darkMode ? "#222" : "#eee", padding: "12px", borderRadius: "12px", overflowX: "auto", color: darkMode ? "#FF8C42" : "#FF4500", fontFamily: "monospace" }}>{children}</pre>; },
                      li({ children }) { return <li style={{ marginBottom: "6px" }}>• {children}</li>; },
                      strong({ children }) { return <strong style={{ color: "#FF8C42" }}>{children}</strong>; },
                      em({ children }) { return <em style={{ color: "#FFA500" }}>{children}</em>; },
                    }}
                  />
                ) : msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", padding: "18px 25px", borderTop: `1px solid ${darkMode ? "#333" : "#ccc"}`, backgroundColor: darkMode ? "#1C1C1C" : "#fafafa", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={loading ? "Waiting for AI..." : "Type your question..."}
            style={{ flex: 1, padding: "14px 20px", borderRadius: "25px", border: "none", outline: "none", backgroundColor: colors.inputBg, color: darkMode ? "#fff" : "#000", fontSize: "0.95rem" }}
            disabled={loading}
          />
          <button type="submit" disabled={loading} style={{ padding: "14px 25px", borderRadius: "25px", border: "none", backgroundColor: colors.button, color: "#fff", fontWeight: "600", cursor: "pointer" }}>Send</button>
        </form>
      </div>
    </div>
  );
}
