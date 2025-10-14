import { BACKEND_API_URL } from "../config";

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
}

/**
 * Almacena los tokens en localStorage
 */
export const setTokens = (tokens: TokenResponse): void => {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
};

/**
 * Obtiene el access token del localStorage
 */
export const getAccessToken = (): string | null => {
    return localStorage.getItem("access_token");
};

/**
 * Obtiene el refresh token del localStorage
 */
export const getRefreshToken = (): string | null => {
    return localStorage.getItem("refresh_token");
};

/**
 * Limpia todos los tokens del localStorage
 */
export const clearTokens = (): void => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};

/**
 * Verifica si hay tokens válidos almacenados
 */
export const hasValidTokens = (): boolean => {
    return !!(getAccessToken() && getRefreshToken());
};

/**
 * Renueva el access token usando el refresh token
 */
export const refreshAccessToken = async (): Promise<TokenResponse | null> => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        console.warn("No hay refresh token disponible");
        return null;
    }

    try {
        const response = await fetch(`${BACKEND_API_URL}/companies/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-refresh-token": refreshToken,
            },
        });

        if (response.ok) {
            const data = await response.json();
            const tokens: TokenResponse = {
                access_token: data.data.access_token,
                refresh_token: data.data.refresh_token,
            };

            // Actualizar tokens en localStorage
            setTokens(tokens);

            return tokens;
        } else {
            console.error("Error al renovar token:", response.status);
            // Si falla el refresh, limpiar tokens
            clearTokens();
            return null;
        }
    } catch (error) {
        console.error("Error al renovar token:", error);
        clearTokens();
        return null;
    }
};

/**
 * Hace logout invalidando el refresh token en el servidor
 */
export const logout = async (): Promise<void> => {
    const accessToken = getAccessToken();

    if (accessToken) {
        try {
            await fetch(`${BACKEND_API_URL}/companies/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
        } catch (error) {
            console.error("Error al hacer logout:", error);
        }
    }

    // Limpiar tokens locales
    clearTokens();
};

/**
 * Verifica si una respuesta indica que el token ha expirado
 */
export const isTokenExpired = (response: any): boolean => {
    return response?.code === "TOKEN_EXPIRED" || response?.error === "Token expirado";
};
