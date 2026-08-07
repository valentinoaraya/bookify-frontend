import "./AppointmentCard.css";
import Button from "../../../common/Button/Button";
import { parseDateToString } from "../../../utils/parseDateToString";
import { confirmDelete } from "../../../utils/alerts";
import { notifyError, notifySuccess } from "../../../utils/notifications";
import LoadingModal from "../../../common/LoadingModal/LoadingModal";
import { Appointment, Service } from "../../../types";
import { useCompany } from "../../../hooks/useCompany";
import { useState } from "react";
import {
    changeAppointmentStatus,
    deleteAppointment as deleteAppointmentApi,
    finishAppointment,
} from "@/shared/api/appointments";

interface Props {
    appointment: Appointment
    onCancelAppointment: (appointment: string, service: Service) => void
}

const modeLabel: Record<Appointment["mode"], string> = {
    "in-person": "Presencial",
    online: "Virtual",
    "in-person-at-home": "A domicilio",
}

const AppointmentCard: React.FC<Props> = ({ appointment, onCancelAppointment }) => {
    const { deleteAppointment } = useCompany()
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingFinish, setIsLoadingFinish] = useState(false)
    const [isLoadingChangeStatus, setIsLoadingChangeStatus] = useState(false)
    const [detailsOpen, setDetailsOpen] = useState(false)

    const { time } = parseDateToString(appointment.date)
    const serviceTitle =
        typeof appointment.serviceId === "object"
            ? appointment.serviceId.title
            : appointment.service?.title
    const isFuture = new Date(appointment.date) > new Date()

    const handleCancelAppointment = async () => {
        const confirm = await confirmDelete({
            question: "¿Seguro que desea cancelar el turno?",
            message: "Si cobraste una seña por este turno, se le devolverá el dinero al cliente.",
            icon: "warning",
            cancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Aceptar"
        })
        if (confirm) {
            setIsLoading(true)
            try {
                const response = await deleteAppointmentApi(appointment._id)
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
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleFinishAppointment = async () => {
        setIsLoadingFinish(true)
        try {
            const response = await finishAppointment(appointment._id)
            if (response.data) {
                deleteAppointment(appointment._id)
                notifySuccess("Turno finalizado.")
            }
            if (response.error) {
                notifyError(response.error)
            }
        } finally {
            setIsLoadingFinish(false)
        }
    }

    const handleChangeStatusAppointment = async () => {
        setIsLoadingChangeStatus(true)
        try {
            const response = await changeAppointmentStatus({
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
        } finally {
            setIsLoadingChangeStatus(false)
        }
    }

    return (
        <>
            <article className={`agendaRow ${detailsOpen ? "is-open" : ""}`}>
                <div className="agendaRowMain">
                    <time className="agendaRowTime" dateTime={appointment.date}>
                        <span className="agendaRowTimeValue">{time}</span>
                        <span className="agendaRowTimeUnit">hs</span>
                    </time>

                    <div className="agendaRowClient">
                        <h3 className="agendaRowClientName">
                            {appointment.name} {appointment.lastName}
                        </h3>
                        <p className="agendaRowMeta">
                            <span className="agendaRowService">{serviceTitle}</span>
                            <span className="agendaRowDot" aria-hidden="true">·</span>
                            <span className={`agendaRowMode agendaRowMode--${appointment.mode === "online" ? "online" : "presencial"}`}>
                                {modeLabel[appointment.mode]}
                            </span>
                            <span className="agendaRowDot" aria-hidden="true">·</span>
                            <span>{appointment.duration} min</span>
                        </p>
                    </div>

                    <div className="agendaRowActions">
                        <Button
                            variant="success"
                            fontSize="0.88rem"
                            onSubmit={handleFinishAppointment}
                            fontWeight="600"
                            padding="0.45rem 0.9rem"
                            margin="0"
                            width="auto"
                        >
                            Finalizar
                        </Button>
                        <button
                            type="button"
                            className="agendaRowToggle"
                            aria-expanded={detailsOpen}
                            aria-label={detailsOpen ? "Ocultar detalles" : "Ver detalles"}
                            onClick={() => setDetailsOpen((open) => !open)}
                        >
                            {detailsOpen ? "Menos" : "Detalles"}
                            <span className={`agendaRowChevron ${detailsOpen ? "is-open" : ""}`} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {detailsOpen && (
                    <div className="agendaRowDetails">
                        <dl className="agendaRowDetailsGrid">
                            <div className="agendaRowDetailsWide">
                                <dt>Email</dt>
                                <dd>{appointment.email}</dd>
                            </div>
                            {appointment.phone && (
                                <div>
                                    <dt>Teléfono</dt>
                                    <dd>{appointment.phone}</dd>
                                </div>
                            )}
                            <div>
                                <dt>DNI</dt>
                                <dd>{appointment.dni}</dd>
                            </div>
                            <div>
                                <dt>Precio</dt>
                                <dd>${appointment.price}</dd>
                            </div>
                            {appointment.totalPaidAmount != null && appointment.totalPaidAmount > 0 && (
                                <div>
                                    <dt>Seña</dt>
                                    <dd>${appointment.totalPaidAmount}</dd>
                                </div>
                            )}
                            {appointment.userLocation && (
                                <div className="agendaRowDetailsFull">
                                    <dt>Domicilio</dt>
                                    <dd>
                                        <button
                                            type="button"
                                            className="agendaRowLocation"
                                            onClick={() =>
                                                window.open(
                                                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.userLocation!)}`,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            {appointment.userLocation}
                                        </button>
                                    </dd>
                                </div>
                            )}
                            {appointment.location && (
                                <div className="agendaRowDetailsFull">
                                    <dt>Sede</dt>
                                    <dd>
                                        <button
                                            type="button"
                                            className="agendaRowLocation"
                                            onClick={() =>
                                                window.open(
                                                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                        `${appointment.location!.street} ${appointment.location!.number} ${appointment.location!.city}`
                                                    )}`,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            {appointment.location.name} · {appointment.location.street}{" "}
                                            {appointment.location.number}, {appointment.location.city}
                                        </button>
                                    </dd>
                                </div>
                            )}
                        </dl>

                        <div className="agendaRowSecondaryActions">
                            <button
                                type="button"
                                className={`button-no-show-appointment ${isFuture ? "disabled" : ""}`}
                                disabled={isFuture}
                                title={isFuture ? "Disponible cuando llegue la hora del turno" : undefined}
                                onClick={() => {
                                    if (isFuture) return
                                    handleChangeStatusAppointment()
                                }}
                            >
                                No asistió
                            </button>
                            <Button
                                variant="danger-ghost"
                                fontWeight="600"
                                onSubmit={handleCancelAppointment}
                                fontSize="0.88rem"
                                padding="0.45rem 0.9rem"
                                margin="0"
                                width="auto"
                            >
                                Cancelar turno
                            </Button>
                        </div>
                    </div>
                )}
            </article>
            <LoadingModal
                text={isLoading ? "Cancelando..." : isLoadingFinish ? "Finalizando..." : "Cargando..."}
                isOpen={isLoading || isLoadingFinish || isLoadingChangeStatus}
            />
        </>
    );
}

export default AppointmentCard;
