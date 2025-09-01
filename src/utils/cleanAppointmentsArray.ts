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
            if (disponibility <= 0) return null
            return {
                title: window.innerWidth <= 1150 ? `${disponibility}` : `${disponibility} ${disponibility === 1 ? "Disponible" : "Disponibles"}`,
                start: availableAppointment.datetime,
                backgroundColor: "green",
                borderColor: "green"
            }
        })
        .filter((e): e is EventFullCalendar => e !== null)
}

export const generateScheudledAppointmentArray = (scheduledAppointments: string[], availableAppointments: AvailableAppointment[]): EventFullCalendar[] => {
    const arrayEventsScheduled = scheduledAppointments.filter(date =>
        !availableAppointments.some(app => app.datetime === date)
    )
        .map(date => {
            const count = scheduledAppointments.filter(d => d === date).length
            return {
                title: window.innerWidth <= 1150 ? `${count}` : `${count} ${count === 1 ? "Ocupado" : "Ocupados"} `,
                start: date,
                backgroundColor: "red",
                borderColor: "red"
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