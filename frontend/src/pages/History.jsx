import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MessageSquare,
  Trash2,
  Clock,
  Bot,
  ChevronRight,
  Plus,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

function timeAgo(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

const MODEL_LABELS = {
  "llama-3.3-70b-versatile": "Llama 3.3 70B",
  "llama-3.1-8b-instant": "Llama 3.1 8B",
  "mixtral-8x7b-32768": "Mixtral 8x7B",
};

export default function History() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API}/api/history`);
      setChats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(id);
    try {
      await axios.delete(`${API}/api/chat/${id}`);
      setChats((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-display font-bold"
            style={{ color: "var(--text)" }}
          >
            Chat History
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
            {chats.length} conversation{chats.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Link to="/chat" className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          New Chat
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="flex gap-2">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "var(--bg-3)", color: "var(--text-3)" }}
          >
            <Clock size={28} />
          </div>
          <h2
            className="text-xl font-display font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            No conversations yet
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
            Start a new chat and it will appear here.
          </p>
          <Link to="/chat" className="btn-primary flex items-center gap-2">
            <MessageSquare size={15} />
            Start Chatting
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {chats.map((chat, i) => (
            <Link
              key={chat._id}
              to={`/chat/${chat._id}`}
              className="card flex items-center gap-4 p-4 group transition-all duration-150 hover:shadow-md animate-slide-up"
              style={{
                animationDelay: `${i * 40}ms`,
                animationFillMode: "both",
                textDecoration: "none",
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                }}
              >
                <Bot size={18} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-display font-semibold text-sm truncate"
                  style={{ color: "var(--text)" }}
                >
                  {chat.title || "Untitled Chat"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--bg-3)",
                      color: "var(--text-3)",
                    }}
                  >
                    {MODEL_LABELS[chat.model] || chat.model}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>
                    {timeAgo(chat.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleDelete(e, chat._id)}
                  disabled={deleting === chat._id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: "var(--text-3)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ef4444")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-3)")
                  }
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={14} style={{ color: "var(--text-3)" }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
