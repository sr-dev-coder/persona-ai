'use client';

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Zap, Flame } from "lucide-react";

const PERSONAS = {
  hitesh: {
    id: "nova",
    name: "Hitesh",
    tagline: "Sharp, structured, strategic",
    desc: "Breaks problems down, thinks in steps, gets you to a plan fast.",
    accent: "#4CC9F0",
    accentDim: "rgba(76,201,240,0.14)",
    icon: Zap,
    opener: "Nova here. What are we solving today?",
  },
  piyush: {
    id: "ember",
    name: "Piyush",
    tagline: "Warm, bold, a little unfiltered",
    desc: "Thinks out loud, pushes ideas further, isn't afraid of a strong opinion.",
    accent: "#FF7A45",
    accentDim: "rgba(255,122,69,0.14)",
    icon: Flame,
    opener: "Hey, it's Ember. Say what's actually on your mind.",
  },
};

// Mock reply generator — swap this for a real fetch("/api/chat") call.
function mockReply(personaId, userText) {
  const novaLines = [
    `Okay. Let's break "${userText.slice(0, 40)}" into three concrete steps and start with the first.`,
    "Here's the structure I'd use: define the goal, list constraints, then pick the smallest first move.",
    "Good question — the fastest path here is narrower than it looks. Want me to map it out?",
  ];
  const emberLines = [
    `Honestly? "${userText.slice(0, 40)}" is more interesting than you're giving it credit for.`,
    "I'd push back a little here — the safe answer isn't the right one. Let's go bolder.",
    "Love this. My gut says try the version that scares you slightly more.",
  ];
  const pool = personaId === "nova" ? novaLines : emberLines;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function PersonaChat() {
  const [screen, setScreen] = useState("pick"); // "pick" | "chat"
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const scrollRef = useRef(null);

  const persona = activeId ? PERSONAS[activeId] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function choosePersona(id) {
    setActiveId(id);
    setMessages([{ role: "assistant", text: PERSONAS[id].opener }]);
    setScreen("chat");
  }

  function backToPick() {
    setScreen("pick");
    setActiveId(null);
    setMessages([]);
    setInput("");
  }

  function send() {
    const text = input.trim();
    if (!text || isTyping) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setIsTyping(true);

    // Replace this block with a real API call, e.g.:
    // const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ persona: activeId, messages }) })
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: mockReply(activeId, text) }]);
      setIsTyping(false);
    }, 900 + Math.random() * 600);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#0B0E14",
        color: "#EDEFF4",
        width: "100%",
        height: "640px",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }
        .pc-scroll::-webkit-scrollbar { width: 6px; }
        .pc-scroll::-webkit-scrollbar-thumb { background: #232838; border-radius: 3px; }
        .pc-card { transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
        .pc-card:hover { transform: translateY(-4px); }
        .pc-send:hover { filter: brightness(1.12); }
        .pc-send:active { transform: scale(0.94); }
        .pc-input:focus { outline: none; }
        @keyframes pc-blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
      `}</style>

      {screen === "pick" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            gap: "36px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.18em",
                color: "#8A93A6",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Choose your counterpart
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "26px",
                background: "linear-gradient(90deg, #4CC9F0, #FF7A45)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Two minds. One conversation.
            </div>
          </div>

          <div style={{ display: "flex", gap: "0px", alignItems: "stretch" }}>
            {Object.values(PERSONAS).map((p, i) => {
              const Icon = p.icon;
              const hovered = hoveredCard === p.id;
              return (
                <div key={p.id} style={{ display: "flex" }}>
                  <button
                    className="pc-card"
                    onMouseEnter={() => setHoveredCard(p.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => choosePersona(p.id)}
                    style={{
                      width: "220px",
                      minHeight: "260px",
                      background: hovered ? p.accentDim : "#131722",
                      border: `1px solid ${hovered ? p.accent : "#232838"}`,
                      borderRadius: "14px",
                      padding: "26px 20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "14px",
                      cursor: "pointer",
                      textAlign: "left",
                      boxShadow: hovered ? `0 12px 28px -12px ${p.accent}66` : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: p.accentDim,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1px solid ${p.accent}55`,
                      }}
                    >
                      <Icon size={20} color={p.accent} strokeWidth={2} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 700,
                          fontSize: "20px",
                          color: "#EDEFF4",
                        }}
                      >
                        {p.name}
                      </div>
                      <div style={{ fontSize: "12px", color: p.accent, marginTop: "2px", fontWeight: 500 }}>
                        {p.tagline}
                      </div>
                    </div>
                    <div style={{ fontSize: "13px", color: "#8A93A6", lineHeight: 1.5 }}>
                      {p.desc}
                    </div>
                    <div
                      style={{
                        marginTop: "auto",
                        fontSize: "12px",
                        fontFamily: "'JetBrains Mono', monospace",
                        color: hovered ? p.accent : "#4A5165",
                      }}
                    >
                      {hovered ? "Tap to start →" : "Tap to start"}
                    </div>
                  </button>
                  {i === 0 && (
                    <div
                      style={{
                        width: "1px",
                        background:
                          "linear-gradient(180deg, transparent, #4CC9F055, #FF7A4555, transparent)",
                        margin: "0 18px",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {screen === "chat" && persona && (
        <>
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 18px",
              borderBottom: "1px solid #1B2030",
              background: "#0E121B",
            }}
          >
            <button
              onClick={backToPick}
              style={{
                background: "transparent",
                border: "none",
                color: "#8A93A6",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "6px",
                borderRadius: "8px",
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: persona.accentDim,
                border: `1px solid ${persona.accent}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <persona.icon size={15} color={persona.accent} />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px" }}>
                {persona.name}
              </div>
              <div style={{ fontSize: "11px", color: "#8A93A6" }}>{persona.tagline}</div>
            </div>
          </div>
          {/* Accent seam */}
          <div style={{ height: "2px", background: `linear-gradient(90deg, ${persona.accent}, transparent 60%)` }} />

          {/* Messages */}
          <div
            ref={scrollRef}
            className="pc-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((m, idx) =>
              m.role === "user" ? (
                <div key={idx} style={{ alignSelf: "flex-end", maxWidth: "78%" }}>
                  <div
                    style={{
                      background: "#1B2030",
                      color: "#EDEFF4",
                      padding: "10px 14px",
                      borderRadius: "14px 14px 4px 14px",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={idx} style={{ alignSelf: "flex-start", maxWidth: "78%", display: "flex", gap: "8px" }}>
                  <div
                    style={{
                      width: "3px",
                      borderRadius: "2px",
                      background: persona.accent,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      background: persona.accentDim,
                      color: "#EDEFF4",
                      padding: "10px 14px",
                      borderRadius: "4px 14px 14px 14px",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              )
            )}
            {isTyping && (
              <div style={{ alignSelf: "flex-start", display: "flex", gap: "8px" }}>
                <div style={{ width: "3px", borderRadius: "2px", background: persona.accent }} />
                <div
                  style={{
                    background: persona.accentDim,
                    padding: "12px 16px",
                    borderRadius: "4px 14px 14px 14px",
                    display: "flex",
                    gap: "4px",
                  }}
                >
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: persona.accent,
                        animation: `pc-blink 1.1s ${d * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div style={{ padding: "14px 18px", borderTop: "1px solid #1B2030", background: "#0E121B" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#131722",
                border: "1px solid #232838",
                borderRadius: "999px",
                padding: "6px 6px 6px 16px",
              }}
            >
              <input
                className="pc-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Message ${persona.name}...`}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#EDEFF4",
                  fontSize: "14px",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <button
                className="pc-send"
                onClick={send}
                disabled={!input.trim() || isTyping}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "none",
                  background: input.trim() ? persona.accent : "#232838",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() ? "pointer" : "default",
                  flexShrink: 0,
                }}
              >
                <Send size={15} color={input.trim() ? "#0B0E14" : "#4A5165"} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}