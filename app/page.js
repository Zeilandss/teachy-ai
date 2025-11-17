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
  const [uploadedImage, setUploadedImage] = useState(null);
  const [user, setUser] = useState(null); // Placeholder for account
  const [plan, setPlan] = useState("Free"); // Placeholder for plan selection
  const chatEndRef = useRef(null);

  const categories = ["General", "Math", "Science", "History"];

  // Load/save history per category
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`teachy_history_${category}`);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }
  }, [category]);

  useEffect(() => {
    try {
      localStorage.setItem(`teachy_history_${category}`, JSON.stringify(history));
    } catch {}
  }, [history, category]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() && !uploadedImage) return;

    setLoading(true);

    const userMessage = { sender: "user", text: question || "[Image]" };
    setHistory((prev) => [...prev, userMessage]);
    setQuestion("");

    try {
      const formData = new FormData();
      formData.append("question", question);
      formData.append("category", category);
      if (uploadedImage) formData.append("image", uploadedImage);

      const res = await fetch("/api/solveText", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const answer = data?.answer || "Error: No answer received.";
      setHistory((prev) => [...prev, { sender: "ai", text: answer }]);
    } catch (err) {
      console.error(err);
      setHistory((prev) => [...prev, { sender: "ai", text: "Error: Could not get answer." }]);
    }

    setUploadedImage(null);
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

        {/* User account / plan */}
        <div style={{ marginBottom: "30px" }}>
          {user ? (
            <div>
              <p style={{ margin: "0 0 5px 0" }}>Hello, {user.name}</p>
              <p style={{ margin: "0", fontSize: "0.9em" }}>Plan: {plan}</p>
            </div>
          ) : (
            <button
              style={{
                padding: "10px 15px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: colors.button,
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600",
                width: "100%",
              }}
              onClick={() => alert("Sign Up/Login placeholder")}
            >
              Sign Up / Login
            </button>
          )}
        </div>

        {/* Categories */}
        {categories.map((cat) => (
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

        {/* Dark mode toggle */}
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
        {/* Mobile menu */}
        <div style={{ display: "flex", padding: "12px", backgroundColor: colors.sidebar, alignItems: "center", gap: "10px", borderBottom: `1px solid ${darkMode ? "#333" : "#ccc"}` }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: "6px 12px", border: "none", borderRadius: "8px", backgroundColor: colors.button, color: "#fff", cursor: "pointer", fontWeight: "600" }}
          >
            ≡
          </button>
          <h2 style={{ margin: 0, fontWeight: "500" }}>Category: {category}</h2>
        </div>

        {/* Chat history */}
        <div style={{ flex: 1, overflowY: "auto", padding: "25px", display: "flex", flexDirection: "column", gap: "15px" }}>
          {history.map((msg, index) => (
            <div key={index} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "70%", backgroundColor: msg.sender === "user" ? colors.userMsg : colors.aiMsg, color: "#fff", padding: "16px 20px", borderRadius: "20px", wordBreak: "break-word", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", position: "relative", lineHeight: "1.7", fontSize: "0.95rem" }}>
                {msg.sender === "ai" ? (
                  <ReactMarkdown
                    children={msg.text || ""}
                    components={{
                      code({ children }) {
                        return <code style={{ backgroundColor: darkMode ? "#333" : "#ddd", color: darkMode ? "#FF8C42" : "#FF4500", padding: "3px 6px", borderRadius: "5px", fontFamily: "monospace" }}>{children}</code>;
                      },
                      pre({ children }) {
                        return <pre style={{ backgroundColor: darkMode ? "#222" : "#eee", padding: "12px", borderRadius: "12px", overflowX: "auto", color: darkMode ? "#FF8C42" : "#FF4500", fontFamily: "monospace" }}>{children}</pre>;
                      },
                      li({ children }) { return <li style={{ marginBottom: "6px" }}>• {children}</li>; },
                      strong({ children }) { return <strong style={{ color: "#FF8C42" }}>{children}</strong>; },
                      em({ children }) { return <em style={{ color: "#FFA500" }}>{children}</em>; },
                    }}
                  />
                ) : msg.text}

                {msg.sender === "ai" && (
                  <div style={{ position: "absolute", top: "5px", right: "5px", display: "flex", gap: "5px" }}>
                    <button onClick={() => copyToClipboard(msg.text || "")} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "14px" }}>📋</button>
                    <button onClick={() => alert("Liked!")} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "14px" }}>👍</button>
                    <button onClick={() => alert("Saved!")} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "14px" }}>⭐</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input bar */}
        <form onSubmit={handleSubmit} style={{ display: "flex", padding: "18px 25px", borderTop: `1px solid ${darkMode ? "#333" : "#ccc"}`, backgroundColor: darkMode ? "#1C1C1C" : "#fafafa", gap: "8px", alignItems: "center" }}>
          {/* Image button */}
          <label style={{ cursor: "pointer", padding: "10px", borderRadius: "10px", backgroundColor: colors.button, color: "#fff", fontWeight: "600" }}>
            📷
            <input type="file" accept="image/*" onChange={(e) => setUploadedImage(e.target.files[0])} style={{ display: "none" }} />
          </label>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={loading ? "Waiting for AI..." : "Type your question..."}
            style={{ flex: 1, padding: "14px 20px", borderRadius: "25px", border: "none", outline: "none", backgroundColor: colors.inputBg, color: darkMode ? "#fff" : "#000", fontSize: "0.95rem" }}
            disabled={loading}
          />
          <button type="submit" disabled={loading} style={{ padding: "14px 25px", borderRadius: "25px", border: "none", backgroundColor: colors.button, color: "#fff", fontWeight: "600", cursor: "pointer" }}>Send</button>
        </form>
      </div>

      <style>{`
        div[style*="flex-direction: column; gap: 15px"] > div {
          opacity: 0;
          transform: translateY(10px);
          animation: fadeIn 0.3s forwards;
        }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
