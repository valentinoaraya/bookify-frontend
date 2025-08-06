import "./ScheduledAppointmentsPanel.css"
import Title from "../../../../../common/Title/Title";
import { type Appointment } from "../../../../../types";
import AppointmentCard from "../../../../Cards/AppointmentCard/AppointmentCard";
import { useContext } from "react";
import { CompanyContext } from "../../../../../contexts/CompanyContext";
import moment from "moment";

interface Props {
    scheduledAppointments: Appointment[]
}

const ScheduledAppointmentsPanel: React.FC<Props> = ({ scheduledAppointments }) => {

    const { state, updateAppointments, updateServices } = useContext(CompanyContext)

    const sortedAppointments = scheduledAppointments.sort((a, b) => moment(a.date, "YYYY-MM-DD HH:mm").valueOf() - moment(b.date, "YYYY-MM-DD HH:mm").valueOf())

    const onCancelAppointment = (appointments: Appointment[], dateAppointment: string, serviceId: string) => {
        updateAppointments(appointments)
        const serviceToUpdate = state.services.find(service => service._id === serviceId);
        if (!serviceToUpdate) {
            console.error(`Service with id ${serviceId} not found`);
            return;
        }
        const newScheduledAppointments = serviceToUpdate.scheduledAppointments.filter(availableAppointment => availableAppointment !== dateAppointment)
        const newAvailableAppointments = [...serviceToUpdate.availableAppointments, dateAppointment]
        const serviceUpdated = { ...serviceToUpdate, availableAppointments: newAvailableAppointments, scheduledAppointments: newScheduledAppointments }
        updateServices(state.services.map(service => service._id === serviceUpdated._id ? serviceUpdated : service))
    }

    return (
        <>
            <Title
                fontSize={window.innerWidth <= 530 ? "1.8rem" : ""}
                margin="0 0 2rem 0"
            >
                Turnos pendientes
            </Title>
            {
                sortedAppointments.length === 0 ?
                    <div className="noServicesAppointments">
                        <h3>No tienes turnos agendados</h3>
                    </div>
                    :
                    <div className={sortedAppointments.length === 1 ? "oneCard" : "divListContainer"}>
                        {
                            sortedAppointments.map((appointment) => {
                                return <AppointmentCard
                                    _id={appointment._id}
                                    key={appointment._id}
                                    serviceId={appointment.serviceId._id}
                                    state={state}
                                    onCancelAppointment={(appointments: Appointment[], appointmentToDelete: string, serviceId: string) => onCancelAppointment(appointments, appointmentToDelete, serviceId)}
                                    title={appointment.serviceId.title}
                                    client={`${appointment.clientId?.name} ${appointment.clientId?.lastName}`}
                                    clientEmail={appointment.clientId?.email}
                                    clientPhone={appointment.clientId?.phone}
                                    date={appointment.date}
                                />
                            })
                        }
                    </div>
            }
        </>
    );
}

export default ScheduledAppointmentsPanel;
