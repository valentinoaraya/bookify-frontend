import "./UserInterface.css"
import SideBar from "../../SideBar/SideBar";
import { type User } from "../../../../types";
import Title from "../../../../common/Title/Title";
import AppointmentCard from "../../../Cards/AppointmentCard/AppointmentCard";
import SearchBar from "../../../SearchBar/SearchBar";

interface Props {
    user: User
}

const UserInterface: React.FC<Props> = ({ user }) => {

    console.log(user)

    return (
        <div className="divInterfaceUserContainer">
            <SideBar data={{ ...user, type: "user" }} />
            <div className="divUserPanel">
                <SearchBar />
                <div className="divAppointments">
                    <Title>Turnos pendientes</Title>
                    {
                        user.appointments.length === 0 ?
                            <div className="noServicesAppointments">
                                <h3>No tienes turnos agendados</h3>
                            </div>
                            :
                            <div className="divListContainer">
                                {
                                    user.appointments.map((appointment) => {
                                        return <AppointmentCard
                                            key={appointment._id}
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
                        user.servicesUsed ?
                            <div>
                                <h3>Acá van los servicios utilizados por el usuraio</h3>
                            </div>
                            :
                            <div className="noServicesAppointments">
                                <h3>No has utilizado servicios aún</h3>
                            </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default UserInterface;
