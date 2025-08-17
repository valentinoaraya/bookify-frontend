import "./ServicesPanel.css"
import Title from "../../../../../common/Title/Title";
import { type Service, type View } from "../../../../../types";
import ServiceCard from "../../../../Cards/ServiceCard/ServiceCard";
import { useContext, useState } from "react";
import { useFetchData } from "../../../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../../../config";
import { notifyError } from "../../../../../utils/notifications";
import ModalForm from "../../../../ModalForm/ModalForm";
import { CompanyContext } from "../../../../../contexts/CompanyContext";
import Button from "../../../../../common/Button/Button";

interface Props {
    companyServices: Service[]
    connectedWithMP: boolean
    onDeleteService: (id: string, scheduledAppointmentsToDelete: string[]) => void
    handleChangeToCalendar: (id: string, view: View) => void
}

const ServicesPanel: React.FC<Props> = ({ companyServices, connectedWithMP, onDeleteService, handleChangeToCalendar }) => {

    const token = localStorage.getItem("access_token")
    const { updateServices } = useContext(CompanyContext)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/create-service`,
        "POST",
        token
    )

    if (error) {
        console.error(error)
        notifyError('Error del servidor: Inténtalo de nuevo más tarde')
    }

    const handleAddService = async (data: { [key: string]: any }) => {
        const response = await fetchData(data)
        setIsModalOpen(false)
        if (response?.data) updateServices([...companyServices, response.data])
        if (response?.error) {
            console.error(response.error)
            notifyError("Error al crear el servicio")
        }
    }

    const onUpdateService = (data: { [key: string]: any }) => {
        updateServices(companyServices.map(service => service._id === data._id ? { ...service, ...data } : service))
    }

    console.log(companyServices)

    return (
        <>
            <div className="servicesPanelHeader">
                <Title
                    margin="0 0 1rem 0"
                    fontSize={window.innerWidth <= 530 ? "1.8rem" : ""}
                >
                    Servicios activos
                </Title>
                <Button onSubmit={() => setIsModalOpen(true)} width="fit-content" padding="0.5rem 1rem" fontSize="1.1rem" margin="0 0 1rem 0" backgroundColor="green">
                    <span className="plusButton">+</span>
                    Agregar servicio
                </Button>
            </div>
            {
                companyServices.length === 0 ?
                    <div className="noServicesAppointments">
                        <h3>No tienes servicios activos</h3>
                    </div>
                    :
                    <div className="divListContainer">
                        {
                            companyServices.map(service => {
                                return <ServiceCard
                                    key={service._id}
                                    id={service._id}
                                    title={service.title}
                                    duration={service.duration}
                                    capacityPerShift={service.capacityPerShift}
                                    price={service.price}
                                    description={service.description}
                                    signPrice={service.signPrice}
                                    connectedWithMP={connectedWithMP}
                                    availableAppointmentsLenght={service.availableAppointments.length}
                                    scheduledAppointmentsLenght={service.scheduledAppointments.length}
                                    onDeleteService={onDeleteService}
                                    onUpdateService={(data) => onUpdateService(data)}
                                    onRedirectToCalendar={(id: string, view: View) => handleChangeToCalendar(id, view)}
                                />
                            })
                        }
                    </div>
            }
            <ModalForm
                title="Agregar servicio"
                isOpen={isModalOpen}
                inputs={[
                    { type: "text", name: "title", placeholder: "Título", label: "Título" },
                    { type: "text", name: "description", placeholder: "Descripción", label: "Descripción" },
                    { type: "number", name: "price", placeholder: "Precio", label: "Precio" },
                    { type: "number", name: "duration", placeholder: "Duración", label: "Duración (en minutos)" },
                    { type: "number", name: "capacityPerShift", placeholder: "Capacidad de personas por turno", label: "Capacidad de personas por turno" },
                    connectedWithMP ?
                        { type: "number", name: "signPrice", placeholder: "Precio de la seña", label: "Precio de la seña (Si no quieres cobrar señas para tus turnos deja '0')" }
                        :
                        { type: "none", name: "notConnectedWithMP", placeholder: "No puede cobrar señas", label: "Si quiere cobrar señas, vincule su cuenta de Mercado Pago." }

                ]}
                initialData={{ title: "", description: "", price: 0, duration: 0, signPrice: 0, capacityPerShift: 1 }}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => handleAddService(data)}
                disabledButtons={isLoading}
            />
        </>
    );
}

export default ServicesPanel;
