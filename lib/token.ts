"use client";

import Cookies from "js-cookie";

const TOKEN_COOKIE_KEY = "device_token";

export function getDeviceToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE_KEY);
}

export function setDeviceToken(token: string): void {
  // Token valid for 30 days; adjust as needed
  Cookies.set(TOKEN_COOKIE_KEY, token, { expires: 30, sameSite: "lax" });
}

export function clearDeviceToken(): void {
  Cookies.remove(TOKEN_COOKIE_KEY);
}

export const tokenKey = TOKEN_COOKIE_KEY;

export function getCurrentUser() {
  const userData = localStorage.getItem("currentUser");
  return userData ? JSON.parse(userData) : null;
}
