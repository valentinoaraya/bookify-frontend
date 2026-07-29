import "./CancelAppointment.css"
import { useParams } from "react-router-dom";
import { BACKEND_API_URL } from "../../config";
import { useEffect, useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { confirmDelete } from "../../utils/alerts";
import { notifySuccess, notifyError } from "../../utils/notifications";
import { ToastContainer } from "react-toastify";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import { useAuthenticatedDelete, useAuthenticatedGet } from "../../hooks/useAuthenticatedFetch";

const isAppointmentDatePassed = (appointmentDate: string): boolean => {
    const appointmentDateTime = new Date(appointmentDate);
    const currentDate = new Date();
    return appointmentDateTime < currentDate;
};

const CancelAppointment = () => {

    // Puede ser el token firmado del email o, en links viejos, el id del turno.
    const { appointmentRef } = useParams()
    const { error, isLoading, get } = useAuthenticatedGet()
    const { error: errorCancel, isLoading: isCancelling, delete: del } = useAuthenticatedDelete()
    const urlGetAppointment = `${BACKEND_API_URL}/appointments/get-appointment/${appointmentRef}`
    const urlDeleteAppointment = `${BACKEND_API_URL}/appointments/cancel-appointment/${appointmentRef}`

    const [data, setData] = useState<any>(null)
    const [finalized, setFinalized] = useState(false)
    const [emailConfirmation, setEmailConfirmation] = useState("")

    useEffect(() => {
        const fetchAppointment = async () => {
            const response = await get(urlGetAppointment, { skipAuth: true })
            if (response.data) {
                setData(response.data.data)
            }
        }

        fetchAppointment()

    }, [appointmentRef])

    const handleCancelAppointment = async () => {
        if (data.requiresEmailConfirmation && !emailConfirmation.trim()) {
            notifyError("Ingresá el email con el que reservaste el turno.")
            return
        }

        const confirm = await confirmDelete({
            question: "¿Seguro que desea cancelar el turno?",
            icon: "warning",
            cancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Aceptar"
        })
        if (confirm) {
            const response = await del(urlDeleteAppointment, {
                dataUser: { email: emailConfirmation.trim() }
            }, { skipAuth: true })

            if (response?.data) {
                notifySuccess("Turno cancelado con éxito.")
                setFinalized(true)
            }
            if (response?.error) {
                notifyError(response.error)
            }
        }
    }

    if (error || errorCancel) {
        console.error(errorCancel)
        return (
            <div className="error-container">
                <div className="error-content">
                    <h2>⚠️ Error: {error}</h2>
                    <p>No pudimos cargar la información del turno</p>
                </div>
            </div>
        )
    }

    if (isLoading) return (
        <LoadingSpinner
            text="Cargando información del turno..."
        />
    )

    const isAlreadyClosed = Boolean(data?.status) && data.status !== "scheduled"
    const canCancel = Boolean(data) && !isAlreadyClosed && !isAppointmentDatePassed(data.date)

    return (
        <div className="cancel-appointment-container">
            <ToastContainer />
            {!data ? (
                <div className="not-found-container">
                    <div className="not-found-content">
                        <h2>❌ Turno no encontrado</h2>
                        <p>No pudimos encontrar el turno que intentas cancelar</p>
                    </div>
                </div>
            ) : (
                <>
                    {
                        finalized ?
                            <div className="success">
                                <div className="success-content">
                                    <h1>✅ Turno cancelado</h1>
                                    <p className="subtitle">El turno fue cancelado exitosamente.</p>
                                    <p className="subtitle">Puedes cerrar esta página.</p>
                                </div>
                            </div>
                            :
                            <div className="appointment-details">
                                <div className="header-section">
                                    <h1>📅 Detalles del Turno</h1>
                                    <p className="subtitle">Revisa la información antes de cancelar</p>
                                </div>

                                <div className="appointment-card">
                                    <div className="service-info">
                                        <h3>🛠️ {data?.service.title}</h3>
                                        <p>Turno reservado para <span className="clientname">{data?.name} {data?.lastName}</span> en <span className="clientname">{data?.company.name}</span></p>
                                        <p></p>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">📅 Fecha:</span>
                                                <span className="value">{formatDate(data?.date.split(' ')[0])}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">🕐 Hora:</span>
                                                <span className="value">{data?.date.split(' ')[1]}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">⏱️ Duración:</span>
                                                <span className="value">{data?.service.duration} mins</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">💰 Precio:</span>
                                                <span className="value">${data?.service.price}</span>
                                            </div>
                                            {data?.totalPaidAmount && <div className="info-item">
                                                <span className="label">💳 Seña:</span>
                                                <span className="value">${data?.totalPaidAmount}</span>
                                            </div>
                                            }
                                        </div>
                                    </div>

                                    {data?.totalPaidAmount && (
                                        <div className="refund-notice">
                                            <p>⚠️ <strong>Importante:</strong> Si cancelas este turno y pagaste una seña, se te devolverá el 50% del monto de la seña (${(data?.totalPaidAmount * 0.5).toFixed(2)}).</p>
                                        </div>
                                    )}

                                    {data?.requiresEmailConfirmation && canCancel && (
                                        <div className="email-confirmation">
                                            <label htmlFor="emailConfirmation">
                                                Para continuar, confirmá el email con el que reservaste el turno
                                                {data?.emailHint ? ` (${data.emailHint})` : ""}:
                                            </label>
                                            <input
                                                id="emailConfirmation"
                                                type="email"
                                                value={emailConfirmation}
                                                onChange={(e) => setEmailConfirmation(e.target.value)}
                                                placeholder="tu@email.com"
                                                autoComplete="email"
                                            />
                                        </div>
                                    )}

                                    <div className="action-buttons">
                                        {isAlreadyClosed ? (
                                            <div className="passed-appointment-notice">
                                                <p>ℹ️ <strong>Este turno ya no está agendado</strong></p>
                                                <p>Fue cancelado o ya fue atendido, así que no hay nada que cancelar</p>
                                            </div>
                                        ) : isAppointmentDatePassed(data?.date) ? (
                                            <div className="passed-appointment-notice">
                                                <p>⏰ <strong>Este turno ya pasó</strong></p>
                                                <p>No se puede cancelar un turno que ya se realizó</p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleCancelAppointment}
                                                className="btn-cancel"
                                                disabled={isCancelling}
                                            >
                                                {isCancelling ? 'Cancelando...' : '❌ Cancelar Turno'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                    }
                </>
            )}
        </div>
    );
}

export default CancelAppointment;
