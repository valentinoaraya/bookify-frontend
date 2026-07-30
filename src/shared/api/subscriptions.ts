import { BACKEND_API_URL } from "@/config"
import { httpDelete, httpPost } from "./httpClient"

type ApiEnvelope<T> = { data: T }

export async function resumeSubscription(body: { payer_email?: string }) {
    return httpPost<ApiEnvelope<{ init_point?: string }>>(
        `${BACKEND_API_URL}/suscriptions/resume`,
        body
    )
}

export async function resumeUpgrade(body: { payer_email?: string }) {
    return httpPost<ApiEnvelope<{ init_point?: string }>>(
        `${BACKEND_API_URL}/suscriptions/resume-upgrade`,
        body
    )
}

export async function abortUpgrade() {
    return httpPost<ApiEnvelope<unknown>>(
        `${BACKEND_API_URL}/suscriptions/abort-upgrade`,
        {}
    )
}

export async function changeSubscriptionPlan(
    changeType: string,
    preapprovalId: string,
    body: Record<string, unknown>
) {
    return httpPost<ApiEnvelope<{ init_point?: string } | string>>(
        `${BACKEND_API_URL}/suscriptions/${changeType}/${preapprovalId}`,
        body
    )
}

export async function cancelSubscription(
    preapprovalId: string,
    body?: { companyId?: string }
) {
    return httpDelete<ApiEnvelope<unknown>>(
        `${BACKEND_API_URL}/suscriptions/cancel/${preapprovalId}`,
        body ?? {}
    )
}
