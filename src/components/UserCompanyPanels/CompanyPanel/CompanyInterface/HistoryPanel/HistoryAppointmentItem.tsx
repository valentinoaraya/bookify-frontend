import { Appointment } from "../../../../../types";
import { changeAppointmentStatus } from "@/shared/api/appointments";
import { useState, SetStateAction } from "react";
import Button from "../../../../../common/Button/Button";
import isBetween from "dayjs/plugin/isBetween";
import dayjs from "dayjs";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
dayjs.extend(isBetween);

interface Props {
    appointment: Appointment
    setFilteredAppointments: React.Dispatch<SetStateAction<Appointment[]>>
    setPendingAppointments: React.Dispatch<SetStateAction<Appointment[]>>
    setCopyOfFilteredAppointments: React.Dispatch<SetStateAction<Appointment[]>>
    setIsFilteredPendingAppointments: React.Dispatch<SetStateAction<boolean>>
    setStatistics: React.Dispatch<SetStateAction<{
        totalAppointments: number;
        mostPopularService: string;
        totalIncome: number;
        finishedAppointmentsPercentage: number
    }>>
}

const modeLabel: Record<Appointment["mode"], string> = {
    "in-person": "Presencial",
    online: "Virtual",
    "in-person-at-home": "A domicilio",
}

const statusLabel = (appointment: Appointment): string => {
    if (appointment.status === "finished") return "Finalizado"
    if (appointment.status === "cancelled") {
        return `Cancelado por ${appointment.cancelledBy === "company" ? "ti" : appointment.name}`
    }
    if (appointment.status === "pending_action") return "Pendiente"
    if (appointment.status === "did_not_attend") return "No asistió"
    return appointment.status
}

const HistoryAppointmentItem: React.FC<Props> = ({
    appointment,
    setFilteredAppointments,
    setPendingAppointments,
    setCopyOfFilteredAppointments,
    setIsFilteredPendingAppointments,
    setStatistics,
}) => {
    const time = dayjs(appointment.date).format("HH:mm")
    const dateLabel = dayjs(appointment.date).format("DD/MM/YYYY")
    const isPendingAction = appointment.status === "pending_action"
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const serviceTitle =
        appointment.serviceInfo?.title
            ? appointment.serviceInfo.title
            : typeof appointment.serviceId === "object"
                ? appointment.serviceId.title
                : ""

    const handleChangeStatus = async (status: "finished" | "did_not_attend") => {
        setIsLoading(true)
        try {
            const response = await changeAppointmentStatus({
                appointmentId: appointment._id,
                status
            })
            if (response.data) {
                const updated = response.data.data as Appointment
                setFilteredAppointments(prev => prev.map(app => {
                    if (app._id === updated._id) {
                        return { ...app, status: updated.status }
                    }
                    return app
                }))
                setCopyOfFilteredAppointments(prev => prev.map(app => {
                    if (app._id === updated._id) {
                        return { ...app, status: updated.status }
                    }
                    return app
                }))
                setPendingAppointments(prev => prev.filter(apt => apt._id !== updated._id))
                setIsFilteredPendingAppointments(false)
                if (dayjs(appointment.date).isBetween(dayjs().startOf('month'), dayjs().endOf('month'), null, '[]') && status === "finished") {
                    setStatistics(prev => ({
                        ...prev,
                        totalIncome: prev.totalIncome + appointment.price + (appointment.totalPaidAmount || 0)
                    }))
                }
                notifySuccess("Cambio confirmado.")
            }
            if (response.error) {
                notifyError(response.error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <article className={`historyAgendaRow ${appointment.status} ${detailsOpen ? "is-open" : ""}`}>
            <div className="historyAgendaRowMain">
                <div className="historyAgendaWhen">
                    <time className="historyAgendaTime" dateTime={appointment.date}>
                        <span className="historyAgendaTimeValue">{time}</span>
                        <span className="historyAgendaTimeUnit">hs</span>
                    </time>
                    <span className="historyAgendaDate">{dateLabel}</span>
                </div>

                <div className="historyAgendaClient">
                    <h3 className="historyAgendaClientName">
                        {appointment.name} {appointment.lastName}
                    </h3>
                    <p className="historyAgendaMeta">
                        <span className="historyAgendaService">{serviceTitle}</span>
                        <span className="historyAgendaDot" aria-hidden="true">·</span>
                        <span className={`historyAgendaMode historyAgendaMode--${appointment.mode === "online" ? "online" : "presencial"}`}>
                            {modeLabel[appointment.mode]}
                        </span>
                        <span className="historyAgendaDot" aria-hidden="true">·</span>
                        <span>{appointment.duration} min</span>
                    </p>
                </div>

                <div className="historyAgendaRight">
                    <span className={`divStatusAppointment ${appointment.status}`}>
                        {statusLabel(appointment)}
                    </span>

                    {isPendingAction && (
                        <div className="historyAgendaPendingActions">
                            <Button
                                margin="0"
                                padding="0.4rem 0.75rem"
                                fontWeight="600"
                                fontSize="0.82rem"
                                onSubmit={() => handleChangeStatus("finished")}
                                variant="success"
                                width="auto"
                                loading={isLoading}
                            >
                                Finalizó
                            </Button>
                            <Button
                                margin="0"
                                padding="0.4rem 0.75rem"
                                fontWeight="600"
                                fontSize="0.82rem"
                                variant="neutral"
                                width="auto"
                                loading={isLoading}
                                onSubmit={() => handleChangeStatus("did_not_attend")}
                            >
                                No asistió
                            </Button>
                        </div>
                    )}

                    <button
                        type="button"
                        className="historyAgendaToggle"
                        aria-expanded={detailsOpen}
                        aria-label={detailsOpen ? "Ocultar detalles" : "Ver detalles"}
                        onClick={() => setDetailsOpen((open) => !open)}
                    >
                        {detailsOpen ? "Menos" : "Detalles"}
                        <span className={`historyAgendaChevron ${detailsOpen ? "is-open" : ""}`} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {detailsOpen && (
                <div className="historyAgendaDetails">
                    <dl className="historyAgendaDetailsGrid">
                        <div>
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
                            <div className="historyAgendaDetailsFull">
                                <dt>Domicilio</dt>
                                <dd>
                                    <button
                                        type="button"
                                        className="historyAgendaLocation"
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
                    </dl>
                </div>
            )}
        </article>
    );
};

export default HistoryAppointmentItem
