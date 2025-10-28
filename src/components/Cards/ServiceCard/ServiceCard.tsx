import "./ServiceCard.css"
import Button from "../../../common/Button/Button"
import { BACKEND_API_URL } from "../../../config"
import { notifyError, notifySuccess } from "../../../utils/notifications"
import { confirmDelete } from "../../../utils/alerts"
import ModalForm from "../../ModalForm/ModalForm"
import { useState } from "react"
import { View } from "../../../types"
import { ClockIcon } from "../../../common/Icons/Icons"
import { useAuthenticatedDelete, useAuthenticatedPut } from "../../../hooks/useAuthenticatedFetch"

interface Props {
    id: string
    duration: number
    price: number
    title: string
    description: string
    signPrice: number
    connectedWithMP: boolean
    scheduledAppointmentsLenght?: number
    availableAppointmentsLenght?: number
    capacityPerShift: number
    mode: "in-person" | "online"
    onDeleteService: (id: string, scheduledAppointmentsToDelete: string[]) => void
    onUpdateService: (data: { [key: string]: any }) => void
    onRedirectToCalendar: (id: string, view: View) => void
}

const ServiceCard: React.FC<Props> = ({ id, duration, price, title, description, mode, signPrice, connectedWithMP, scheduledAppointmentsLenght = 0, availableAppointmentsLenght = 0, capacityPerShift, onDeleteService, onUpdateService, onRedirectToCalendar }) => {

    const { error, isLoading, delete: del } = useAuthenticatedDelete()
    const { error: errorUpdate, isLoading: isLoadingUpdate, put } = useAuthenticatedPut()
    const urlDeleteService = `${BACKEND_API_URL}/services/delete-service/${id}`
    const urlEditService = `${BACKEND_API_URL}/services/edit-service/${id}`

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    if (error || errorUpdate) {
        console.error(error || errorUpdate)
        notifyError('Error del servidor: Inténtalo de nuevo más tarde')
    }

    const deleteService = async () => {
        const deleteConfirmed = await confirmDelete({
            question: "¿Seguro que desea eliminar el servicio?",
            mesasge: "Al eliminar el servicio se eliminarán todos los turnos pendientes de clientes relacionados a este servicio.",
            icon: "warning",
            confirmButtonText: "Eliminar servicio",
            cancelButton: true,
            cancelButtonText: "Cancelar"
        })
        if (deleteConfirmed) {
            const response = await del(urlDeleteService, {})
            if (response?.data) {
                onDeleteService(id, response.data.appointmentsToDelete)
                notifySuccess("Servicio eliminado")
            }
            if (response?.error) notifyError("Error al eliminar el servicio")
        }
    }

    const updateService = async (data: { [key: string]: any }) => {
        const response = await put(urlEditService, data)
        setIsModalOpen(false)
        if (response?.data) {
            onUpdateService(response.data.data)
            notifySuccess("Servicio actualizado")
        }
        if (response?.error) notifyError("Error al actualizar el servicio")
    }

    return (
        <>
            <div className="service-card-container">
                <div className="service-card-item">
                    <div className="service-card-header">
                        <div className="service-base-info">
                            <h3 className="service-title">{title}</h3>
                            <p className="service-description">{description}</p>
                        </div>
                        <div className="service-card-details">
                            <div className="service-info">
                                <div className="service-stats-container">
                                    <span className="service-stat available">{availableAppointmentsLenght} disponibles</span>
                                    <span className="service-stat scheduled">{scheduledAppointmentsLenght} agendados</span>
                                </div>
                                <div className="service-capacity-info">
                                    <p className="service-capacity">{capacityPerShift} {capacityPerShift > 1 ? "personas" : "persona"} por horario</p>
                                    {signPrice !== 0 ? (
                                        <p className="service-sign-price"><span>Precio de la seña: $ {signPrice}</span></p>
                                    ) : (
                                        <p className="service-sign-price"><span>Sin seña</span></p>
                                    )}
                                </div>
                                <div className={`service-mode ${mode === "in-person" ? "presencial" : "virtual"}`}>
                                    <span className="service-mode-dot"></span>
                                    <span className="service-mode-label">Modalidad</span>
                                    <span className="service-mode-value">{mode === "in-person" ? "Presencial" : "Virtual"}</span>
                                </div>
                            </div>
                            <div className="service-duration-price-info">
                                <div className="service-duration">
                                    <ClockIcon
                                        width="18px"
                                        height="18px"
                                        fill="grey"
                                    />
                                    <p className="service-duration-text">{duration} min</p>
                                </div>
                                <p className="service-price"><span className="price-symbol">$</span> {price}</p>
                            </div>
                        </div>
                    </div>
                    <div className="service-card-actions">
                        <Button
                            fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                            backgroundColor="#1282A2"
                            padding=".5rem 1rem"
                            fontWeight="600"
                            margin="0"
                            disabled={isLoading || isLoadingUpdate}
                            onSubmit={() => onRedirectToCalendar(id, "calendar")}
                        >
                            Habilitar turnos
                        </Button>
                        <Button
                            fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                            backgroundColor="#1282A2"
                            padding=".5rem 1rem"
                            fontWeight="600"
                            margin="0"
                            disabled={isLoading || isLoadingUpdate}
                            onSubmit={() => setIsModalOpen(true)}
                        >
                            Editar
                        </Button>
                        <Button
                            fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                            padding=".5rem 1rem"
                            fontWeight="600"
                            backgroundColor="rgb(231, 76, 60)"
                            margin="0"
                            onSubmit={deleteService}
                            disabled={isLoading || isLoadingUpdate}
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            </div>
            <ModalForm
                title="Editar servicio"
                isOpen={isModalOpen}
                inputs={[
                    { type: "text", name: "title", placeholder: "Título", label: "Título" },
                    { type: "text", name: "description", placeholder: "Descripción", label: "Descripción" },
                    { type: "number", name: "price", placeholder: "Precio", label: "Precio" },
                    { type: "select", name: "mode", label: "Modalidad", selectOptions: mode === "in-person" ? [{ label: "Presencial", value: "in-person" }, { label: "Virtual", value: "online" }] : [{ label: "Virtual", value: "online" }, { label: "Presencial", value: "in-person" }] },
                    { type: "number", name: "capacityPerShift", placeholder: "Capacidad de personas por turno", label: "Capacidad de personas por turno" },
                    { type: "number", name: "duration", placeholder: "Duración", label: "Duración (en minutos)" },
                    connectedWithMP ?
                        { type: "number", name: "signPrice", placeholder: "Precio de la seña", label: "Precio de la seña (Si no quieres cobrar señas para tus turnos deja '0')" }
                        :
                        { type: "none", name: "notConnectedWithMP", placeholder: "No puede cobrar señas", label: "Si quiere cobrar señas, vincule su cuenta de Mercado Pago." }
                ]}
                initialData={{ title, description, price, mode, duration, signPrice, capacityPerShift }}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => updateService(data)}
                disabledButtons={isLoading}
            />
        </>
    );
}

export default ServiceCard;
