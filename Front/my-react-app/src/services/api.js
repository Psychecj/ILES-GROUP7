// src/services/api.js
const BASE_URL = "http://127.0.0.1:8000";

// Token helpers
export const saveToken = (token) => localStorage.setItem("iles_token", token);
export const getToken = () => localStorage.getItem("iles_token");
export const saveUser = (user) => localStorage.setItem("iles_user", JSON.stringify(user));
export const getUser = () => JSON.parse(localStorage.getItem("iles_user") || "null");
export const logOut = () => {
  localStorage.removeItem("iles_token");
  localStorage.removeItem("iles_user");
};

// Core fetch wrapper
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: 'Bearer ${token}' } : {}),
    ...options.headers,
  };
  const response = await fetch('${BASE_URL}${path}', { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
}

// Auth
export async function loginUser({ email, password }) {
  return apiFetch("/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser({ username, email, password, confirmPassword, role }) {
  return apiFetch("/register/", {
    method: "POST",
    body: JSON.stringify({ username, email, password,
      confirm_password: confirmPassword, role }),
  });
}

export async function forgotPassword({ email, newPassword, confirmPassword }) {
  return apiFetch("/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email,
      new_password: newPassword,
      confirm_password: confirmPassword }),
  });
}

// Placements
export const getPlacements = () => apiFetch("/placements/");
export const getPlacement = (id) => apiFetch('/placements/${id}/');
export const createPlacement = (data) => apiFetch("/placements/", {
  method: "POST", body: JSON.stringify(data) });
export const updatePlacement = (id, data) => apiFetch('/placements/${id}/', {
  method: "PATCH", body: JSON.stringify(data) });

// Weekly Logs
export const getWeeklyLogs = () => apiFetch("/logs/");
export const getWeeklyLog = (id) => apiFetch('/logs/${id}/');
export const createWeeklyLog = (data) => apiFetch("/logs/", {
  method: "POST", body: JSON.stringify(data) });
export const updateWeeklyLog = (id, data) => apiFetch('/logs/${id}/', {
  method: "PATCH", body: JSON.stringify(data) });

// Evaluations
export const getEvaluations = () => apiFetch("/evaluations/");
export const createEvaluation = (data) => apiFetch("/evaluations/", {
  method: "POST", body: JSON.stringify(data) });

// Grades
export const getGrades = () => apiFetch("/grades/");