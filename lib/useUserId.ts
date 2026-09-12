"use client";

import { useState } from "react";

const STORAGE_KEY = "userId";
const DEFAULT_USER_ID = "user123";

function readOrInitUserId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = DEFAULT_USER_ID; // same identity model used across the app
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/**
 * Returns the app's simple localStorage-backed userId, initializing it on
 * first use. Uses a lazy useState initializer (rather than an effect) so the
 * value is available on first render without a setState-in-effect pattern.
 */
export function useUserId(): string {
  const [userId] = useState(readOrInitUserId);
  return userId;
}
