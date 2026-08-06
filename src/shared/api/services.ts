import { BACKEND_API_URL } from "@/config"
import type { AvailableAppointment, Service } from "@/types"
import { httpDelete, httpGet, httpPost, httpPut, unwrapData } from "./httpClient"

type ApiEnvelope<T> = { data: T }

export async function createService(body: Record<string, unknown>) {
    return httpPost<ApiEnvelope<Service>>(
        `${BACKEND_API_URL}/services/create-service`,
        body
    )
}

export async function editService(id: string, body: Record<string, unknown>) {
    return httpPut<ApiEnvelope<Service>>(
        `${BACKEND_API_URL}/services/edit-service/${id}`,
        body
    )
}

export async function deleteService(id: string) {
    return httpDelete<ApiEnvelope<unknown>>(
        `${BACKEND_API_URL}/services/delete-service/${id}`,
        {}
    )
}

export async function getService(id: string) {
    const result = await httpGet<ApiEnvelope<Service>>(
        `${BACKEND_API_URL}/services/${id}`,
        { skipAuth: true }
    )
    return unwrapData(result)
}

export async function getContainsSignPrice(serviceId: string) {
    const result = await httpGet<ApiEnvelope<{ contains: boolean }>>(
        `${BACKEND_API_URL}/services/contains-sign-price/${serviceId}`,
        { skipAuth: true }
    )
    return unwrapData(result)
}

export async function enableAppointments(
    serviceId: string,
    body: Record<string, unknown>
) {
    return httpPost<ApiEnvelope<Service>>(
        `${BACKEND_API_URL}/services/enable-appointments/${serviceId}`,
        body
    )
}

type ServiceSlotMutation = {
    appointment: AvailableAppointment
    service: Service
}

export async function deleteServiceAppointment(
    serviceId: string,
    body: Record<string, unknown>
) {
    return httpDelete<ApiEnvelope<ServiceSlotMutation>>(
        `${BACKEND_API_URL}/services/delete-appointment/${serviceId}`,
        body
    )
}

export async function addEnableAppointment(
    serviceId: string,
    body: Record<string, unknown>
) {
    return httpPost<ApiEnvelope<ServiceSlotMutation>>(
        `${BACKEND_API_URL}/services/add-enable-appointment/${serviceId}`,
        body
    )
}

export async function updateWorkSchedule(
    serviceId: string,
    body: {
        workSchedule: {
            days: number[]
            blocks: { start: string; end: string }[]
            turnIntervalMinutes: number
            graceMinutes: number
        }
        autoGenerateSlots: boolean
    }
) {
    return httpPut<ApiEnvelope<Service>>(
        `${BACKEND_API_URL}/services/${serviceId}/work-schedule`,
        body
    )
}

export async function syncWorkSchedule(serviceId: string) {
    return httpPost<ApiEnvelope<Service>>(
        `${BACKEND_API_URL}/services/${serviceId}/work-schedule/sync`,
        {}
    )
}

export async function clearAvailableSlotsByDatetimes(
    serviceId: string,
    datetimes: string[]
) {
    return httpDelete<
        ApiEnvelope<{
            service: Service
            summary: {
                requested: number
                deleted: number
                trimmed: number
                keptWithHolds: number
                notFound: number
            }
        }>
    >(`${BACKEND_API_URL}/services/${serviceId}/available-slots`, {
        datetimes,
    })
}
