import { AvailableAppointment, EventFullCalendar, PendingAppointment } from "../types"

export const generateAvailableAppointmentsArray = (availableAppointments: AvailableAppointment[], pendingAppointments?: PendingAppointment[]): EventFullCalendar[] => {
    const pendingByDatetime: Record<string, number> = {}
    if (pendingAppointments && pendingAppointments.length > 0) {
        pendingAppointments.forEach(p => {
            const key = new Date((p as unknown as { datetime: string | number | Date }).datetime).toISOString()
            pendingByDatetime[key] = (pendingByDatetime[key] ?? 0) + 1
        })
    }

    return availableAppointments
        .map(availableAppointment => {
            const availableKey = new Date(availableAppointment.datetime).toISOString()
            const pendingCount = pendingByDatetime[availableKey] ?? 0
            const disponibility = (availableAppointment.capacity - availableAppointment.taken) - pendingCount
            return {
                title: `${disponibility} ${disponibility === 1 ? "Disponible" : "Disponibles"}`,
                start: availableAppointment.datetime,
                backgroundColor: `${pendingCount > 0 && disponibility === 0 ? "orange" : "#3f9f0f"}`,
                borderColor: `${pendingCount > 0 && disponibility === 0 ? "orange" : "#3f9f0f"}`,
                extendedProps: {
                    disponibility,
                    taken: availableAppointment.taken,
                    capacity: availableAppointment.capacity,
                    pendingCount
                }
            }
        })
        .filter((e): e is NonNullable<typeof e> => e !== null)
}

export const generateScheudledAppointmentArray = (scheduledAppointments: string[], availableAppointments: AvailableAppointment[]): EventFullCalendar[] => {
    const arrayEventsScheduled = scheduledAppointments.filter(date =>
        !availableAppointments.some(app => app.datetime === date)
    )
        .map(date => {
            const count = scheduledAppointments.filter(d => d === date).length
            return {
                title: `${count} ${count === 1 ? "Ocupado" : "Ocupados"}`,
                start: date,
                backgroundColor: "red",
                borderColor: "red",
                extendedProps: {
                    scheduledCount: count
                }
            }
        })

    const newArrayEventsScheduled: EventFullCalendar[] = []
    arrayEventsScheduled.forEach(item => {
        const date = item.start
        if (!newArrayEventsScheduled.some(a => a.start === date)) {
            newArrayEventsScheduled.push(item)
        }
    })

    return newArrayEventsScheduled
}