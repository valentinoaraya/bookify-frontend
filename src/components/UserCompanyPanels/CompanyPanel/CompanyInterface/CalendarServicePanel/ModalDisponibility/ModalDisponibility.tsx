import "./ModalDisponibility.css"
import { useContext, useEffect } from "react";
import Button from "../../../../../../common/Button/Button";
import { type AvailableAppointmentWithPendings } from "../../../../../../types";
import { formatDate } from "../../../../../../utils/formatDate";
import { BACKEND_API_URL } from "../../../../../../config";
import { notifyError, notifyWarn } from "../../../../../../utils/notifications";
import { CompanyContext } from "../../../../../../contexts/CompanyContext";
import { useAuthenticatedDelete, useAuthenticatedPost } from "../../../../../../hooks/useAuthenticatedFetch";

interface Props {
    isOpen: boolean,
    appointment: AvailableAppointmentWithPendings | undefined
    serviceId: string
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    setAppointment: React.Dispatch<React.SetStateAction<AvailableAppointmentWithPendings | undefined>>
}

const ModalDisponibility: React.FC<Props> = ({ isOpen, appointment, serviceId, setIsOpen, setAppointment }) => {
    const { updateServices } = useContext(CompanyContext)

    const { isLoading, error, delete: del } = useAuthenticatedDelete()
    const { isLoading: isLoadingAddApp, error: errorAddApp, post } = useAuthenticatedPost()
    const urlDeleteAppointment = `${BACKEND_API_URL}/services/delete-appointment/${serviceId}`
    const urlAddEnableAppointment = `${BACKEND_API_URL}/services/add-enable-appointment/${serviceId}`

    if (error || errorAddApp) notifyError("Error al modificar los turnos")

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
        const response = await del(urlDeleteAppointment, { date, all })
        if (response.data) {
            setAppointment({ ...response.data.data.appointment, pendings: pendingCount })
            updateServices(response.data.data.service)
        }
        if (response.error) notifyError("Error al eliminar turno")
    }

    const addAppointment = async (date: string) => {
        const response = await post(urlAddEnableAppointment, { date })
        if (response.data) {
            setAppointment({ ...response.data.data.appointment, pendings: pendingCount })
            updateServices(response.data.data.service)
        }
        if (response.error) notifyError("Error al habilitar turno")
    }

    const takenCount = appointment?.taken ?? 0
    const capacityCount = appointment?.capacity ?? 0
    const pendingCount = appointment?.pendings ?? 0
    const availableCount = Math.max(capacityCount - takenCount - pendingCount, 0)

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
                                if (!isLoading && !isLoadingAddApp) deleteAppointment(appointment?.datetime as string, false)
                            }}
                        >
                            <h3>Disponible</h3>
                        </div>
                    ))}
                    {Array.from({ length: pendingCount }).map((_, index) => (
                        <div key={`a-${index}`} className="disponibilitySlot pending"
                            onClick={() => { notifyWarn("Se está esperando un pago para este turno. Si no se acredita en unos minutos, volverá a estar disponible.") }}
                        >
                            <h3>Pendiente de pago</h3>
                        </div>
                    ))}
                    <div className="addAvailable"
                        onClick={() => {
                            if (!isLoading && !isLoadingAddApp) addAppointment(appointment?.datetime as string)
                        }}
                    >
                        <h3>+ Agregar disponible</h3>
                    </div>
                    <div className="addAvailable"
                        onClick={() => {
                            if (!isLoading && !isLoadingAddApp && availableCount !== 0) deleteAppointment(appointment?.datetime as string, true)
                        }}
                    >
                        <h3>🗑️ Eliminar todos los disponibles</h3>
                    </div>
                </div>
                <Button onSubmit={() => setIsOpen(false)} disabled={isLoading || isLoadingAddApp}>Aceptar</Button>
            </div>
        </div>
    );
}

export default ModalDisponibility;
