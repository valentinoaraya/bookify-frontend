import "./ScheduledAppointmentsPanel.css"
import Title from "../../../../../common/Title/Title";
import { type Appointment } from "../../../../../types";
import AppointmentCard from "../../../../Cards/AppointmentCard/AppointmentCard";

interface Props {
    scheduledAppointments: Appointment[]
}

const ScheduledAppointmentsPanel: React.FC<Props> = ({ scheduledAppointments }) => {
    return (
        <>
            <Title>
                Próximos turnos
            </Title>
            {
                scheduledAppointments.length === 0 ?
                    <div className="noServicesAppointments">
                        <h3>No tienes turnos agendados</h3>
                    </div>
                    :
                    <div className="divListContainer">
                        {
                            scheduledAppointments.map((appointment) => {
                                return <AppointmentCard
                                    key={appointment._id}
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
