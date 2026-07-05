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
    opener: "Hanji, Kaise hai ap?",
  },
  piyush: {
    id: "piyush",
    name: "Piyush",
    tagline: "Warm, bold, unfiltered",
    desc: "Software Engineer | Tech Content Creator & YouTuber | 395k+ on YouTube | 25k+ Instagram | 110k+ LinkedIn",
    accent: "#D264E8",
    accentDim: "rgba(210,100,232,0.16)",
    photo: "/piyush.png", 
    opener: "Hey, it's Piyush. Say what's actually on your mind.",
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }

        .pc-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(180deg, #05070F 0%, #070A1C 45%, #0A0F2A 75%, #0A0F2A 100%);
          font-family: 'Inter', system-ui, sans-serif;
          color: #F4F6FF;
          overflow: hidden;
        }

        .pc-aurora { position: fixed; inset: 0; z-index: 0; overflow: hidden; }
        .pc-blob { position: absolute; border-radius: 50%; filter: blur(70px); }
        .pc-blob-blue { width: 60vw; height: 60vw; left: -15%; bottom: -30%; background: radial-gradient(circle, #3B82F6, transparent 70%); animation: pc-drift-a 14s ease-in-out infinite; }
        .pc-blob-pink { width: 55vw; height: 55vw; right: -15%; bottom: -25%; background: radial-gradient(circle, #EC4899, transparent 70%); animation: pc-drift-b 17s ease-in-out infinite; }
        .pc-blob-purple { width: 50vw; height: 50vw; left: 25%; bottom: -35%; background: radial-gradient(circle, #8B5CF6, transparent 70%); animation: pc-drift-c 20s ease-in-out infinite; }
        @keyframes pc-drift-a { 0%,100% { transform: translate(0,0) scale(1); opacity: .5; } 50% { transform: translate(6%,-8%) scale(1.15); opacity: .7; } }
        @keyframes pc-drift-b { 0%,100% { transform: translate(0,0) scale(1); opacity: .45; } 50% { transform: translate(-8%,-6%) scale(1.2); opacity: .65; } }
        @keyframes pc-drift-c { 0%,100% { transform: translate(-50%,0) scale(1); opacity: .4; } 50% { transform: translate(-50%,-10%) scale(1.1); opacity: .6; } }

        .pc-pick-wrap {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 60px 24px 120px; gap: 56px;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .pc-pick-wrap.pc-exit { opacity: 0; transform: scale(0.97); pointer-events: none; }

        .pc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: #9AA3C7; text-align: center; }
        .pc-headline { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 40px; text-align: center; line-height: 1.15; margin-top: 14px; max-width: 640px; }
        .pc-headline span { background: linear-gradient(90deg, #5B8DEF, #D264E8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .pc-cards { display: flex; gap: 32px; flex-wrap: wrap; justify-content: center; }
        .pc-card {
          width: 260px; height: 380px; border-radius: 22px; position: relative; overflow: hidden;
          cursor: pointer; border: 1px solid rgba(255,255,255,0.12); background: #0A0F24;
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, opacity 0.4s ease;
        }
        .pc-card:hover { transform: translateY(-8px); }
        .pc-card.pc-hitesh:hover { border-color: rgba(91,141,239,0.6); box-shadow: 0 24px 60px -20px rgba(91,141,239,0.5); }
        .pc-card.pc-piyush:hover { border-color: rgba(210,100,232,0.6); box-shadow: 0 24px 60px -20px rgba(210,100,232,0.5); }
        .pc-card.pc-picked { transform: scale(1.08); z-index: 2; }
        .pc-card.pc-unpicked { opacity: 0; transform: scale(0.9) translateY(10px); }

        .pc-photo-fill { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .pc-photo-fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #4A5178; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.08em; text-align: center; }
        .pc-card.pc-hitesh .pc-photo-fallback { background: radial-gradient(circle at 50% 35%, #17213E, #0A0F24 75%); }
        .pc-card.pc-piyush .pc-photo-fallback { background: radial-gradient(circle at 50% 35%, #241733, #0A0F24 75%); }

        .pc-card-overlay { position: absolute; left: 0; right: 0; bottom: 0; height: 62%; background: linear-gradient(180deg, transparent, rgba(5,7,15,0.55) 35%, rgba(5,7,15,0.94) 85%); display: flex; flex-direction: column; justify-content: flex-end; padding: 20px 20px 22px; transition: height 0.35s ease; }
        .pc-card:hover .pc-card-overlay { height: 70%; }
        .pc-rim { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; opacity: 0.95; }
        .pc-card.pc-hitesh .pc-rim { background: linear-gradient(90deg, transparent, #5B8DEF, transparent); }
        .pc-card.pc-piyush .pc-rim { background: linear-gradient(90deg, transparent, #D264E8, transparent); }

        .pc-card-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 22px; }
        .pc-card-tagline { font-size: 13px; margin-top: 4px; font-weight: 500; }
        .pc-card.pc-hitesh .pc-card-tagline { color: #7FAAFF; }
        .pc-card.pc-piyush .pc-card-tagline { color: #E491F0; }
        .pc-card-desc { font-size: 12.5px; color: #B4BADA; line-height: 1.55; margin-top: 10px; max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.35s ease, opacity 0.35s ease; }
        .pc-card:hover .pc-card-desc { max-height: 60px; opacity: 1; }
        .pc-card-cta { margin-top: 12px; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #6B7396; letter-spacing: 0.05em; }

        /* ---- CHAT SCREEN ---- */
        .pc-chat-outer {
          position: relative; z-index: 1; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          opacity: 0; transform: translateY(16px) scale(0.98);
          animation: pc-enter 0.5s ease forwards;
        }
        @keyframes pc-enter { to { opacity: 1; transform: translateY(0) scale(1); } }

        .pc-chat-shell {
          width: 100%; max-width: 1024px; height: min(720px, 88vh);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px; overflow: hidden;
          display: grid; grid-template-columns: 380px 1fr;
        }

        .pc-photo-panel { position: relative; overflow: hidden; }
        .pc-photo-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 24px; background: linear-gradient(180deg, transparent 40%, rgba(5,7,15,0.9) 100%); pointer-events: none; z-index: 1; }
        .pc-photo-back { position: absolute; top: 18px; left: 18px; width: 34px; height: 34px; border-radius: 50%; background: rgba(5,7,15,0.55); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: #F4F6FF; cursor: pointer; backdrop-filter: blur(6px); z-index: 2; }
        .pc-photo-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 24px; }
        .pc-photo-tagline { font-size: 13px; margin-top: 4px; font-weight: 500; }

        .pc-mobile-bar { display: none; }

        .pc-chat-panel { display: flex; flex-direction: column; min-height: 0; }
        .pc-seam { height: 2px; flex-shrink: 0; }
        .pc-messages { flex: 1; overflow-y: auto; padding: 22px 22px; display: flex; flex-direction: column; gap: 12px; }
        .pc-messages::-webkit-scrollbar { width: 6px; }
        .pc-messages::-webkit-scrollbar-thumb { background: #232838; border-radius: 3px; }

        .pc-msg-user { align-self: flex-end; max-width: 78%; background: #1B2030; padding: 10px 14px; border-radius: 14px 14px 4px 14px; font-size: 14px; line-height: 1.5; }
        .pc-msg-bot-row { align-self: flex-start; max-width: 78%; display: flex; gap: 8px; }
        .pc-msg-bot-bar { width: 3px; border-radius: 2px; flex-shrink: 0; }
        .pc-msg-bot { padding: 10px 14px; border-radius: 4px 14px 14px 14px; font-size: 14px; line-height: 1.5; }

        .pc-typing { display: flex; gap: 4px; padding: 12px 16px; border-radius: 4px 14px 14px 14px; }
        .pc-dot { width: 5px; height: 5px; border-radius: 50%; animation: pc-blink 1.1s infinite; }
        @keyframes pc-blink { 0%,80%,100% { opacity: .25; } 40% { opacity: 1; } }

        .pc-input-bar { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
        .pc-input-pill { display: flex; align-items: center; gap: 10px; background: #131722; border: 1px solid #232838; border-radius: 999px; padding: 6px 6px 6px 16px; }
        .pc-input-field { flex: 1; background: transparent; border: none; color: #EDEFF4; font-size: 14px; font-family: 'Inter', sans-serif; }
        .pc-input-field:focus { outline: none; }
        .pc-send-btn { width: 34px; height: 34px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pc-send-btn:hover { filter: brightness(1.12); }
        .pc-send-btn:active { transform: scale(0.94); }

        @media (max-width: 768px) {
          .pc-chat-outer { padding: 0; align-items: stretch; }
          .pc-chat-shell { max-width: 100%; height: 100vh; border-radius: 0; grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
          .pc-photo-panel { display: none; }
          .pc-mobile-bar { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
          .pc-mobile-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
          .pc-mobile-fallback { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; }
          .pc-mobile-back { background: transparent; border: none; color: #9AA3C7; display: flex; align-items: center; cursor: pointer; padding: 6px; }
        }
      `}</style>

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