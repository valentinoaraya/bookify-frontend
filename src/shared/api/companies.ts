import { BACKEND_API_URL } from "@/config"
import type { Company, CompanyToUser } from "@/types"
import { httpGet, httpPost, httpPut, unwrapData } from "./httpClient"

type ApiEnvelope<T> = { data: T }

export async function loginCompany(body: { email: string; password: string }) {
    return httpPost<
        ApiEnvelope<{ access_token: string; refresh_token: string }>
    >(`${BACKEND_API_URL}/companies/login`, body, { skipAuth: true })
}

export async function loginUser(body: { email: string; password: string }) {
    return httpPost<
        ApiEnvelope<{ access_token: string; refresh_token: string }>
    >(`${BACKEND_API_URL}/users/login`, body, { skipAuth: true })
}

export async function registerCompany(body: Record<string, unknown>) {
    return httpPost<
        ApiEnvelope<{
            access_token: string
            refresh_token: string
            init_point: string
        }>
    >(`${BACKEND_API_URL}/companies/register`, body, { skipAuth: true })
}

export async function getCompany() {
    const result = await httpGet<ApiEnvelope<Company>>(
        `${BACKEND_API_URL}/companies/get-company`
    )
    return unwrapData(result)
}

export async function getPublicCompany(companyId: string) {
    const result = await httpGet<ApiEnvelope<CompanyToUser>>(
        `${BACKEND_API_URL}/companies/company/${companyId}`,
        { skipAuth: true }
    )
    return unwrapData(result)
}

export async function updateCompany(body: Partial<Company> | Record<string, unknown>) {
    return httpPut<ApiEnvelope<Company>>(
        `${BACKEND_API_URL}/companies/update-company`,
        body
    )
}
