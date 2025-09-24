"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { setDeviceToken } from "@/lib/token";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

type LoginResponse = {
  data?: {
    device_token?: string;
  };
  device_token?: string; // in case API returns top-level
};




export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  console.log(error);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Ensure a non-empty device identifier for backend validation
      const imeiKey = "web_device_imei";
      let imei = "";
      try {
        imei = localStorage.getItem(imeiKey) || "";
        if (!imei) {
          imei = `web-${Math.random().toString(36).slice(2, 10)}`;
          localStorage.setItem(imeiKey, imei);
        }
      } catch {}

      const payload = {
        username,
        password,
        device: {
          info: "web",
          type: "browser",
          imei,
          name: navigator.userAgent,
          app_version: "1.0.0",
        },
      };
      const res = await api.post<LoginResponse>("/v1/admins/login", payload);
      const token = res.data?.device_token ?? res.data?.data?.device_token;
      if (!token) {
        throw new Error("device_token topilmadi");
      }
      setDeviceToken(token);
      toast.success("Muvaffaqiyatli kirildi");
      const redirect = searchParams.get("redirect") || "/companies";
      router.replace(redirect);
    } catch (err: any) {
      const server = err?.response?.data;
      console.error("Login error:", server || err);
      let message = "Xatolik";
      if (typeof server === "string") message = server;
      else if (server?.message) message = server.message;
      else if (server?.error) message = server.error;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", padding: 24 }}>
      <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="mx-auto" />
      <h1
        className="text-center"
        style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}
      >
        Hoomo retailer
      </h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="admin"
            name="username"
            autoComplete="username"
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              name="password"
              autoComplete="current-password"
              style={{
                padding: "10px 40px 10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                width: "100%",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"
              }
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: 0,
                padding: 4,
                cursor: "pointer",
                color: "#374151",
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 12px",
            border: 0,
            background: "#111827",
            color: "#fff",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Kutilmoqda..." : "Kirish"}
        </button>
        {/* {error && <p style={{ color: "#b91c1c", marginTop: 4 }}>{error}</p>} */}
      </form>
    </div>
  );
}
