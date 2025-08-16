import "./AppointmentCard.css";
import Button from "../../../common/Button/Button";
import { parseDateToString } from "../../../utils/parseDateToString";
import { confirmDelete } from "../../../utils/alerts";
import { useFetchData } from "../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../config";
import { notifyError, notifySuccess } from "../../../utils/notifications";
import { type Appointment, type Company } from "../../../types";
import { formatDate } from "../../../utils/formatDate";
import LoadingModal from "../../../common/LoadingModal/LoadingModal";
import { useState } from "react";

interface Props {
    _id: string;
    title: string;
    date: string;
    serviceId: string;
    todayAppointment?: boolean;
    client?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientDNI?: string;
    state: Company;
    onCancelAppointment: (appointments: Appointment[], appointmentToDelete: string, serviceId: string) => void;
}

const AppointmentCard: React.FC<Props> = ({
    _id,
    serviceId,
    todayAppointment,
    title,
    date,
    client,
    clientEmail,
    clientPhone,
    clientDNI,
    state,
    onCancelAppointment
}) => {
    const token = localStorage.getItem("access_token")
    const { error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/appointments/delete-appointment/${_id}`,
        "DELETE",
        token
    )
    const [isOpen, setIsOpen] = useState(false)

    if (error) notifyError("Error al cancelar turno. Inténtalo de nuevo más tarde.")

    const { stringDate, time } = parseDateToString(date)
    const formattedDate = formatDate(stringDate)
    const handleCancelAppointment = async () => {
        const confirm = await confirmDelete({
            question: "¿Seguro que desea cancelar el turno?",
            mesasge: "Si cobraste una seña por este turno, se le devolverá el dinero al cliente.",
            icon: "warning",
            cancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Aceptar"
        })
        if (confirm) {
            setIsOpen(true)
            const response = await fetchData({})
            if (response.data) {
                onCancelAppointment(
                    state.scheduledAppointments.filter(appointment => appointment._id !== response.data._id)
                    , `${stringDate} ${time}`, serviceId
                )
                notifySuccess("Turno cancelado con éxito.")
            }
            if (response.error) {
                notifyError(response.error)
            }
            setIsOpen(false)
        }
    }

    return (
        <div className="appointmentCard">
            <div className="divTitleAndTodayContainer">
                <h2 className="titleService">{client}</h2>
                {todayAppointment && <span className="todayAppointmentSpan">Hoy</span>}
            </div>
            <div className="divDataContainerAppointmentCard">
                <div>
                    <p className="parrafAppointment"><span>Teléfono:</span> {clientPhone}</p>
                    <p className="parrafAppointment"><span>Email:</span> {clientEmail}</p>
                    <p className="parrafAppointment"><span>DNI:</span> {clientDNI}</p>
                </div>
                <div>
                    <p className="parrafAppointment"><span>Servicio:</span> {title}</p>
                    <p className="parrafAppointment"><span>Fecha:</span> {formattedDate}</p>
                    <p className="parrafAppointment"><span>Horario:</span> {time} hs</p>
                </div>
                <div className="divButtonsContainerAppointmentCard">
                    <Button
                        backgroundColor="green"
                        fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                        padding=".8rem"
                        margin="0 0 0 0"
                    >
                        Finalizar
                    </Button>
                    <Button
                        backgroundColor="red"
                        onSubmit={handleCancelAppointment}
                        fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                        padding=".8rem"
                        margin="0 0 0 0"
                    >
                        Cancelar
                    </Button>
                </div>
            </div>
            <LoadingModal
                text="Cancelando..."
                isOpen={isOpen}
            />
        </div>
    );
}

export default AppointmentCard;
