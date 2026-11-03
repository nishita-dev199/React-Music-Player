import React from "react";
import Home from "./Sceens/home";
import { MusicProvider } from "./Shared/MusicContext";
import "./index.css";

export default function App() {
  return (
    <MusicProvider>
      <Home />
    </MusicProvider>
  );
}
