import { useState, useCallback } from "react";
import { getAccessToken, refreshAccessToken, isTokenExpired, clearTokens } from "../utils/tokenManager";

interface FetchOptions extends RequestInit {
    skipAuth?: boolean; // Para requests que no necesitan autenticación
    retryOnTokenExpired?: boolean; // Para controlar si reintentar automáticamente
}

interface FetchResponse<T = any> {
    data?: T;
    error?: string;
    code?: string;
}

export const useAuthenticatedFetch = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWithAuth = useCallback(async <T = any>(
        url: string,
        options: FetchOptions = {}
    ): Promise<FetchResponse<T>> => {
        const { skipAuth = false, retryOnTokenExpired = true, ...fetchOptions } = options;

        setIsLoading(true);
        setError(null);

        try {
            // Preparar headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(fetchOptions.headers as Record<string, string>),
            };

            // Agregar token de autenticación si no se omite
            if (!skipAuth) {
                const token = getAccessToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            // Hacer la request
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
            });

            const data = await response.json();

            // Si la respuesta es exitosa, devolver los datos
            if (response.ok) {
                return { data };
            }

            // Si el token expiró y podemos reintentar
            if (response.status === 401 && !skipAuth && retryOnTokenExpired && isTokenExpired(data)) {
                console.log("Token expirado, intentando renovar...");

                // Intentar renovar el token
                const newTokens = await refreshAccessToken();

                if (newTokens) {
                    console.log("Token renovado exitosamente, reintentando request...");

                    // Reintentar la request con el nuevo token
                    const retryHeaders: Record<string, string> = {
                        ...headers,
                        'Authorization': `Bearer ${newTokens.access_token}`,
                    };

                    const retryResponse = await fetch(url, {
                        ...fetchOptions,
                        headers: retryHeaders,
                    });

                    const retryData = await retryResponse.json();

                    if (retryResponse.ok) {
                        return { data: retryData };
                    } else {
                        return { error: retryData.error || "Error en la request", code: retryData.code };
                    }
                } else {
                    // Si no se pudo renovar el token, limpiar y devolver error
                    clearTokens();
                    return {
                        error: "Sesión expirada. Por favor, inicia sesión nuevamente.",
                        code: "SESSION_EXPIRED"
                    };
                }
            }

            // Para otros errores, devolver el error directamente
            return {
                error: data.error || "Error en la request",
                code: data.code || response.status.toString()
            };

        } catch (error: any) {
            const errorMessage = error.message || "Error de conexión";
            setError(errorMessage);
            return { error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        fetchWithAuth,
    };
};

// Hook especializado para requests GET
export const useAuthenticatedGet = () => {
    const { isLoading, error, fetchWithAuth } = useAuthenticatedFetch();

    const get = useCallback(async <T = any>(url: string, options: FetchOptions = {}) => {
        return fetchWithAuth<T>(url, {
            method: 'GET',
            ...options,
        });
    }, [fetchWithAuth]);

    return {
        isLoading,
        error,
        get,
    };
};

// Hook especializado para requests POST
export const useAuthenticatedPost = () => {
    const { isLoading, error, fetchWithAuth } = useAuthenticatedFetch();

    const post = useCallback(async <T = any>(url: string, body: any, options: FetchOptions = {}) => {
        return fetchWithAuth<T>(url, {
            method: 'POST',
            body: JSON.stringify(body),
            ...options,
        });
    }, [fetchWithAuth]);

    return {
        isLoading,
        error,
        post,
    };
};

// Hook especializado para requests PUT
export const useAuthenticatedPut = () => {
    const { isLoading, error, fetchWithAuth } = useAuthenticatedFetch();

    const put = useCallback(async <T = any>(url: string, body: any, options: FetchOptions = {}) => {
        return fetchWithAuth<T>(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            ...options,
        });
    }, [fetchWithAuth]);

    return {
        isLoading,
        error,
        put,
    };
};

// Hook especializado para requests DELETE
export const useAuthenticatedDelete = () => {
    const { isLoading, error, fetchWithAuth } = useAuthenticatedFetch();

    const del = useCallback(async <T = any>(url: string, body: any, options: FetchOptions = {}) => {
        return fetchWithAuth<T>(url, {
            method: 'DELETE',
            body: JSON.stringify(body),
            ...options,
        });
    }, [fetchWithAuth]);

    return {
        isLoading,
        error,
        delete: del,
    };
};
