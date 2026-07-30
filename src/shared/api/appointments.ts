import { BACKEND_API_URL } from "@/config"
import type { Appointment, Service } from "@/types"
import { httpDelete, httpGet, httpPost, httpPut, unwrapData } from "./httpClient"

type ApiEnvelope<T> = { data: T }

export interface HistoryQuery {
    page?: number
    limit?: number
    q?: string
    serviceId?: string
    from?: string
    to?: string
    pendingOnly?: boolean
}

export interface HistoryResponse {
    appointments: Appointment[]
    hasMore: boolean
    statistics?: {
        totalAppointments: number
        mostPopularService: string
        totalIncome: number
        finishedAppointmentsPercentage: number
    }
    pendingAppointments?: Appointment[]
}

export async function addAppointment(body: Record<string, unknown>) {
    return httpPost<ApiEnvelope<unknown>>(
        `${BACKEND_API_URL}/appointments/add-appointment`,
        body,
        { skipAuth: true }
    )
}

export async function checkBookingHour(body: Record<string, unknown>) {
    return httpPost<ApiEnvelope<unknown>>(
        `${BACKEND_API_URL}/appointments/check-booking-hour`,
        body,
        { skipAuth: true }
    )
}

export async function getAppointmentByRef(appointmentRef: string) {
    const result = await httpGet<ApiEnvelope<Appointment>>(
        `${BACKEND_API_URL}/appointments/get-appointment/${appointmentRef}`,
        { skipAuth: true }
    )
    return unwrapData(result)
}

export async function cancelAppointmentByRef(
    appointmentRef: string,
    body?: { dataUser?: { email?: string } }
) {
    return httpDelete<ApiEnvelope<unknown>>(
        `${BACKEND_API_URL}/appointments/cancel-appointment/${appointmentRef}`,
        body ?? {},
        { skipAuth: true }
    )
}

export async function deleteAppointment(id: string) {
    return httpDelete<
        ApiEnvelope<{ appointment: Appointment; service: Service }>
    >(`${BACKEND_API_URL}/appointments/delete-appointment/${id}`, {})
}

export async function finishAppointment(id: string) {
    return httpPut<ApiEnvelope<unknown>>(
        `${BACKEND_API_URL}/appointments/finish-appointment/${id}`,
        {}
    )
}

export async function changeAppointmentStatus(body: {
    appointmentId: string
    status: string
}) {
    return httpPut<ApiEnvelope<unknown>>(
        `${BACKEND_API_URL}/appointments/change-status`,
        body
    )
}

export async function getCompanyHistory(
    companyId: string,
    query: HistoryQuery = {}
) {
    const params = new URLSearchParams()
    if (query.page != null) params.set("page", String(query.page))
    if (query.limit != null) params.set("limit", String(query.limit))
    if (query.q) params.set("q", query.q)
    if (query.serviceId && query.serviceId !== "all")
        params.set("serviceId", query.serviceId)
    if (query.from) params.set("from", query.from)
    if (query.to) params.set("to", query.to)
    if (query.pendingOnly) params.set("pendingOnly", "true")

    const qs = params.toString()
    const url = `${BACKEND_API_URL}/appointments/company-history/${companyId}${qs ? `?${qs}` : ""}`
    return httpGet<ApiEnvelope<HistoryResponse> | HistoryResponse>(url)
}
