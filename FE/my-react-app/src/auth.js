// src/auth.js - 레거시 파일, config/api.js 사용 권장
import { API_ENDPOINTS, apiFetch } from "./config/api";

export async function login(username, password) {
    return await apiFetch(API_ENDPOINTS.login, {
        method: "POST",
        body: JSON.stringify({ email: username, password }),
    });
}

export async function register(username, password, email) {
    return await apiFetch(API_ENDPOINTS.signup, {
        method: "POST",
        body: JSON.stringify({ email: email || username, password }),
    });
}

export function saveToken(token) {
    localStorage.setItem("access_token", token);
}

export function getToken() {
    return localStorage.getItem("access_token");
}
