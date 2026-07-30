import "./ServicesPanel.css"
import Title from "../../../../../common/Title/Title";
import { type Service, type View } from "../../../../../types";
import ServiceCard from "../../../../Cards/ServiceCard/ServiceCard";
import { useState } from "react";
import { createService } from "@/shared/api/services";
import { notifyError } from "../../../../../utils/notifications";
import ModalForm from "../../../../ModalForm/ModalForm";
import { useCompany } from "../../../../../hooks/useCompany";
import { getServiceFormInputs } from "@/features/company-panel/services/serviceFormInputs";
import { getServiceSlots, slotsToScheduledDates } from "../../../../../utils/cleanAppointmentsArray";

interface Props {
    companyServices: Service[]
    connectedWithMP: boolean
    companyPlan: string
    onDeleteService: (id: string, scheduledAppointmentsToDelete: string[]) => void
    handleChangeToCalendar: (id: string, view: View) => void
}

const ServicesPanel: React.FC<Props> = ({ companyServices, connectedWithMP, companyPlan, onDeleteService, handleChangeToCalendar }) => {

    const { updateServices, addService } = useCompany()
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleAddService = async (data: { [key: string]: any }) => {
        setIsLoading(true)
        try {
            const response = await createService(data)
            setIsModalOpen(false)
            if (response?.data) addService(response.data.data)
            if (response?.error) {
                console.error(response.error)
                notifyError("Error al crear el servicio")
            }
        } finally {
            setIsLoading(false)
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
                                const slots = getServiceSlots(service)
                                const scheduledCount =
                                    service.slots && service.slots.length > 0
                                        ? slotsToScheduledDates(service.slots).length
                                        : (service.scheduledAppointments || []).length
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
                                    active={service.active}
                                    availableAppointmentsLenght={slots.reduce((acc, appointment) => acc + appointment.capacity - appointment.taken, 0)}
                                    scheduledAppointmentsLenght={scheduledCount}
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
                inputs={getServiceFormInputs({ connectedWithMP })}
                initialData={{ title: "", description: "", price: 0, duration: 0, signPrice: 0, capacityPerShift: 1, mode: "in-person" }}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => handleAddService(data)}
                disabledButtons={isLoading}
            />
        </div>
    );
}

export default ServicesPanel;
