import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { getContainsSignPrice, getService } from "@/shared/api/services"
import { addAppointment, checkBookingHour } from "@/shared/api/appointments"
import { notifyError } from "@/utils/notifications"
import { confirmDelete } from "@/utils/alerts"
import { parseDateToString } from "@/utils/parseDateToString"
import { formatDate } from "@/utils/formatDate"
import type { ServiceToSchedule, UserData } from "@/types"

interface UseBookAppointmentOptions {
    cancellationAnticipationHours: number
    onScheduled: () => void
}

async function fetchServiceToSchedule(serviceId: string): Promise<ServiceToSchedule> {
    const response = await getService(serviceId)
    if (response.error || !response.data) {
        throw new Error(response.error || "Error al obtener el servicio.")
    }
    return response.data
}

export function useBookAppointment(
    serviceId: string,
    { cancellationAnticipationHours, onScheduled }: UseBookAppointmentOptions
) {
    const navigate = useNavigate()
    const [isScheduling, setIsScheduling] = useState(false)
    const [isLoadingConfirm, setIsLoadingConfirm] = useState(false)

    const serviceQuery = useQuery({
        queryKey: ["service-to-schedule", serviceId],
        queryFn: () => fetchServiceToSchedule(serviceId),
        retry: false,
    })

    useEffect(() => {
        if (serviceQuery.isError) {
            notifyError("Error al obtener el servicio. Inténtelo de nuevo más tarde.")
        }
    }, [serviceQuery.isError])

    const checkHourMutation = useMutation({
        mutationFn: async (params: { companyId: string; date: Date }) => {
            const response = await checkBookingHour({
                companyId: params.companyId,
                date: params.date,
            })
            if (response.error) throw new Error(response.error)
            return response.data
        },
        onError: (err: Error) => notifyError(err.message, true),
    })

    const checkOrderHour = async (
        companyId: string,
        datetime: string
    ): Promise<boolean> => {
        try {
            await checkHourMutation.mutateAsync({ companyId, date: new Date(datetime) })
            return true
        } catch {
            return false
        }
    }

    const confirmAppointment = async (
        serviceData: ServiceToSchedule,
        date: Date,
        dataUser: UserData
    ) => {
        const { stringDate, time } = parseDateToString(date)
        const formattedDate = formatDate(stringDate)

        let messageHours = ""
        if (cancellationAnticipationHours > 24) {
            messageHours = `${cancellationAnticipationHours / 24} ${cancellationAnticipationHours / 24 === 1 ? "día" : "días"}`
        } else {
            messageHours = `${cancellationAnticipationHours} ${cancellationAnticipationHours === 1 ? "hora" : "horas"}`
        }

        const decisionConfirmed = await confirmDelete({
            question: `¿Desea reservar un turno para ${serviceData.title} el día ${formattedDate} a las ${time} hs?`,
            message: cancellationAnticipationHours === 0
                ? "Podrás cancelar el turno cuando desees."
                : `Solo podrás cancelar el turno con más de ${messageHours} de anticipación.`,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            cancelButton: true,
        })

        if (!decisionConfirmed) return

        setIsLoadingConfirm(true)
        try {
            const response = await getContainsSignPrice(serviceId)
            if (response.error) {
                notifyError("Error al verificar el servicio. Inténtelo de nuevo más tarde.")
                return
            }
            if (!response.data) return

            if (response.data.contains) {
                navigate("/checkout", {
                    state: {
                        date: `${stringDate} ${time}`,
                        service: {
                            serviceId: serviceData._id,
                            title: serviceData.title,
                            signPrice: serviceData.signPrice,
                            companyId: serviceData.companyId,
                            totalPrice: serviceData.price,
                            mode: serviceData.mode,
                        },
                        dataUser,
                        cancellationAnticipationHours,
                    },
                })
                return
            }

            setIsScheduling(true)
            try {
                const appointmentResponse = await addAppointment({
                    dataAppointment: {
                        date: `${stringDate} ${time}`,
                        serviceId: serviceData._id,
                        companyId: serviceData.companyId,
                    },
                    dataUser,
                })
                if (appointmentResponse.error) {
                    notifyError(appointmentResponse.error, true)
                    return
                }
                const confirm = await confirmDelete({
                    icon: "success",
                    question: "Turno confirmado correctamente.",
                    confirmButtonText: "Aceptar",
                    cancelButton: false,
                })
                if (confirm) {
                    onScheduled()
                    window.location.reload()
                }
            } finally {
                setIsScheduling(false)
            }
        } finally {
            setIsLoadingConfirm(false)
        }
    }

    return {
        serviceData: serviceQuery.data ?? null,
        isLoadingData: serviceQuery.isLoading,
        isLoadingCheckHour: checkHourMutation.isPending,
        isLoadingConfirm,
        isScheduling,
        checkOrderHour,
        confirmAppointment,
    }
}
