import "./ScheduledAppointmentsPanel.css"
import Title from "../../../../../common/Title/Title";
import { Service, type Appointment } from "../../../../../types";
import AppointmentCard from "../../../../Cards/AppointmentCard/AppointmentCard";
import { useContext, useEffect, useState } from "react";
import { CompanyContext } from "../../../../../contexts/CompanyContext";
import moment from "moment";

interface Props {
    scheduledAppointments: Appointment[]
}

const ScheduledAppointmentsPanel: React.FC<Props> = ({ scheduledAppointments }) => {

    const { deleteAppointment, updateServices } = useContext(CompanyContext)
    const [appointments, setAppointments] = useState(scheduledAppointments.sort((a, b) => moment(a.date, "YYYY-MM-DD HH:mm").valueOf() - moment(b.date, "YYYY-MM-DD HH:mm").valueOf()))
    const [filter, setFilter] = useState<"today" | "week" | "month" | "all">("all")

    useEffect(() => {
        setAppointments(scheduledAppointments.sort((a, b) => moment(a.date, "YYYY-MM-DD HH:mm").valueOf() - moment(b.date, "YYYY-MM-DD HH:mm").valueOf()))
    }, [scheduledAppointments])

    const onCancelAppointment = (appointment: string, service: Service) => {
        deleteAppointment(appointment)
        updateServices(service)
    }

    return (
        <div className="animation-section divSectionContainer">
            <div className="titleAndFilterContainer">
                <Title
                    margin="0 0 0 0"
                >
                    Turnos pendientes
                </Title>
                <div className="divFilter">
                    <button
                        className={`buttonFilter ${filter === "today" ? "activeButtonFilter" : ""}`}
                        onClick={() => {
                            setAppointments(scheduledAppointments.sort((a, b) => moment(a.date, "YYYY-MM-DD HH:mm").valueOf() - moment(b.date, "YYYY-MM-DD HH:mm").valueOf()).filter(appointment => moment(appointment.date).isSame(moment(), 'day')))
                            setFilter("today")
                        }}
                    >
                        Hoy
                    </button>
                    <button
                        className={`buttonFilter ${filter === "week" ? "activeButtonFilter" : ""}`}
                        onClick={() => {
                            setAppointments(scheduledAppointments.sort((a, b) => moment(a.date, "YYYY-MM-DD HH:mm").valueOf() - moment(b.date, "YYYY-MM-DD HH:mm").valueOf()).filter(appointment => moment(appointment.date).isSame(moment(), 'week')))
                            setFilter("week")
                        }}
                    >
                        Esta semana
                    </button>
                    <button
                        className={`buttonFilter ${filter === "month" ? "activeButtonFilter" : ""}`}
                        onClick={() => {
                            setAppointments(scheduledAppointments.sort((a, b) => moment(a.date, "YYYY-MM-DD HH:mm").valueOf() - moment(b.date, "YYYY-MM-DD HH:mm").valueOf()).filter(appointment => moment(appointment.date).isSame(moment(), 'month')))
                            setFilter("month")
                        }}
                    >
                        Este mes
                    </button>
                    <button
                        className={`buttonFilter ${filter === "all" ? "activeButtonFilter" : ""}`}
                        onClick={() => {
                            setAppointments(scheduledAppointments.sort((a, b) => moment(a.date, "YYYY-MM-DD HH:mm").valueOf() - moment(b.date, "YYYY-MM-DD HH:mm").valueOf()))
                            setFilter("all")
                        }}
                    >
                        Todos
                    </button>
                </div>
            </div>

            {
                appointments.length === 0 ?
                    <div className="noServicesAppointments">
                        <h3>No tienes turnos agendados {filter === "all" ? "" : filter === "month" ? "para este mes" : filter === "week" ? "esta semana" : "hoy"}</h3>
                    </div>
                    :
                    <div className="divListContainerScheduledAppointments">
                        {
                            appointments.map((appointment) => {
                                return <AppointmentCard
                                    key={appointment._id}
                                    appointment={appointment}
                                    onCancelAppointment={(appointment: string, service: Service) => onCancelAppointment(appointment, service)}
                                />
                            })
                        }
                    </div>
            }
        </div>
    );
}

export default ScheduledAppointmentsPanel;
