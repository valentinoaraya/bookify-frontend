import "./AppointmentsUsedServicesPanel.css"
import Title from "../../../../../common/Title/Title";
import AppointmentCard from "../../../../Cards/AppointmentCard/AppointmentCard";
import { type ServiceUsed, type Appointment } from "../../../../../types";
import { useContext } from "react";
import { UserContext } from "../../../../../contexts/UserContext";
import { ToastContainer } from "react-toastify";

interface Props {
    appointments: Appointment[];
    servicesUsed: ServiceUsed[];
}

const AppointmentsUsedServicesPanel: React.FC<Props> = ({ appointments, servicesUsed }) => {

    const { state, updateAppointments } = useContext(UserContext)

    return (
        <>
            <div className="divAppointments">
                <ToastContainer />
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
            <div className="divUsedServices">
                <Title>Últimos servicios utilizados</Title>
                {
                    servicesUsed ?
                        <div>
                            <h3>Acá van los servicios utilizados por el usuraio</h3>
                        </div>
                        :
                        <div className="noServicesAppointmentsUser">
                            <h3>No has utilizado servicios aún</h3>
                        </div>
                }
            </div>
        </>
    );
}

export default AppointmentsUsedServicesPanel;
