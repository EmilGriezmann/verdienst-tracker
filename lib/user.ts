"use client";

// Einfaches "Login": der gewählte Name wird im Browser (localStorage) gespeichert.
const KEY = "verdienste_user";

export function getUser(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setUser(name: string) {
  window.localStorage.setItem(KEY, name);
}

export function clearUser() {
  window.localStorage.removeItem(KEY);
}
