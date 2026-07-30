import "./ScheduledAppointmentsPanel.css"
import Title from "../../../../../common/Title/Title";
import { Service, type Appointment } from "../../../../../types";
import AppointmentCard from "../../../../Cards/AppointmentCard/AppointmentCard";
import { useEffect, useMemo, useState } from "react";
import { useCompany } from "../../../../../hooks/useCompany";
import {
    groupByDay,
    isSameDay,
    isSameMonth,
    isSameWeek,
    sortByDateAsc,
} from "@/shared/lib/date";

interface Props {
    scheduledAppointments: Appointment[]
}

type Filter = "today" | "week" | "month" | "all"

const sortAppointments = (items: Appointment[]) =>
    sortByDateAsc(items, (a) => a.date)

const filterAppointments = (items: Appointment[], filter: Filter) => {
    const sorted = sortAppointments(items)
    if (filter === "today") return sorted.filter((a) => isSameDay(a.date))
    if (filter === "week") return sorted.filter((a) => isSameWeek(a.date))
    if (filter === "month") return sorted.filter((a) => isSameMonth(a.date))
    return sorted
}

const filterEmptyMessage: Record<Filter, string> = {
    all: "",
    month: "para este mes",
    week: "esta semana",
    today: "hoy",
}

const ScheduledAppointmentsPanel: React.FC<Props> = ({ scheduledAppointments }) => {
    const { deleteAppointment, updateServices } = useCompany()
    const [filter, setFilter] = useState<Filter>("week")
    const [appointments, setAppointments] = useState(() =>
        filterAppointments(scheduledAppointments, "week")
    )

    useEffect(() => {
        setAppointments(filterAppointments(scheduledAppointments, filter))
    }, [scheduledAppointments, filter])

    const dayGroups = useMemo(
        () => groupByDay(appointments, (a) => a.date),
        [appointments]
    )

    const onCancelAppointment = (appointment: string, service: Service) => {
        deleteAppointment(appointment)
        updateServices(service)
    }

    return (
        <div className="animation-section divSectionContainer">
            <div className="titleAndFilterContainer">
                <Title margin="0 0 0 0">
                    Próximos turnos
                </Title>
                <div className="divFilter" role="tablist" aria-label="Filtrar turnos">
                    <button
                        type="button"
                        className={`buttonFilter ${filter === "today" ? "activeButtonFilter" : ""}`}
                        onClick={() => setFilter("today")}
                    >
                        Hoy
                    </button>
                    <button
                        type="button"
                        className={`buttonFilter ${filter === "week" ? "activeButtonFilter" : ""}`}
                        onClick={() => setFilter("week")}
                    >
                        Esta semana
                    </button>
                    <button
                        type="button"
                        className={`buttonFilter ${filter === "month" ? "activeButtonFilter" : ""}`}
                        onClick={() => setFilter("month")}
                    >
                        Este mes
                    </button>
                    <button
                        type="button"
                        className={`buttonFilter ${filter === "all" ? "activeButtonFilter" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        Todos
                    </button>
                </div>
            </div>

            {appointments.length === 0 ? (
                <div className="noServicesAppointments">
                    <h3>
                        No tienes turnos agendados{" "}
                        {filterEmptyMessage[filter]}
                    </h3>
                </div>
            ) : (
                <div className="agendaList">
                    {dayGroups.map((group) => (
                        <section key={group.key} className="agendaDayGroup">
                            <header className="agendaDayHeader">
                                <h3 className="agendaDayLabel">
                                    <span className="agendaDayPrimary">{group.label.primary}</span>
                                    <span className="agendaDaySecondary">{group.label.secondary}</span>
                                </h3>
                                <span className="agendaDayCount">
                                    {group.items.length}{" "}
                                    {group.items.length === 1 ? "turno" : "turnos"}
                                </span>
                            </header>
                            <div className="agendaDayRows">
                                {group.items.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment._id}
                                        appointment={appointment}
                                        onCancelAppointment={onCancelAppointment}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ScheduledAppointmentsPanel;
