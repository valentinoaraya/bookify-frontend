import { BACKEND_API_URL } from "@/config"
import { httpGet, httpPost } from "./httpClient"

type ApiEnvelope<T> = { data: T }

export async function createPreference(
    companyId: string,
    body: Record<string, unknown>
) {
    return httpPost<ApiEnvelope<{ init_point?: string; id?: string }>>(
        `${BACKEND_API_URL}/mercadopago/create-preference/${companyId}`,
        body,
        { skipAuth: true }
    )
}

export async function generateOAuthUrl(companyId: string) {
    return httpGet<ApiEnvelope<{ url?: string } | string>>(
        `${BACKEND_API_URL}/mercadopago/oauth/generate-url/${companyId}`
    )
}
