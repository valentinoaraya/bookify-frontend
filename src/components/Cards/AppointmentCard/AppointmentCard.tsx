import "./AppointmentCard.css";
import Button from "../../../common/Button/Button";
import { parseDateToString } from "../../../utils/parseDateToString";
import { confirmDelete } from "../../../utils/alerts";
import { BACKEND_API_URL } from "../../../config";
import { notifyError, notifySuccess } from "../../../utils/notifications";
import { formatDate } from "../../../utils/formatDate";
import LoadingModal from "../../../common/LoadingModal/LoadingModal";
import { Appointment, Service } from "../../../types";
import { CalendarOutlined } from "@ant-design/icons";
import moment from "moment";
import { useCompany } from "../../../hooks/useCompany";
import { useAuthenticatedDelete, useAuthenticatedPut } from "../../../hooks/useAuthenticatedFetch";

interface Props {
    appointment: Appointment
    onCancelAppointment: (appointment: string, service: Service) => void
}

const AppointmentCard: React.FC<Props> = ({ appointment, onCancelAppointment }) => {
    const { deleteAppointment } = useCompany()
    const { error, isLoading, delete: del } = useAuthenticatedDelete()
    const { error: errorFinishAppointment, isLoading: isLoadingFinish, put } = useAuthenticatedPut()
    const { isLoading: isLoadingChangeStatus, error: errorChangeStatus, put: changeStatus } = useAuthenticatedPut()
    const urlDeleteAppointment = `${BACKEND_API_URL}/appointments/delete-appointment/${appointment._id}`
    const urlFinishAppointment = `${BACKEND_API_URL}/appointments/finish-appointment/${appointment._id}`
    const urlChangeStatus = `${BACKEND_API_URL}/appointments/change-status`

    if (error) notifyError("Error al cancelar turno. Inténtalo de nuevo más tarde.")
    if (errorFinishAppointment) notifyError("Error al finalizar turno. Inténtalo de nuevo más tarde.")
    if (errorChangeStatus) notifyError("Error al cambiar el estado del turno. Inténtalo de nuevo más tarde.")

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
            const response = await del(urlDeleteAppointment, {})
            if (response.data) {
                onCancelAppointment(
                    response.data.data.appointment._id,
                    response.data.data.service
                )
                notifySuccess("Turno cancelado con éxito.")
            }
            if (response.error) {
                notifyError(response.error)
            }
        }
    }

    const handleFinishAppointment = async () => {
        const response = await put(urlFinishAppointment, {})
        if (response.data) {
            deleteAppointment(appointment._id)
            notifySuccess("Turno finalizado.")
        }
        if (response.error) {
            notifyError(response.error)
        }
    }

    const handleChangeStatusAppointment = async () => {
        const response = await changeStatus(urlChangeStatus, {
            appointmentId: appointment._id,
            status: "did_not_attend"
        })
        if (response.data) {
            deleteAppointment(appointment._id)
            notifySuccess("Turno modificado.")
        }
        if (response.error) {
            notifyError(response.error)
        }
    }

    return (
        <>
            <div className="card-appointment-container">
                <div className="card-appointment-item">
                    <div className="cardAppointmentNameAndDateContainer">
                        <div className="divTitleAndTodayContainer mobile">
                            <h3 className="card-client-name">{`${appointment.name} ${appointment.lastName}`}</h3>
                            {moment(appointment.date).isSame(moment(), 'day') && <span className="todayAppointmentSpan">Hoy</span>}
                        </div>
                        <div className="card-date-time-info mobile">
                            <p className="card-appointment-date">
                                <CalendarOutlined /> {formattedDate} {time}
                            </p>
                        </div>
                    </div>
                    <div className="card-appointment-main">
                        <div className="card-appointment-header">
                            <div className="card-client-info">
                                <div className="divTitleAndTodayContainer">
                                    <h3 className="card-client-name">{`${appointment.name} ${appointment.lastName}`}</h3>
                                    {moment(appointment.date).isSame(moment(), 'day') && <span className="todayAppointmentSpan">Hoy</span>}
                                </div>
                                <p className="card-client-email">{appointment.email}</p>
                                {appointment.phone && <p className="card-client-phone">{appointment.phone}</p>}
                                <p className="card-client-phone">DNI: {appointment.dni}</p>
                            </div>
                        </div>
                        <div className="card-appointment-details">
                            <div className="card-service-info">
                                <h4 className="card-service-title">{appointment.serviceId.title}</h4>
                                <div className={`appointment-mode ${appointment.mode === "in-person" ? "presencial" : "virtual"}`}>
                                    <span className="appointment-mode-dot"></span>
                                    <span className="appointment-mode-label">Modalidad</span>
                                    <span className="appointment-mode-value">{appointment.mode === "in-person" ? "Presencial" : "Virtual"}</span>
                                </div>
                                <p className="card-service-duration">Duración: {appointment.duration} min</p>
                                <p className="card-service-price">Precio: ${appointment.price}</p>
                                {appointment.totalPaidAmount && <p className="card-service-sign-price">Seña: ${appointment.totalPaidAmount}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="card-appointment-header desktop">
                        <div className="card-client-info">
                            <div className="divTitleAndTodayContainer">
                                <h3 className="card-client-name">{`${appointment.name} ${appointment.lastName}`}</h3>
                                {moment(appointment.date).isSame(moment(), 'day') && <span className="todayAppointmentSpan">Hoy</span>}
                            </div>
                            <p className="card-client-email">{appointment.email}</p>
                            {appointment.phone && <p className="card-client-phone">{appointment.phone}</p>}
                            <p className="card-client-phone">DNI: {appointment.dni}</p>
                        </div>
                    </div>
                    <div className="card-appointment-details desktop">
                        <div className="card-service-info">
                            <h4 className="card-service-title">{appointment.serviceId.title}</h4>
                            <div className={`appointment-mode ${appointment.mode === "in-person" ? "presencial" : "virtual"}`}>
                                <span className="appointment-mode-dot"></span>
                                <span className="appointment-mode-label">Modalidad</span>
                                <span className="appointment-mode-value">{appointment.mode === "in-person" ? "Presencial" : "Virtual"}</span>
                            </div>
                            <p className="card-service-duration">Duración: {appointment.duration} min</p>
                            <p className="card-service-price">Precio: ${appointment.price}</p>
                            {appointment.totalPaidAmount && <p className="card-service-sign-price">Seña: ${appointment.totalPaidAmount}</p>}
                        </div>
                    </div>
                    <div className="divButtonsAndDateContainer">
                        <div className="card-date-time-info">
                            <p className="card-appointment-date">
                                <CalendarOutlined /> {formattedDate} {time}
                            </p>
                        </div>
                        <Button
                            backgroundColor="#3f9f0f"
                            fontSize={"1rem"}
                            onSubmit={handleFinishAppointment}
                            fontWeight="600"
                            padding=".5rem"
                            margin="0 0 0 0"
                        >
                            Finalizar
                        </Button>
                        <button
                            className={`button-no-show-appointment ${new Date(appointment.date) > new Date() ? "disabled" : ""}`}
                            onClick={() => {
                                if (new Date(appointment.date) > new Date()) {
                                    return;
                                }
                                handleChangeStatusAppointment()
                            }}
                        >
                            No asistió
                        </button>
                        <Button
                            backgroundColor="red"
                            fontWeight="600"
                            onSubmit={handleCancelAppointment}
                            fontSize={"1rem"}
                            padding=".5rem"
                            margin="0 0 0 0"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </div>
            <LoadingModal
                text={isLoading ? "Cancelando..." : isLoadingFinish ? "Finalizando..." : "Cargando..."}
                isOpen={isLoading || isLoadingFinish || isLoadingChangeStatus}
            />
        </>

    );
}

export default AppointmentCard;
