import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon, MessageSquare, Clock, LogOut, LogIn, UserPlus, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <Sparkles size={16} color="white" />
          </div>
          <span
            className="text-xl font-display font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Promptica
          </span>
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? "active" : ""}`
                }
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline font-display font-medium text-sm">Chat</span>
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? "active" : ""}`
                }
              >
                <Clock size={16} />
                <span className="hidden sm:inline font-display font-medium text-sm">History</span>
              </NavLink>
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg ml-1"
                style={{ background: "var(--bg-3)", color: "var(--text-3)" }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {user.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-body" style={{ color: "var(--text-2)" }}>
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <button onClick={handleLogout} className="btn-ghost ml-1 flex items-center gap-1.5">
                <LogOut size={15} />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-ghost flex items-center gap-1.5">
                <LogIn size={15} />
                <span className="text-sm">Login</span>
              </NavLink>
              <NavLink to="/register" className="btn-primary flex items-center gap-1.5">
                <UserPlus size={15} />
                <span className="text-sm">Sign up</span>
              </NavLink>
            </>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="ml-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ background: "var(--bg-3)", color: "var(--text-2)" }}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
