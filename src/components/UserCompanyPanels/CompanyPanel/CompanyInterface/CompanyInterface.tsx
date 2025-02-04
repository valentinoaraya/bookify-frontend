import "./CompanyInterface.css"
import SideBar from "../../SideBar/SideBar";
import { type Company, type View, type Service, type Appointment } from "../../../../types";
import { useState } from "react";
import Title from "../../../../common/Title/Title";
import ServiceCard from "../../../Cards/ServiceCard/ServiceCard";
import AppointmentCard from "../../../Cards/AppointmentCard/AppointmentCard";
import AddSomethingCard from "../../../Cards/AddSomethingCard/AddSomethingCard";
import ModalForm from "../../../ModalForm/ModalForm";
import { useFetchData } from "../../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../../config";
import { notifyError } from "../../../../utils/notifications";
import { ToastContainer } from "react-toastify";

interface Props {
    company: Company
}

const CompanyInterface: React.FC<Props> = ({ company }) => {

    const [activeView, setActiveView] = useState<View>("appointments")
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [scheduledAppointments, setScheduledAppointments] = useState<Appointment[]>(company.scheduledAppointments)
    const [companyServices, setCompanyServices] = useState<Service[]>(company.services)
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/create-service`,
        "POST",
        true
    )

    if (error) {
        console.error(error)
        notifyError('Error del servidor: Inténtalo de nuevo más tarde')
    }

    const handleAddService = async (data: { [key: string]: any }) => {
        const response = await fetchData(data)
        setIsModalOpen(false)
        if (response?.data) setCompanyServices((prevCompnayServices: Service[]) => [...prevCompnayServices, response.data])
        if (response?.error) notifyError("Error al crear el servicio")
    }

    const onDeleteService = (id: string, scheduledAppointmentsToDelete: string[]) => {
        setCompanyServices(companyServices.filter(service => service._id !== id))
        setScheduledAppointments(scheduledAppointments.filter(appointment => !scheduledAppointmentsToDelete.includes(appointment._id)))
    }

    const onUpdateService = (data: { [key: string]: any }) => {
        setCompanyServices(companyServices.map(service => service._id === data._id ? { ...service, ...data } : service))
    }

    return (
        <div className="divInterfaceCompanyContainer">
            <ToastContainer />
            <SideBar
                data={{ ...company, type: "company" }}
                onViewChange={(view: View) => setActiveView(view)}
            />
            <div className="divCompanyPanel">
                {
                    activeView === "appointments" ?
                        <>
                            <Title fontSize="2.2rem">
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
                        :
                        <>
                            <Title fontSize="2.2rem">
                                Mis servicios
                            </Title>
                            <div className="divListContainer">
                                {
                                    companyServices.length > 0 &&
                                    <>
                                        {
                                            companyServices.map(service => {
                                                return <ServiceCard
                                                    key={service._id}
                                                    id={service._id}
                                                    title={service.title}
                                                    duration={service.duration}
                                                    price={service.price}
                                                    description={service.description}
                                                    onDeleteService={onDeleteService}
                                                    onUpdateService={(data) => onUpdateService(data)}
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
                inputs={[
                    { type: "text", name: "title", placeholder: "Título" },
                    { type: "text", name: "description", placeholder: "Descripción" },
                    { type: "number", name: "price", placeholder: "Precio" },
                    { type: "number", name: "duration", placeholder: "Duración" }
                ]}
                initialData={{ title: "", description: "", price: 0, duration: 0 }}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => handleAddService(data)}
                disabledButtons={isLoading}
            />
        </div>
    );
}

export default CompanyInterface;
