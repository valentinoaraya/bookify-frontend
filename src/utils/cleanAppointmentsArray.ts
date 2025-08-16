import { AvailableAppointment, EventFullCalendar } from "../types"

export const generateAvailableAppointmentsArray = (availableAppointments: AvailableAppointment[]): EventFullCalendar[] => {
    return availableAppointments.map(availableAppointment => {
        const disponibility = availableAppointment.capacity - availableAppointment.taken
        return {
            title: window.innerWidth <= 1150 ? `${disponibility}` : `${disponibility} ${disponibility === 1 ? "Disponible" : "Disponibles"}`,
            start: availableAppointment.datetime,
            backgroundColor: "green",
            borderColor: "green"
        }
    })
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