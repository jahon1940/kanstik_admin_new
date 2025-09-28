"use client";

import React, { useState } from "react";
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
  const [rememberMe, setRememberMe] = useState(false);

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
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: any } };
        const server = axiosError.response?.data;
        console.error("Login error:", server || err);

        let message = "Xatolik";
        if (typeof server === "string") message = server;
        else if (server?.message) message = server.message;
        else if (server?.error) message = server.error;

        setError(message);
        toast.error(message);
      } else {
        console.error("Noma'lum xato:", err);
        setError("Noma'lum xato");
        toast.error("Noma'lum xato");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-3 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block">
              <span className="text-3xl font-bold text-gray-900">
                Kanstik Admin Retailer
              </span>
              <div className="h-1 w-8 bg-blue-600 mx-auto mt-1"></div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать!
            </h1>
            <p className="text-gray-500 text-lg">
              Давайте вернемся к вашим делам!
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Логин
              </label>
              <input
                id="email"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Логин..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 "
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? "Вход в систему..." : "Вход"}
            </button>

            {/* Divider */}
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  or sign in with
                </span>
              </div>
            </div> */}

            {/* Google Sign In */}
            {/* <button
              type="button"
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button> */}

            {/* Sign Up Link */}
            {/* <div className="text-center">
              <span className="text-gray-500">
                Don&apos;t have an account?{" "}
              </span>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up
              </a>
            </div> */}
          </form>
        </div>
      </div>

      {/* Right Side - Dashboard Preview */}
      <div className="flex-2 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
        {/* Content */}
        <div
          className="relative z-10  h-full p-12 px-20"
          style={{
            backgroundImage: "url('/images/login_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <h2 className="text-4xl font-bold  text-white mb-8 text-left">
            Управляйте продажами стильно!
          </h2>
          <Image
            width={500}
            height={500}
            className="object-contain absolute bottom-0 right-0"
            src="/images/login_img.png"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}
