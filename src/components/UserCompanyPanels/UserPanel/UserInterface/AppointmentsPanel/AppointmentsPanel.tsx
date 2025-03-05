import "./AppointmentsPanel.css"
import Title from "../../../../../common/Title/Title";
import AppointmentCard from "../../../../Cards/AppointmentCard/AppointmentCard";
import { type Appointment } from "../../../../../types";
import { useContext } from "react";
import { UserContext } from "../../../../../contexts/UserContext";

interface Props {
    appointments: Appointment[];
}

const AppointmentsPanel: React.FC<Props> = ({ appointments }) => {

    const { state, updateAppointments } = useContext(UserContext)

    return (
        <>
            <div className="divAppointments">
                <Title>Turnos pendientes</Title>
                {
                    appointments.length === 0 ?
                        <div className="noServicesAppointmentsUser">
                            <h3>No tienes turnos agendados</h3>
                        </div>
                        :
                        <div className="divListContainer">
                            {
                                appointments.map((appointment) => {
                                    return <AppointmentCard
                                        key={appointment._id}
                                        _id={appointment._id}
                                        serviceId={appointment.serviceId._id}
                                        state={state}
                                        onCancelAppointment={updateAppointments}
                                        title={appointment.serviceId.title}
                                        company={appointment.companyId?.name}
                                        companyLocation={`${appointment.companyId?.city} - ${appointment.companyId?.street} ${appointment.companyId?.number}`}
                                        serviceDuration={appointment.serviceId.duration}
                                        servicePrice={appointment.serviceId.price}
                                        date={appointment.date}
                                    />
                                })
                            }
                        </div>
                }
            </div>
        </>
    );
}

export default AppointmentsPanel;
