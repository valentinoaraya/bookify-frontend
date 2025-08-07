import "./ServiceCard.css"
import Button from "../../../common/Button/Button"
import { useFetchData } from "../../../hooks/useFetchData"
import { BACKEND_API_URL } from "../../../config"
import { notifyError, notifySuccess } from "../../../utils/notifications"
import { confirmDelete } from "../../../utils/alerts"
import ModalForm from "../../ModalForm/ModalForm"
import { useState } from "react"
import { View } from "../../../types"
import { ClockIcon } from "../../../common/Icons/Icons"

interface Props {
    id: string
    duration: number
    price: number
    title: string
    description: string
    signPrice: number
    connectedWithMP: boolean
    onDeleteService: (id: string, scheduledAppointmentsToDelete: string[]) => void
    onUpdateService: (data: { [key: string]: any }) => void
    onRedirectToCalendar: (id: string, view: View) => void
}

const ServiceCard: React.FC<Props> = ({ id, duration, price, title, description, signPrice, connectedWithMP, onDeleteService, onUpdateService, onRedirectToCalendar }) => {

    const token = localStorage.getItem("access_token")
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/delete-service/${id}`,
        "DELETE",
        token
    )

    const { isLoading: isLoadingUpdate, error: errorUpdate, fetchData: fetchDataUpdate } = useFetchData(
        `${BACKEND_API_URL}/services/edit-service/${id}`,
        "PUT",
        token
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
            cancelButton: true,
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
        console.log(response.data)
        setIsModalOpen(false)
        if (response?.data) {
            onUpdateService(response.data)
            notifySuccess("Servicio actualizado")
        }
        if (response?.error) notifyError("Error al actualizar el servicio")
    }

    return (
        <div className="serviceCard">
            <h2 className="titleService">{title}</h2>
            <div className="dataService">
                <p className="parrafService">{description}</p>
                {signPrice !== 0 ? <p className="parrafService"><span>Precio de la seña:</span> $ {signPrice}</p> : <p className="parrafService"><span>Sin seña</span></p>}
                <div className="durationPriceContainer">
                    <div className="divDuration">
                        <ClockIcon
                            width="18px"
                            height="18px"
                            fill="grey"
                        />
                        <p className="parrafDuration">{duration} min</p>
                    </div>
                    <p className="parrafPrice"><span className="spanPrice">$</span> {price}</p>
                </div>
            </div>
            <div className="divButtons">
                <Button
                    fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                    padding=".8rem"
                    disabled={isLoading || isLoadingUpdate}
                    onSubmit={() => onRedirectToCalendar(id, "calendar")}
                >
                    Habilitar turnos
                </Button>
                <Button
                    fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                    padding=".8rem"
                    disabled={isLoading || isLoadingUpdate}
                    onSubmit={() => setIsModalOpen(true)}
                >
                    Editar servicio
                </Button>
                <Button
                    fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
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
                    { type: "text", name: "title", placeholder: "Título", label: "Título" },
                    { type: "text", name: "description", placeholder: "Descripción", label: "Descripción" },
                    { type: "number", name: "price", placeholder: "Precio", label: "Precio" },
                    { type: "number", name: "duration", placeholder: "Duración", label: "Duración (en minutos)" },
                    connectedWithMP ?
                        { type: "number", name: "signPrice", placeholder: "Precio de la seña", label: "Precio de la seña (Si no quieres cobrar señas para tus turnos deja '0')" }
                        :
                        { type: "none", name: "notConnectedWithMP", placeholder: "No puede cobrar señas", label: "Si quiere cobrar señas, vincule su cuenta de Mercado Pago." }
                ]}
                initialData={{ title, description, price, duration, signPrice }}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => updateService(data)}
                disabledButtons={isLoading}
            />
        </div>
    );
}

export default ServiceCard;
