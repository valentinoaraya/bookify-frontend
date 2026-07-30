import { AvailableAppointment, EventFullCalendar, PendingAppointment, Service, Slot } from "../types"

/** Preferir `slots`; fallback a availableAppointments durante la transición. */
export const getServiceSlots = (service: Pick<Service, "slots" | "availableAppointments">): AvailableAppointment[] => {
    if (service.slots && service.slots.length > 0) {
        return service.slots
    }
    return service.availableAppointments || []
}

export const slotsToAvailable = (slots: Slot[]): AvailableAppointment[] =>
    slots.filter(s => s.taken < s.capacity)

export const slotsToScheduledDates = (slots: Slot[]): string[] => {
    const dates: string[] = []
    for (const slot of slots) {
        for (let i = 0; i < (slot.taken || 0); i++) {
            dates.push(slot.datetime)
        }
    }
    return dates
}

export const generateAvailableAppointmentsArray = (
    availableAppointments: AvailableAppointment[],
    pendingAppointments?: PendingAppointment[]
): EventFullCalendar[] => {
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
                backgroundColor: pendingCount > 0 && disponibility === 0 ? "#f0930b" : "#12a150",
                borderColor: pendingCount > 0 && disponibility === 0 ? "#f0930b" : "#12a150",
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

export const generateScheudledAppointmentArray = (
    scheduledAppointments: string[],
    availableAppointments: AvailableAppointment[]
): EventFullCalendar[] => {
    const arrayEventsScheduled = scheduledAppointments.filter(date =>
        !availableAppointments.some(app => app.datetime === date)
    )
        .map(date => {
            const count = scheduledAppointments.filter(d => d === date).length
            return {
                title: `${count} ${count === 1 ? "Ocupado" : "Ocupados"}`,
                start: date,
                backgroundColor: "#e5484d",
                borderColor: "#e5484d",
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

/** Genera eventos de calendario a partir de slots (+ pending). */
export const generateCalendarEventsFromService = (
    service: Pick<Service, "slots" | "availableAppointments" | "scheduledAppointments" | "pendingAppointments">
): { available: EventFullCalendar[]; scheduled: EventFullCalendar[] } => {
    const slots = getServiceSlots(service)
    const available = slotsToAvailable(slots)
    const scheduled =
        service.slots && service.slots.length > 0
            ? slotsToScheduledDates(service.slots)
            : service.scheduledAppointments || []

    return {
        available: generateAvailableAppointmentsArray(available, service.pendingAppointments),
        scheduled: generateScheudledAppointmentArray(scheduled, available),
    }
}
