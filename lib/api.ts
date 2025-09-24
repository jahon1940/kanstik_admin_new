"use client";

import axios from "axios";
import { getDeviceToken, clearDeviceToken } from "./token";

export const BASE_URL = "https://kanstik.retailer.hoomo.uz";

export const api = axios.create({
	baseURL: BASE_URL,
     withCredentials: true,
  timeout: 10000,
});

// Attach Authorization header if device_token exists
api.interceptors.request.use((config) => {
	const token = getDeviceToken();
	if (token) {
		config.headers = {
			...config.headers,
            Authorization: `Bearer ${token}`,
            "Device-Token": token,
		};
	}
	return config;
});

// Auto-handle 401: clear token and redirect to /login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            try {
                clearDeviceToken();
                if (typeof window !== "undefined") {
                    const current = window.location.pathname + window.location.search;
                    const redirectUrl = `/login?redirect=${encodeURIComponent(current)}`;
                    window.location.replace(redirectUrl);
                }
            } catch {}
        }
        return Promise.reject(error);
    }
);


