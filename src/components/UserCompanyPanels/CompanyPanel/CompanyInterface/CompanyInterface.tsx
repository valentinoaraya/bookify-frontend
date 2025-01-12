import "./CompanyInterface.css"
import SideBar from "../../SideBar/SideBar";
import { type Company } from "../../../../types";
import { useState } from "react";
import { type View } from "../../../../types";
import Title from "../../../../common/Title/Title";
import ServiceCard from "../../../Cards/ServiceCard/ServiceCard";
import AppointmentCard from "../../../Cards/AppointmentCard/AppointmentCard";

interface Props {
    company: Company
}

const CompanyInterface: React.FC<Props> = ({ company }) => {

    const [activeView, setActiveView] = useState<View>("appointments")
    const handleChangeView = (view: View) => {
        setActiveView(view)
    }

    console.log(company.services)
    console.log(company.scheduledAppointments)

    return (
        <div className="divInterfaceCompanyContainer">
            <SideBar
                data={{ ...company, type: "company" }}
                onViewChange={handleChangeView}
            />
            <div className="divCompanyPanel">
                {
                    activeView === "appointments" ?
                        <>
                            <Title fontSize="2.2rem">
                                Próximos turnos
                            </Title>
                            {
                                company.scheduledAppointments.length === 0 ?
                                    <div className="noServicesAppointments">
                                        <h3>No tienes turnos agendados</h3>
                                    </div>
                                    :
                                    <div className="divListContainer">
                                        {
                                            company.scheduledAppointments.map((appointment) => {
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
                        :
                        <>
                            <Title fontSize="2.2rem">
                                Mis servicios
                            </Title>
                            {
                                company.services.length === 0 ?
                                    <div className="noServicesAppointments">
                                        <h3>No hay servicios</h3>
                                    </div>
                                    :
                                    <div className="divListContainer">
                                        {
                                            company.services.map(service => {
                                                return <ServiceCard
                                                    key={service._id}
                                                    title={service.title}
                                                    duration={service.duration}
                                                    price={service.price}
                                                    description={service.description}
                                                />
                                            })
                                        }
                                    </div>
                            }
                        </>
                }
            </div>
        </div>
    );
}

export default CompanyInterface;
