import "./ServicesPanel.css"
import Title from "../../../../../common/Title/Title";
import { type Service, type View } from "../../../../../types";
import ServiceCard from "../../../../Cards/ServiceCard/ServiceCard";
import { useContext, useState } from "react";
import { BACKEND_API_URL } from "../../../../../config";
import { notifyError } from "../../../../../utils/notifications";
import ModalForm from "../../../../ModalForm/ModalForm";
import { CompanyContext } from "../../../../../contexts/CompanyContext";
import { useAuthenticatedPost } from "../../../../../hooks/useAuthenticatedFetch";

interface Props {
    companyServices: Service[]
    connectedWithMP: boolean
    companyPlan: string
    onDeleteService: (id: string, scheduledAppointmentsToDelete: string[]) => void
    handleChangeToCalendar: (id: string, view: View) => void
}

const ServicesPanel: React.FC<Props> = ({ companyServices, connectedWithMP, companyPlan, onDeleteService, handleChangeToCalendar }) => {

    const { updateServices, addService } = useContext(CompanyContext)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    const { isLoading, error, post } = useAuthenticatedPost()
    const urlCreateService = `${BACKEND_API_URL}/services/create-service`

    if (error) {
        console.error(error)
        notifyError('Error del servidor: Inténtalo de nuevo más tarde')
    }

    const handleAddService = async (data: { [key: string]: any }) => {
        const response = await post(urlCreateService, data)
        setIsModalOpen(false)
        if (response?.data) addService(response.data.data)
        if (response?.error) {
            console.error(response.error)
            notifyError("Error al crear el servicio")
        }
    }

    const onUpdateService = (data: { [key: string]: any }) => {
        const serviceToUpdate = companyServices.find(s => s._id === data._id)
        updateServices({ ...serviceToUpdate!, ...data })
    }

    const verifyAddServiceLimit = () => {
        if (companyPlan === "individual" && companyServices.length >= 5) {
            notifyError("Has alcanzado el límite de servicios para tu plan. Actualiza tu plan para agregar más servicios.", true)
            return false
        }
        setIsModalOpen(true)
    }

    return (
        <div className="animation-section divSectionContainer">
            <div className="servicesPanelHeader">
                <Title
                    margin="0 0 1rem 0"
                >
                    Servicios activos
                </Title>
                <button
                    className={`buttonAddService ${companyPlan === "individual" && companyServices.length >= 5 ? "disabled" : ""}`}
                    onClick={verifyAddServiceLimit}
                >
                    <span className="plusButton">+ </span>
                    {
                        window.innerWidth >= 470 ? "Agregar servicio" :
                            window.innerWidth >= 400 ? "Agregar" : ""
                    }
                </button>
            </div>
            {
                companyServices.length === 0 ?
                    <div className="noServicesAppointments">
                        <h3>No tienes servicios activos</h3>
                    </div>
                    :
                    <div className="divListContainerServicePanel">
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
                                    mode={service.mode}
                                    availableAppointmentsLenght={service.availableAppointments.reduce((acc, appointment) => acc + appointment.capacity - appointment.taken, 0)}
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
                    { type: "select", name: "mode", label: "Modalidad", selectOptions: [{ label: "Presencial", value: "in-person" }, { label: "Virtual", value: "online" }] },
                    { type: "number", name: "duration", placeholder: "Duración", label: "Duración (en minutos)" },
                    { type: "number", name: "capacityPerShift", placeholder: "Capacidad de personas por turno", label: "Capacidad de personas por turno" },
                    connectedWithMP ?
                        { type: "number", name: "signPrice", placeholder: "Precio de la seña", label: "Precio de la seña (Si no quieres cobrar señas para tus turnos deja '0')" }
                        :
                        { type: "none", name: "notConnectedWithMP", placeholder: "No puede cobrar señas", label: "Si quiere cobrar señas, vincule su cuenta de Mercado Pago." }

                ]}
                initialData={{ title: "", description: "", price: 0, duration: 0, signPrice: 0, capacityPerShift: 1, mode: "in-person" }}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => handleAddService(data)}
                disabledButtons={isLoading}
            />
        </div>
    );
}

export default ServicesPanel;
