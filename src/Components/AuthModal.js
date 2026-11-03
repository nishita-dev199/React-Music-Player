import React, { useState } from "react";

/* ── Google G logo ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const EyeIcon = ({ show }) => show ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function AuthModal({ mode, onClose, onSwitch, onSuccess, addToast }) {
  const [form, setForm]         = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const isLogin = mode === "login";

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.email.includes("@")) {
      addToast("Please enter a valid email.", "error");
      return false;
    }
    if (form.password.length < 6) {
      addToast("Password must be at least 6 characters.", "error");
      return false;
    }
    if (!isLogin && !form.name.trim()) {
      addToast("Please enter your name.", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ name: form.name || form.email.split("@")[0], email: form.email });
      addToast(isLogin ? "Welcome back! 🎵" : "Account created! Welcome 🎉", "success");
      onClose();
    }, 1000);
  };

  const handleGoogle = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ name: "Google User", email: "user@gmail.com", avatar: null });
      addToast("Signed in with Google 🎵", "success");
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-all"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-[#103d44] border border-white/20 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl backdrop-blur-2xl text-white">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2d8a95] to-[#e8412b] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(232,65,43,0.5)] text-xl border border-white/20">
            🎵
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            {isLogin ? "Sign in to access your music world" : "Join BeatWave to stream in studio quality"}
          </p>
        </div>

        {/* Google Continue */}
        <button
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-black rounded-xl hover:bg-gray-100 font-extrabold text-sm transition-all disabled:opacity-50 shadow-md"
          onClick={handleGoogle}
          disabled={loading}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-5 gap-3">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-xs text-white/60 uppercase tracking-wider font-bold">or</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-white/90 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-black/30 border border-white/20 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-white/90 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="alex@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-black/30 border border-white/20 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/90 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                value={form.password}
                onChange={handleChange}
                className="w-full bg-black/30 border border-white/20 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-white/50 outline-none transition-all"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                onClick={() => setShowPass((s) => !s)}
              >
                <EyeIcon show={showPass} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-[#e8412b] hover:bg-[#d93822] text-white font-black py-3 rounded-xl shadow-[0_0_20px_rgba(232,65,43,0.5)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm border border-white/20"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Switch Mode */}
        <p className="text-white/80 text-xs text-center mt-5">
          {isLogin ? "Don't have an account yet? " : "Already have an account? "}
          <button
            onClick={onSwitch}
            className="text-white font-extrabold underline underline-offset-2 ml-1"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
}
