import "./AppointmentCard.css";
import Button from "../../../common/Button/Button";
import { parseDateToString } from "../../../utils/parseDateToString";
import { confirmDelete } from "../../../utils/alerts";
import { useFetchData } from "../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../config";
import { notifyError, notifySuccess } from "../../../utils/notifications";
import { formatDate } from "../../../utils/formatDate";
import LoadingModal from "../../../common/LoadingModal/LoadingModal";
import { Appointment, Service } from "../../../types";
import { CalendarOutlined } from "@ant-design/icons";
import moment from "moment";
import { useCompany } from "../../../hooks/useCompany";

interface Props {
    appointment: Appointment
    onCancelAppointment: (appointment: string, service: Service) => void
}

const AppointmentCard: React.FC<Props> = ({ appointment, onCancelAppointment }) => {
    const token = localStorage.getItem("access_token")
    const { deleteAppointment } = useCompany()
    const { error, isLoading, fetchData } = useFetchData(
        `${BACKEND_API_URL}/appointments/delete-appointment/${appointment._id}`,
        "DELETE",
        token
    )
    const { error: errorFinishAppointment, isLoading: isLoadingFinish, fetchData: fetchDataFinishAppointment } = useFetchData(
        `${BACKEND_API_URL}/appointments/finish-appointment/${appointment._id}`,
        "PUT",
        token
    )
    if (error) notifyError("Error al cancelar turno. Inténtalo de nuevo más tarde.")
    if (errorFinishAppointment) notifyError("Error al finalizar turno. Inténtalo de nuevo más tarde.")

    const { stringDate, time } = parseDateToString(appointment.date)
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
            const response = await fetchData({})
            if (response.data) {
                onCancelAppointment(
                    response.data.appointment._id,
                    response.data.service
                )
                notifySuccess("Turno cancelado con éxito.")
            }
            if (response.error) {
                notifyError(response.error)
            }
        }
    }
    const handleFinishAppointment = async () => {
        const response = await fetchDataFinishAppointment({})
        if (response.data) {
            deleteAppointment(appointment._id)
            notifySuccess("Turno finalizado.")
        }
        if (response.error) {
            notifyError(response.error)
        }
    }

    return (
        <>
            <div className="card-appointment-container">
                <div className="card-appointment-item">
                    <div className="card-appointment-header">
                        <div className="card-client-info">
                            <div className="divTitleAndTodayContainer">
                                <h3 className="card-client-name">{`${appointment.name} ${appointment.lastName}`}</h3>
                                {moment(appointment.date).isSame(moment(), 'day') && <span className="todayAppointmentSpan">Hoy</span>}
                                {appointment.totalPaidAmount && <span className="totalPaidAmountSpan">Seña de ${appointment.totalPaidAmount}</span>}
                            </div>
                            <p className="card-client-email">{appointment.email}</p>
                            {appointment.phone && <p className="card-client-phone">{appointment.phone}</p>}
                            <p className="card-client-phone">DNI: {appointment.dni}</p>
                        </div>
                        <div className="card-appointment-details">
                            <div className="card-service-info">
                                <h4 className="card-service-title">{appointment.serviceId.title}</h4>
                                <p className="card-service-duration">Duración: {appointment.serviceId.duration} min</p>
                                <p className="card-service-price">Precio: ${appointment.serviceId.price}</p>
                            </div>
                        </div>
                    </div>
                    <div className="divButtonsAndDateContainer">
                        <div className="card-date-time-info">
                            <p className="card-appointment-date">
                                <CalendarOutlined /> {formattedDate} {time}
                            </p>
                        </div>
                        <Button
                            backgroundColor="green"
                            fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                            onSubmit={handleFinishAppointment}
                            fontWeight="600"
                            padding=".8rem"
                            margin="0 0 0 0"
                        >
                            Finalizar
                        </Button>
                        <Button
                            backgroundColor="red"
                            fontWeight="600"
                            onSubmit={handleCancelAppointment}
                            fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                            padding=".8rem"
                            margin="0 0 0 0"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </div>
            <LoadingModal
                text={isLoading ? "Cancelando..." : "Finalizando..."}
                isOpen={isLoading || isLoadingFinish}
            />
        </>

    );
}

export default AppointmentCard;
