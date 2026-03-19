import { Link } from "react-router-dom";
import { Sparkles, MessageSquare, Clock, Shield, Zap, Bot } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: Zap,
    title: "Streaming Responses",
    desc: "Watch answers appear in real-time as the AI generates them — no waiting.",
  },
  {
    icon: Clock,
    title: "Full Chat History",
    desc: "Every conversation is saved to your account. Resume any chat instantly.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "JWT auth, hashed passwords, your chats belong only to you.",
  },
  {
    icon: Bot,
    title: "Multiple GPT Models",
    desc: "Choose from GPT-4o, GPT-4o Mini, or GPT-3.5 Turbo for any task.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 animate-fade-in relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(14,165,233,0.12) 0%, transparent 70%)",
          }}
        />

        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-display font-semibold mb-8 border"
          style={{
            background: "var(--accent-light)",
            color: "var(--accent)",
            borderColor: "var(--accent)",
            borderOpacity: 0.3,
          }}
        >
          <Sparkles size={12} />
          Powered by OpenAI GPT
        </div>

        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold leading-tight mb-6 tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Chat smarter
          <br />
          <span style={{ color: "var(--accent)" }}>with AI.</span>
        </h1>

        <p
          className="text-lg sm:text-xl max-w-xl mb-10 font-body leading-relaxed"
          style={{ color: "var(--text-2)" }}
        >
          Promptica is a full-stack AI chat app with real-time streaming, persistent
          history, and multi-model support. Start a conversation now.
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          {user ? (
            <Link to="/chat" className="btn-primary flex items-center gap-2 text-base px-7 py-3">
              <MessageSquare size={18} />
              Open Chat
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-7 py-3">
                <Sparkles size={18} />
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-7 py-3 rounded-xl text-base font-display font-semibold border transition-all duration-200"
                style={{
                  borderColor: "var(--border-2)",
                  color: "var(--text-2)",
                  background: "var(--surface)",
                }}
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="card p-6 flex gap-4 items-start animate-slide-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--accent-light)", color: "var(--accent)" }}
              >
                <Icon size={20} />
              </div>
              <div>
                <h3
                  className="font-display font-bold text-base mb-1"
                  style={{ color: "var(--text)" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
