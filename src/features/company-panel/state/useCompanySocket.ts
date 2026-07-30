import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { type Appointment, type Service } from "@/types"
import { socket, connectSocket, disconnectSocket } from "@/socket"
import { notifyError, notifySuccess } from "@/utils/notifications"
import type { Action } from "./companyReducer"

export function useCompanySocket(
    token: string | null,
    companyId: string,
    dispatch: React.Dispatch<Action>
) {
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!token) return

        connectSocket(token)

        const invalidateHistory = () => {
            queryClient.invalidateQueries({ queryKey: ["company-history"] })
        }

        const handleServiceAdded = (service: Service) => {
            dispatch({ type: "ADD_SERVICE", payload: service })
        }

        const handleServiceDeleted = (serviceId: string) => {
            dispatch({ type: "DELETE_SERVICE", payload: serviceId })
        }

        const handleServiceUpdated = (service: Service) => {
            dispatch({ type: "UPDATE_SERVICES", payload: service })
        }

        const handleAppointmentAdded = (appointment: Appointment) => {
            notifySuccess(`${appointment.name} ${appointment.lastName} acaba de agendar un nuevo turno`, true)
            dispatch({ type: "ADD_APPOINTMENT", payload: appointment })
            invalidateHistory()
        }

        const handleAppointmentDeleted = (payload: { appointment: Appointment; service: Service; serviceId?: string }) => {
            notifyError(`${payload.appointment.name} ${payload.appointment.lastName} ha cancelado un turno`, true)
            dispatch({ type: "DELETE_APPOINTMENT_FROM_CANCEL", payload: { appointment: payload.appointment, service: payload.service } })
            invalidateHistory()
        }

        const handleAppointmentUpdated = (appointment: Appointment) => {
            dispatch({ type: "UPDATE_APPOINTMENTS", payload: appointment })
            invalidateHistory()
        }

        const handleAvailabilityUpdated = (data: { serviceId: string; availableAppointments: any[]; slots?: any[] }) => {
            dispatch({
                type: "UPDATE_SERVICE_AVAILABILITY",
                payload: {
                    serviceId: data.serviceId,
                    availableAppointments: data.availableAppointments,
                    slots: data.slots,
                }
            })
        }

        socket.on("company:service-added", handleServiceAdded)
        socket.on("company:service-deleted", handleServiceDeleted)
        socket.on("company:service-updated", handleServiceUpdated)
        socket.on("company:appointment-added", handleAppointmentAdded)
        socket.on("company:appointment-deleted", handleAppointmentDeleted)
        socket.on("company:appointment-updated", handleAppointmentUpdated)
        socket.on("company:availability-updated", handleAvailabilityUpdated)

        return () => {
            socket.off("company:service-added", handleServiceAdded)
            socket.off("company:service-deleted", handleServiceDeleted)
            socket.off("company:service-updated", handleServiceUpdated)
            socket.off("company:appointment-added", handleAppointmentAdded)
            socket.off("company:appointment-deleted", handleAppointmentDeleted)
            socket.off("company:appointment-updated", handleAppointmentUpdated)
            socket.off("company:availability-updated", handleAvailabilityUpdated)
            disconnectSocket()
        }
    }, [token, dispatch, queryClient])

    useEffect(() => {
        if (!token || !companyId) return

        const joinRoom = () => {
            socket.emit("joinCompany", companyId)
        }

        joinRoom()
        socket.on("connect", joinRoom)

        return () => {
            socket.off("connect", joinRoom)
        }
    }, [token, companyId])
}
