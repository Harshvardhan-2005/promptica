import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import {
  Send,
  Plus,
  ChevronDown,
  Bot,
  User,
  Sparkles,
  MessageSquare,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
];

function Message({ msg, isStreaming }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: isUser ? "var(--accent)" : "var(--bg-3)",
          color: isUser ? "white" : "var(--text-2)",
        }}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        style={{
          background: isUser ? "var(--accent)" : "var(--surface)",
          border: isUser ? "none" : "1px solid var(--border)",
          color: isUser ? "white" : "var(--text)",
        }}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {msg.content}
          </p>
        ) : (
          <div className={`prose-chat ${isStreaming ? "cursor-blink" : ""}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content || ""}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--bg-3)", color: "var(--text-2)" }}
      >
        <Bot size={15} />
      </div>
      <div
        className="px-4 py-3.5 rounded-2xl rounded-tl-sm"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex gap-1.5 items-center">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(chatId || null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  // Load existing chat
  useEffect(() => {
    if (chatId) {
      setCurrentChatId(chatId);
      axios
        .get(`${API}/api/history/${chatId}`)
        .then((res) => {
          setMessages(res.data.messages);
          setModel(res.data.model || "llama-3.3-70b-versatile");
        })
        .catch(() => navigate("/chat"));
    } else {
      setMessages([]);
      setCurrentChatId(null);
    }
  }, [chatId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  }, [input]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId: currentChatId, message: text, model }),
      });

      if (!res.ok) throw new Error("Failed to send");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";
      setIsTyping(false);
      setIsStreaming(true);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "chatId" && !currentChatId) {
              setCurrentChatId(data.chatId);
              navigate(`/chat/${data.chatId}`, { replace: true });
            } else if (data.type === "delta") {
              assistantContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            } else if (data.type === "done") {
              setIsStreaming(false);
            }
          } catch {}
        }
      }
    } catch (err) {
      setIsTyping(false);
      setIsStreaming(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }
  }, [input, isStreaming, currentChatId, model, navigate]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newChat = () => {
    navigate("/chat");
    setMessages([]);
    setCurrentChatId(null);
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] relative">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <button
          onClick={newChat}
          className="btn-ghost flex items-center gap-1.5 text-xs"
        >
          <Plus size={14} />
          New Chat
        </button>

        {/* Model picker */}
        <div className="relative">
          <button
            onClick={() => setShowModelMenu((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-display font-semibold border transition-all"
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border-2)",
              color: "var(--text-2)",
            }}
          >
            <Sparkles size={12} style={{ color: "var(--accent)" }} />
            {MODELS.find((m) => m.id === model)?.name || model}
            <ChevronDown size={12} />
          </button>
          {showModelMenu && (
            <div
              className="absolute right-0 top-full mt-1 z-50 rounded-xl py-1 min-w-[160px] shadow-lg"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setModel(m.id);
                    setShowModelMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-body transition-colors"
                  style={{
                    color: m.id === model ? "var(--accent)" : "var(--text-2)",
                    background:
                      m.id === model ? "var(--accent-light)" : "transparent",
                    fontWeight: m.id === model ? 600 : 400,
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5 max-w-3xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 animate-fade-in">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
              }}
            >
              <MessageSquare size={30} />
            </div>
            <h2
              className="text-2xl font-display font-bold mb-2"
              style={{ color: "var(--text)" }}
            >
              Start a conversation
            </h2>
            <p className="text-sm max-w-xs" style={{ color: "var(--text-3)" }}>
              Type a message below to chat with{" "}
              <span style={{ color: "var(--accent)" }}>
                {MODELS.find((m) => m.id === model)?.name}
              </span>
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              isStreaming={
                isStreaming &&
                i === messages.length - 1 &&
                msg.role === "assistant"
              }
            />
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="border-t px-4 py-4"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div
          className="flex items-end gap-3 max-w-3xl mx-auto rounded-2xl px-4 py-3"
          style={{
            background: "var(--bg-2)",
            border: "1.5px solid var(--border-2)",
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed font-body"
            style={{
              color: "var(--text)",
              maxHeight: "160px",
              minHeight: "24px",
            }}
            placeholder="Message Promptica…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              background:
                input.trim() && !isStreaming ? "var(--accent)" : "var(--bg-3)",
              color: input.trim() && !isStreaming ? "white" : "var(--text-3)",
              transform:
                input.trim() && !isStreaming ? "scale(1.05)" : "scale(1)",
            }}
          >
            <Send size={15} />
          </button>
        </div>
        <p
          className="text-center text-xs mt-2"
          style={{ color: "var(--text-3)" }}
        >
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
