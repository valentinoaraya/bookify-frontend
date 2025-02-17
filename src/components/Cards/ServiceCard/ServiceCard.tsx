import "./ServiceCard.css"
import Button from "../../../common/Button/Button"
import { useFetchData } from "../../../hooks/useFetchData"
import { BACKEND_API_URL } from "../../../config"
import { notifyError, notifySuccess } from "../../../utils/notifications"
import { confirmDelete } from "../../../utils/alerts"
import ModalForm from "../../ModalForm/ModalForm"
import { useState } from "react"
import { View } from "../../../types"

interface Props {
    id: string
    duration: number
    price: number
    title: string
    description: string
    onDeleteService: (id: string, scheduledAppointmentsToDelete: string[]) => void
    onUpdateService: (data: { [key: string]: any }) => void
    onRedirectToCalendar: (id: string, view: View) => void
}

const ServiceCard: React.FC<Props> = ({ id, duration, price, title, description, onDeleteService, onUpdateService, onRedirectToCalendar }) => {

    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/delete-service/${id}`,
        "DELETE",
        true
    )

    const { isLoading: isLoadingUpdate, error: errorUpdate, fetchData: fetchDataUpdate } = useFetchData(
        `${BACKEND_API_URL}/services/edit-service/${id}`,
        "PUT",
        true
    )

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
            cancelButtonText: "Cancelar"
        })
        if (deleteConfirmed) {
            const response = await fetchData({})
            if (response?.data) {
                onDeleteService(id, response.appointmentsToDelete)
                notifySuccess("Servicio eliminado")
            }
            if (response?.error) notifyError("Error al eliminar el servicio")
        }
    }

    const updateService = async (data: { [key: string]: any }) => {
        const response = await fetchDataUpdate(data)
        setIsModalOpen(false)
        if (response?.data) {
            onUpdateService(response.data)
            notifySuccess("Servicio actualizado")
        }
        if (response?.error) notifyError("Error al actualizar el servicio")
    }

    return (
        <div className="serviceCard">
            <div className="dataService">
                <h2 className="titleService">{title}</h2>
                <p className="parrafService"><span>Duración:</span> {duration} hs</p>
                <p className="parrafService"><span>Precio:</span> ${price}</p>
                <p className="parrafService">{description}</p>
            </div>
            <div className="divButtons">
                <Button
                    fontSize="1.2rem"
                    padding=".8rem"
                    disabled={isLoading || isLoadingUpdate}
                    onSubmit={() => onRedirectToCalendar(id, "calendar")}
                >
                    Habilitar turnos
                </Button>
                <Button
                    fontSize="1.2rem"
                    padding=".8rem"
                    disabled={isLoading || isLoadingUpdate}
                    onSubmit={() => setIsModalOpen(true)}
                >
                    Editar servicio
                </Button>
                <Button
                    fontSize="1.2rem"
                    padding=".8rem"
                    onSubmit={deleteService}
                    disabled={isLoading || isLoadingUpdate}
                >
                    Eliminar servicio
                </Button>
            </div>
            <ModalForm
                title="Editar servicio"
                isOpen={isModalOpen}
                inputs={[
                    { type: "text", name: "title", placeholder: "Título" },
                    { type: "text", name: "description", placeholder: "Descripción" },
                    { type: "number", name: "price", placeholder: "Precio" },
                    { type: "number", name: "duration", placeholder: "Duración" }
                ]}
                initialData={{ title, description, price, duration }}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => updateService(data)}
                disabledButtons={isLoading}
            />
        </div>
    );
}

export default ServiceCard;
