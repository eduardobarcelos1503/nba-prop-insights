/**
 * Configuração de ambiente.
 * VITE_API_BASE_URL  -> URL base do backend (ex.: https://api.meudominio.com)
 * VITE_DEMO_MODE     -> "true" ativa o modo de demonstração (camada de mock)
 */
export const API_BASE_URL = (import.meta.env["VITE_API_BASE_URL"] ?? "").replace(/\/$/, "");

export const DEMO_MODE =
  String(import.meta.env["VITE_DEMO_MODE"] ?? "").toLowerCase() === "true" || API_BASE_URL === "";
