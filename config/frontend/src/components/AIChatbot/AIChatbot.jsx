import { useEffect, useRef, useState } from "react";
import "./AIChatbot.css";
import { getBotResponse } from "./AIChatbotResponses";

function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState ([
        {
            sender: "bot",
            text: "Hi! I'm your BlockBot assistant. How can I help?"
        }
    ]);

    const [input, setInput] = useState("");
    const messageListRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const messageList = messageListRef.current;
        if (messageList) {
            messageList.scrollTop = messageList.scrollHeight;
        }
    }, [messages, isOpen]);
    
    function sendMessage() {
        const message = input.trim();

        if(!message) return;

        const response = getBotResponse(message);

        setMessages(prev => [
            ...prev,
            {sender: "user", text: message },
            {sender: "bot", text: response }
        ]);

        setInput("");
    }

    return (
    <div className="chatbot-launcher">
      {isOpen && (
        <section className="chatbot" role="dialog" aria-label="BlockBot AI Assistant">
          <header className="chatbot-header">
            <div className="chatbot-title">
              <img
                src={`${import.meta.env.BASE_URL}images/RobotDancing.gif`}
                alt=""
              />
              <div>
                <h3>BlockBot AI Assistant</h3>
                <span>Here to help</span>
              </div>
            </div>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI assistant"
            >
              ×
            </button>
          </header>

          <div className="chat-messages" aria-live="polite" ref={messageListRef}>
            {messages.map((message, index) => (
              <div
                key={`${message.sender}-${index}`}
                className={`message ${message.sender}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form className="chat-input" onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for help..."
              aria-label="Ask BlockBot for help"
            />

            <button type="submit" aria-label="Send message">
              <img
                src={`${import.meta.env.BASE_URL}images/send.svg`}
                alt=""
              />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/RobotDancing.gif`}
          alt=""
        />
      </button>
    </div>
  );
}

export default AIChatbot;