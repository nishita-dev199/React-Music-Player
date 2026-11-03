import React, { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import Header from "./Header";
import AuthModal from "./AuthModal";
import ToastContainer from "./Toast";

let _toastId = 0;

export default function Layout({ children }) {
  const [user, setUser]         = useState(null);
  const [authMode, setAuthMode] = useState(null); // 'login' | 'signup' | null
  const [toasts, setToasts]     = useState([]);
  const location = useLocation();

  const isHome = location.pathname === "/" || location.pathname === "/player";
  const isDiscover = location.pathname === "/feed" || location.pathname === "/discover";

  /* ── Toast helpers ── */
  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = ++_toastId;
    setToasts((t) => [...t, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  /* ── Auth handlers ── */
  const handleSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    addToast("You've been signed out.", "info");
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#103e45] text-white relative">
      {/* Top Header */}
      <Header
        user={user}
        onLogin={() => setAuthMode("login")}
        onSignup={() => setAuthMode("signup")}
        onLogout={handleLogout}
      />

      {/* Floating Center-Left Vertical Side Panel */}
      <Navigation />

      {/* Main Content Area: Non-scrollable on Home, edge-to-edge scrollable on Discover, standard on other pages */}
      <main
        className={`flex-1 relative z-10 ${
          isHome
            ? "p-0 w-full h-full overflow-hidden"
            : isDiscover
            ? "p-0 w-full overflow-y-scroll overflow-x-hidden"
            : "overflow-y-auto px-4 md:pl-28 md:pr-8 pt-4 pb-24 md:py-6"
        }`}
      >
        {children}
      </main>

      {/* Auth Modal */}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={() => setAuthMode((m) => (m === "login" ? "signup" : "login"))}
          onSuccess={handleSuccess}
          addToast={addToast}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
