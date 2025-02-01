import "./ServiceCard.css"
import Button from "../../../common/Button/Button"
import { useFetchData } from "../../../hooks/useFetchData"
import { BACKEND_API_URL } from "../../../config"
import { notifyError, notifySuccess } from "../../../utils/notifications"

interface Props {
    id: string
    duration: number
    price: number
    title: string
    description: string
    onDeleteService: (id: string, scheduledAppointmentsToDelete: string[]) => void
}

const ServiceCard: React.FC<Props> = ({ id, duration, price, title, description, onDeleteService }) => {

    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/delete-service/${id}`,
        "POST",
        true
    )

    if (error) {
        console.error(error)
        notifyError('Error del servidor: Inténtalo de nuevo más tarde')
    }

    const deleteService = async () => {
        const response = await fetchData({})
        console.log(response)
        if (response?.data) {
            onDeleteService(id, response.appointmentsToDelete)
            notifySuccess("Servicio eliminado")
        }
        if (response?.error) notifyError("Error al eliminar el servicio")
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
                    disabled={isLoading}
                >
                    Habilitar turnos
                </Button>
                <Button
                    fontSize="1.2rem"
                    padding=".8rem"
                    disabled={isLoading}
                >
                    Editar servicio
                </Button>
                <Button
                    fontSize="1.2rem"
                    padding=".8rem"
                    onSubmit={deleteService}
                    disabled={isLoading}
                >
                    Eliminar servicio
                </Button>
            </div>
        </div>
    );
}

export default ServiceCard;
