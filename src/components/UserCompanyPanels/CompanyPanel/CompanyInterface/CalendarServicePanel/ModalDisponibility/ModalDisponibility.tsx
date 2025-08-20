import "./ModalDisponibility.css"
import { useContext, useEffect } from "react";
import Button from "../../../../../../common/Button/Button";
import { AvailableAppointment } from "../../../../../../types";
import { formatDate } from "../../../../../../utils/formatDate";
import { useFetchData } from "../../../../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../../../../config";
import { notifyError } from "../../../../../../utils/notifications";
import { CompanyContext } from "../../../../../../contexts/CompanyContext";

interface Props {
    isOpen: boolean,
    appointment: AvailableAppointment | undefined
    serviceId: string
    setAvailableAppointments: React.Dispatch<React.SetStateAction<AvailableAppointment[]>>
    setScheduledAppointments: React.Dispatch<React.SetStateAction<string[]>>
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    setAppointment: React.Dispatch<React.SetStateAction<AvailableAppointment | undefined>>
}

const ModalDisponibility: React.FC<Props> = ({ isOpen, appointment, serviceId, setAvailableAppointments, setScheduledAppointments, setIsOpen, setAppointment }) => {
    const token = localStorage.getItem("access_token")
    const { state, updateServices } = useContext(CompanyContext)
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/delete-appointment/${serviceId}`,
        "DELETE",
        token
    )

    if (error) notifyError("Error al habilitar los turnos")

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("disponibility-modal-open")
        } else {
            document.body.classList.remove("disponibility-modal-open")
        }

        return () => document.body.classList.remove("disponibility-modal-open")
    }, [isOpen])

    if (!isOpen) return null

    const deleteAppointment = async (date: string, all: boolean) => {
        const response = await fetchData({ date, all })
        if (response.data) {
            setAppointment(response.data.appointment)
            setAvailableAppointments(response.data.service.availableAppointments)
            setScheduledAppointments(response.data.service.scheduledAppointments)
            updateServices(state.services.map(service => service._id === serviceId ? response.data.service : service))
        }
        if (response.error) notifyError("Error al eliminar turno")
    }

    const takenCount = appointment?.taken ?? 0
    const capacityCount = appointment?.capacity ?? 0
    const availableCount = Math.max(capacityCount - takenCount, 0)

    return (
        <div className="modalOverlayDisponibility">
            <div className="modalDisponibilityContent">
                <h2>Toca en un turno para eliminarlo</h2>
                <p className="h3ModalDisponibility">Disponibilidad para el día <span>{formatDate(appointment?.datetime.split(" ")[0] as string)}</span> a las <span>{appointment?.datetime.split(" ")[1]} hs</span></p>
                <div className="appointmentsDisponibilityContainer">
                    {Array.from({ length: takenCount }).map((_, index) => (
                        <div key={`t-${index}`} className="disponibilitySlot taken"
                            onClick={() => notifyError("No es posible eliminar un turno asignado desde este panel.")}
                        >
                            <h3>Ocupado</h3>
                        </div>
                    ))}
                    {Array.from({ length: availableCount }).map((_, index) => (
                        <div key={`a-${index}`} className="disponibilitySlot available"
                            onClick={() => {
                                if (!isLoading) deleteAppointment(appointment?.datetime as string, false)
                            }}
                        >
                            <h3>Disponible</h3>
                        </div>
                    ))}
                    <div className="addAvailable" >
                        <h3>+ Agregar disponible</h3>
                    </div>
                    <div className="addAvailable"
                        onClick={() => {
                            if (!isLoading) deleteAppointment(appointment?.datetime as string, true)
                        }}
                    >
                        <h3>🗑️ Eliminar todos los disponibles</h3>
                    </div>
                </div>
                <Button onSubmit={() => setIsOpen(false)} disabled={isLoading}>Aceptar</Button>
            </div>
        </div>
    );
}

export default ModalDisponibility;
