import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./AppLayout.css";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function open() {
    setSidebarOpen(true);
  }

  function close() {
    setSidebarOpen(false);
  }

  return (
    <div className="layout">
      {/* Topbar (sempre aparece) */}
      <header className="topbar">
        <button className="topbar__menuBtn" onClick={open} aria-label="Open menu">
          ☰
        </button>

        <div className="topbar__brand">AutoFlex</div>
      </header>

      {/* Backdrop (mobile only) */}
      <div className={`backdrop ${sidebarOpen ? "show" : ""}`} onClick={close} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar__header">
          <div className="sidebar__title">Menu</div>

          <button className="sidebar__closeBtn" onClick={close} aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="sidebar__nav" onClick={close}>
          <NavLink
            to="/raw-materials"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Raw Materials
          </NavLink>

          <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}>
            Products
          </NavLink>

          <NavLink
            to="/production"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Suggestion
          </NavLink>
        </nav>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}