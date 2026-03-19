import React, { useState } from "react";
import "./App.css";

const backend = "http://127.0.0.1:8000";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [provider, setProvider] = useState("gemini");
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    if (!file) return alert("Select a file first");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    await fetch(`${backend}/upload`, {
      method: "POST",
      body: formData,
    });

    setLoading(false);
    alert("Document uploaded!");
  };

  const askQuestion = async () => {
    if (!question) return;

    const userMessage = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    const res = await fetch(
      `${backend}/rag?question=${question}&provider=${provider}`,
    );
    const data = await res.json();

    const aiMessage = { role: "ai", text: data.answer };

    setMessages((prev) => [...prev, aiMessage]);
    setQuestion("");
    setLoading(false);
  };

  const clearDB = async () => {
    await fetch(`${backend}/clear`, { method: "POST" });
    setMessages([]);
    alert("Cleared!");
  };

  return (
    <div className="chat-container">
      {/* HERO */}
      <div className="hero">
        <h1 className="hero-title">🧠 Multimodal RAG Agent</h1>
        <p className="hero-sub">Your AI-powered knowledge assistant</p>
      </div>

      <div className="top-bar">
        <div className="left-controls">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="select"
          >
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
            <option value="openai">OpenAI</option>
            <option value="ollama">Ollama</option>
          </select>

          <label className="file-upload">
            📂 Choose File
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              hidden
            />
          </label>

          <button className="upload-btn" onClick={uploadFile}>
            ⬆ Upload
          </button>
        </div>

        <button className="clear-btn" onClick={clearDB}>
          Clear
        </button>
      </div>

      {/* CHAT */}
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === "user" ? "user" : "ai"}`}
          >
            <div className="message-content">{msg.text}</div>

            {msg.role === "ai" && (
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(msg.text)}
              >
                📋
              </button>
            )}
          </div>
        ))}

        {loading && <div className="message ai">⏳ Thinking...</div>}
      </div>

      {/* INPUT */}
      <div className="input-box">
        <input
          type="text"
          placeholder="Ask anything..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button onClick={askQuestion}>Send</button>
      </div>
    </div>
  );
}

export default App;
