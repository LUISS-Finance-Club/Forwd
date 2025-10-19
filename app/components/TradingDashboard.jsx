"use client";
import { useState } from "react";
import LiveOddsFeed from "./LiveOddsFeed";
import LockForward from "./LockForward";

export default function TradingDashboard() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "20px", height: "100vh", padding: "20px" }}>
      {/* LEFT: Live Feed */}
      <div style={{ overflowY: "auto" }}>
        <LiveOddsFeed />
      </div>

      {/* RIGHT: Lock Interface */}
      <div style={{ overflowY: "auto" }}>
        <LockForward />
      </div>
    </div>
  );
}
