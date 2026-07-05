"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";

const PERSONAS = {
  hitesh: {
    id: "hitesh",
    name: "Hitesh",
    tagline: "Sharp, structured, strategic",
    desc: "Retired from corporate and full time YouTuber, x founder of LCO (acquired), x CTO, Sr. Director at PW. 2 YT channels (1M & 700k+), stepped into 45 countries",
    accent: "#5B8DEF",
    accentDim: "rgba(91,141,239,0.16)",
    photo: "/hitesh.png", 
    opener: "Namaste! Main kis cheez mein help kar sakta hoon?",
  },
  piyush: {
    id: "piyush",
    name: "Piyush",
    tagline: "Warm, bold, unfiltered",
    desc: "Software Engineer | Tech Content Creator & YouTuber | 395k+ on YouTube | 25k+ Instagram | 110k+ LinkedIn",
    accent: "#D264E8",
    accentDim: "rgba(210,100,232,0.16)",
    photo: "/piyush.png", 
    opener: "Namaste! Main kis cheez mein help kar sakta hoon?",
  },
};

export default function PersonaChat() {
  const [screen, setScreen] = useState("pick"); // "pick" | "transitioning" | "chat"
  const [activeId, setActiveId] = useState(null);
  const [selectingId, setSelectingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const persona = activeId ? PERSONAS[activeId] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function choosePersona(id) {
    if (selectingId) return;
    setSelectingId(id);
    setTimeout(() => {
      setActiveId(id);
      setMessages([{ role: "assistant", text: PERSONAS[id].opener }]);
      setScreen("chat");
    }, 480);
  }

  function backToPick() {
    setScreen("pick");
    setActiveId(null);
    setSelectingId(null);
    setMessages([]);
    setInput("");
  }

  async function send() {
    const text = input.trim();
    if (!text || isTyping) return;
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: activeId, messages: newMessages }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      setMessages((m) => [...m, { role: "assistant", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: full }]);
      }
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong reaching the API. Try again." }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="pc-root">
     

      <div className="pc-aurora">
        <div className="pc-blob pc-blob-blue" />
        <div className="pc-blob pc-blob-purple" />
        <div className="pc-blob pc-blob-pink" />
      </div>

      {screen !== "chat" && (
        <div className={`pc-pick-wrap ${selectingId ? "pc-exit" : ""}`}>
          <div>
            <div className="pc-eyebrow">Choose your guide.</div>
            <div className="pc-headline">
              Different personalities.
              <br/> The same <span>powerful intelligence.</span>
            </div>
          </div>

          <div className="pc-cards">
            {Object.values(PERSONAS).map((p) => {
              const state = !selectingId ? "" : selectingId === p.id ? "pc-picked" : "pc-unpicked";
              return (
                <div
                  key={p.id}
                  className={`pc-card pc-${p.id} ${state}`}
                  onClick={() => choosePersona(p.id)}
                >
                   <div className="pc-photo-fallback"></div>
                  <Image
                    src={p.photo}
                    alt={p.name}
                    className="pc-photo-fill"
                    width={260}
                    height={380}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                 
                  <div className="pc-card-overlay">
                    <div className="pc-card-name">{p.name}</div>
                    {/* <div className="pc-card-tagline">{p.tagline}</div> */}
                    <div className="pc-card-desc">{p.desc}</div>
                    <div className="pc-card-cta">tap to start →</div>
                  </div>
                  <div className="pc-rim" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {screen === "chat" && persona && (
        <div className="pc-chat-outer">
          <div className="pc-chat-shell">
            {/* Desktop left photo panel */}
            <div className="pc-photo-panel">
              <img
                src={persona.photo}
                alt={persona.name}
                className="pc-photo-fill"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <div className="pc-photo-fallback">YOUR PHOTO<br />GOES HERE</div>
              <button className="pc-photo-back" onClick={backToPick} aria-label="Back">
                <ArrowLeft size={16} />
              </button>
              <div className="pc-photo-overlay">
                <div className="pc-photo-name">{persona.name}</div>
                <div className="pc-photo-tagline" style={{ color: persona.accent }}>{persona.tagline}</div>
              </div>
            </div>

            {/* Mobile top bar */}
            <div className="pc-mobile-bar">
              <button className="pc-mobile-back" onClick={backToPick} aria-label="Back">
                <ArrowLeft size={18} />
              </button>
              <img
                src={persona.photo}
                alt={persona.name}
                className="pc-mobile-avatar"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px" }}>
                  {persona.name}
                </div>
                <div style={{ fontSize: "11px", color: persona.accent }}>{persona.tagline}</div>
              </div>
            </div>

            <div className="pc-chat-panel">
              <div className="pc-seam" style={{ background: `linear-gradient(90deg, ${persona.accent}, transparent 60%)` }} />
              <div className="pc-messages" ref={scrollRef}>
                {messages.map((m, idx) =>
                  m.role === "user" ? (
                    <div key={idx} className="pc-msg-user">{m.text}</div>
                  ) : (
                    <div key={idx} className="pc-msg-bot-row">
                      <div className="pc-msg-bot-bar" style={{ background: persona.accent }} />
                      <div className="pc-msg-bot" style={{ background: persona.accentDim }}>{m.text}</div>
                    </div>
                  )
                )}
                {isTyping && (
                  <div className="pc-msg-bot-row">
                    <div className="pc-msg-bot-bar" style={{ background: persona.accent }} />
                    <div className="pc-typing" style={{ background: persona.accentDim }}>
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="pc-dot" style={{ background: persona.accent, animationDelay: `${d * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pc-input-bar">
                <div className="pc-input-pill">
                  <input
                    className="pc-input-field"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={`Message ${persona.name}...`}
                  />
                  <button
                    className="pc-send-btn"
                    onClick={send}
                    disabled={!input.trim() || isTyping}
                    style={{ background: input.trim() ? persona.accent : "#232838", cursor: input.trim() ? "pointer" : "default" }}
                  >
                    <Send size={15} color={input.trim() ? "#0B0E14" : "#4A5165"} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}