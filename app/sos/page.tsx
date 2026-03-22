"use client";

import { useState, useEffect } from "react";

export default function SOS() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem("userId");

    if (!id) {
      id = "user123"; // 🔥 FIXED (use same everywhere)
      localStorage.setItem("userId", id);
    }

    setUserId(id);
  }, []);

  const handleSOS = () => {
    if (loading) return;

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    if (!userId) {
      alert("User not ready");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch("/api/sos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              lat: latitude,
              lng: longitude,
            }),
          });

          const data = await res.json();

          console.log("SOS RESPONSE:", data);

          if (data.success) {
            alert("🚨 SOS Sent Successfully!");
          } else {
            alert("❌ " + data.error);
          }
        } catch (error) {
          console.error(error);
          alert("❌ Network error");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.log("LOCATION ERROR FULL:", err); // 👈 THIS LINE ADDED
        alert("❌ Location error: " + err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
      <button
        onClick={handleSOS}
        disabled={loading}
        className={`text-white text-2xl px-10 py-5 rounded-full ${
          loading
            ? "bg-gray-500"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading ? "Sending..." : "🚨 SEND SOS"}
      </button>
    </div>
  );
}