import {
    clearTokens,
    getAccessToken,
    isTokenExpired,
    refreshAccessToken,
} from "@/utils/tokenManager"

export interface HttpClientOptions extends Omit<RequestInit, "body"> {
    skipAuth?: boolean
    retryOnTokenExpired?: boolean
    body?: unknown
}

export interface HttpResult<T = unknown> {
    data?: T
    error?: string
    code?: string
    status?: number
}

/**
 * Cliente HTTP con refresh de token 401.
 * No es un React hook: usable desde api modules y TanStack Query.
 */
export async function httpClient<T = unknown>(
    url: string,
    options: HttpClientOptions = {}
): Promise<HttpResult<T>> {
    const {
        skipAuth = false,
        retryOnTokenExpired = true,
        body,
        headers: initHeaders,
        ...fetchOptions
    } = options

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(initHeaders as Record<string, string> | undefined),
    }

    if (!skipAuth) {
        const token = getAccessToken()
        if (token) headers.Authorization = `Bearer ${token}`
    }

    const buildInit = (hdrs: Record<string, string>): RequestInit => ({
        ...fetchOptions,
        headers: hdrs,
        body:
            body === undefined
                ? undefined
                : typeof body === "string"
                  ? body
                  : JSON.stringify(body),
    })

    try {
        const response = await fetch(url, buildInit(headers))
        const payload = await response.json().catch(() => ({}))

        if (response.ok) {
            return { data: payload as T, status: response.status }
        }

        if (
            response.status === 401 &&
            !skipAuth &&
            retryOnTokenExpired &&
            isTokenExpired(payload)
        ) {
            const newTokens = await refreshAccessToken()
            if (newTokens) {
                const retryHeaders = {
                    ...headers,
                    Authorization: `Bearer ${newTokens.access_token}`,
                }
                const retryResponse = await fetch(url, buildInit(retryHeaders))
                const retryPayload = await retryResponse.json().catch(() => ({}))
                if (retryResponse.ok) {
                    return { data: retryPayload as T, status: retryResponse.status }
                }
                return {
                    error:
                        (retryPayload as { error?: string }).error ||
                        "Error en la request",
                    code: (retryPayload as { code?: string }).code,
                    status: retryResponse.status,
                }
            }
            clearTokens()
            return {
                error: "Sesión expirada. Por favor, inicia sesión nuevamente.",
                code: "SESSION_EXPIRED",
                status: 401,
            }
        }

        return {
            error: (payload as { error?: string }).error || "Error en la request",
            code:
                (payload as { code?: string }).code || response.status.toString(),
            status: response.status,
        }
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Error de conexión"
        return { error: message }
    }
}

/** Desenvuelve `{ data: T }` del backend Bookify. */
export function unwrapData<T>(result: HttpResult<{ data: T }>): HttpResult<T> {
    if (result.error) return { error: result.error, code: result.code, status: result.status }
    return { data: result.data?.data, status: result.status }
}

export async function httpGet<T>(url: string, options?: HttpClientOptions) {
    return httpClient<T>(url, { ...options, method: "GET" })
}

export async function httpPost<T>(
    url: string,
    body?: unknown,
    options?: HttpClientOptions
) {
    return httpClient<T>(url, { ...options, method: "POST", body })
}

export async function httpPut<T>(
    url: string,
    body?: unknown,
    options?: HttpClientOptions
) {
    return httpClient<T>(url, { ...options, method: "PUT", body })
}

export async function httpDelete<T>(
    url: string,
    body?: unknown,
    options?: HttpClientOptions
) {
    return httpClient<T>(url, { ...options, method: "DELETE", body })
}
