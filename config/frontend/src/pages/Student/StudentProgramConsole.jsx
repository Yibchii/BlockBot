import { useEffect, useRef, useState } from "react";
import { getBotResponse } from "../../components/AIChatbot/AIChatbotResponses";

export default function Console({ status, showHelp, onToggleHelp }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesRef = useRef(null);
  const isError = status.state === "error";
  const statusIcon = isError ? "!" : status.state === "running" ? "…" : "✓";

  useEffect(() => {
    if (!showHelp || !messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, showHelp]);

  function sendMessage(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message) return;

    setMessages((current) => [
      ...current,
      { sender: "user", text: message },
      { sender: "bot", text: getBotResponse(message) },
    ]);
    setInput("");
  }

  return (
    <section className={`student-panel console-panel console-${status.state} ${showHelp ? "console-with-ai" : ""}`}>
      <div className="panel-header">
        <h2>{showHelp ? "BlockBot AI Help" : "Console / Feedback"}</h2>
      </div>

      {showHelp ? (
        <div className="ai-console">
          <div className="ai-console-messages" ref={messagesRef} aria-live="polite">
            {messages.length === 0 ? (
              <div className="ai-console-empty">
                <strong>Hi! I&apos;m your BlockBot assistant.</strong>
                <p>Ask me about movement, turning, loops, or solving mazes.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.sender}-${index}`}
                  className={`ai-console-message ${message.sender}`}
                >
                  {message.text}
                </div>
              ))
            )}
          </div>
          <form className="ai-console-input" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for help..."
              aria-label="Ask BlockBot for help"
              autoFocus
            />
            <button type="submit" aria-label="Send message">Send</button>
          </form>
        </div>
      ) : (
        <div className="console-message" role={isError ? "alert" : "status"}>
          <span className="feedback-check" aria-hidden="true">{statusIcon}</span>
          <div><strong>{status.title}</strong><p>{status.msg}</p></div>
        </div>
      )}

      <button
        className="ai-help-button"
        type="button"
        onClick={onToggleHelp}
        aria-expanded={showHelp}
      >
        ✦ {showHelp ? "Back to feedback" : "AI Help"}
      </button>
    </section>
  );
}
