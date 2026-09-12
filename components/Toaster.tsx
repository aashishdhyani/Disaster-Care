"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "rgb(15 23 42)",
          color: "#fff",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          padding: "0.65rem 1rem",
        },
        success: {
          iconTheme: { primary: "#16a34a", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
}
