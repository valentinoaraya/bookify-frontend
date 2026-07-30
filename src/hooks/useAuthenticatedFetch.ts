import { useState, useCallback } from "react"
import {
    httpClient,
    type HttpClientOptions,
    type HttpResult,
} from "@/shared/api/httpClient"

/**
 * Thin React wrapper around httpClient for components that still need
 * isLoading/error state. Prefer feature hooks + TanStack Query for new code.
 */
export const useAuthenticatedFetch = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchWithAuth = useCallback(
        async <T = unknown>(
            url: string,
            options: HttpClientOptions = {}
        ): Promise<HttpResult<T>> => {
            setIsLoading(true)
            setError(null)
            try {
                const result = await httpClient<T>(url, options)
                if (result.error) setError(result.error)
                return result
            } finally {
                setIsLoading(false)
            }
        },
        []
    )

    return { isLoading, error, fetchWithAuth }
}

export const useAuthenticatedGet = () => {
    const { isLoading, error, fetchWithAuth } = useAuthenticatedFetch()
    const get = useCallback(
        async <T = unknown>(url: string, options: HttpClientOptions = {}) =>
            fetchWithAuth<T>(url, { method: "GET", ...options }),
        [fetchWithAuth]
    )
    return { isLoading, error, get }
}

export const useAuthenticatedPost = () => {
    const { isLoading, error, fetchWithAuth } = useAuthenticatedFetch()
    const post = useCallback(
        async <T = unknown>(
            url: string,
            body: unknown,
            options: HttpClientOptions = {}
        ) => fetchWithAuth<T>(url, { method: "POST", body, ...options }),
        [fetchWithAuth]
    )
    return { isLoading, error, post }
}

export const useAuthenticatedPut = () => {
    const { isLoading, error, fetchWithAuth } = useAuthenticatedFetch()
    const put = useCallback(
        async <T = unknown>(
            url: string,
            body: unknown,
            options: HttpClientOptions = {}
        ) => fetchWithAuth<T>(url, { method: "PUT", body, ...options }),
        [fetchWithAuth]
    )
    return { isLoading, error, put }
}

export const useAuthenticatedDelete = () => {
    const { isLoading, error, fetchWithAuth } = useAuthenticatedFetch()
    const del = useCallback(
        async <T = unknown>(
            url: string,
            body: unknown,
            options: HttpClientOptions = {}
        ) => fetchWithAuth<T>(url, { method: "DELETE", body, ...options }),
        [fetchWithAuth]
    )
    return { isLoading, error, delete: del }
}
