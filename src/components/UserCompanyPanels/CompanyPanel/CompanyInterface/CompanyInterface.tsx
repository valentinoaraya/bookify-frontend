import "./CompanyInterface.css"
import SideBar from "../../SideBar/SideBar";
import { type Company } from "../../../../types";
import { useState } from "react";
import { type View } from "../../../../types";
import Title from "../../../../common/Title/Title";
import ServiceCard from "../../../Cards/ServiceCard/ServiceCard";
import AppointmentCard from "../../../Cards/AppointmentCard/AppointmentCard";
import AddSomethingCard from "../../../Cards/AddSomethingCard/AddSomethingCard";
import ModalForm from "../../../ModalForm/ModalForm";
import { useFetchData } from "../../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../../config";
import { notifyError } from "../../../../utils/notifications";

interface Props {
    company: Company
}

const CompanyInterface: React.FC<Props> = ({ company }) => {

    const [activeView, setActiveView] = useState<View>("appointments")
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/create-service`,
        "POST",
        true
    )

    const handleChangeView = (view: View) => {
        setActiveView(view)
    }

    if (error) {
        console.error(error)
        notifyError('Error del servidor: Inténtalo de nuevo más tarde')
    }

    const handleAddService = async (data: { [key: string]: any }) => {
        const response = await fetchData(data)
        console.log(response)
    }

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
                            <div className="divListContainer">
                                {
                                    company.services.length > 0 &&
                                    <>
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
                                    </>
                                }
                                <AddSomethingCard
                                    label="Agregar servicio"
                                    onClick={() => setIsModalOpen(true)}
                                />
                            </div>
                        </>
                }
            </div>
            <ModalForm
                title="Agregar servicio"
                isOpen={isModalOpen}
                labels={["title", "description", "price", "duration"]}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => handleAddService(data)}
                disabledButtons={isLoading}
            />
        </div>
    );
}

export default CompanyInterface;
