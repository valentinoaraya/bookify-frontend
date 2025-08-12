import "./CancelAppointment.css"
import { useParams } from "react-router-dom";
import { useFetchData } from "../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../config";
import { useEffect, useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { confirmDelete } from "../../utils/alerts";
import { notifySuccess, notifyError } from "../../utils/notifications";
import { ToastContainer } from "react-toastify";

const isAppointmentDatePassed = (appointmentDate: string): boolean => {
    const appointmentDateTime = new Date(appointmentDate);
    const currentDate = new Date();
    return appointmentDateTime < currentDate;
};

const CancelAppointment = () => {

    const { appointmentId } = useParams()
    const { fetchData, isLoading, error } = useFetchData(
        `${BACKEND_API_URL}/appointments/get-appointment/${appointmentId}`,
        "GET",
    )
    const { fetchData: fetchDataCancel, isLoading: isCancelling, error: errorCancel } = useFetchData(
        `${BACKEND_API_URL}/appointments/cancel-appointment/${appointmentId}`,
        "DELETE"
    )
    const [data, setData] = useState<any>(null)
    const [finalized, setFinalized] = useState(false)

    useEffect(() => {
        const fetchAppointment = async () => {
            const response = await fetchData({})
            if (response.data) {
                setData(response.data)
            }
        }

        fetchAppointment()

    }, [appointmentId])

    const handleCancelAppointment = async () => {
        const confirm = await confirmDelete({
            question: "¿Seguro que desea cancelar el turno?",
            icon: "warning",
            cancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Aceptar"
        })
        if (confirm) {
            const response = await fetchDataCancel({
                dataUser: {
                    name: data.name,
                    lastName: data.lastName,
                    dni: data.dni,
                    email: data.email,
                    phone: data.phone,
                }
            })
            if (response?.data) {
                notifySuccess("Turno cancelado con éxito.")
                setFinalized(true)
            }
            if (response?.error) {
                notifyError(response.error)
            }
        }
    }

    if (error || errorCancel) return (
        <div className="error-container">
            <div className="error-content">
                <h2>⚠️ Error: {error}</h2>
                <p>No pudimos cargar la información del turno</p>
            </div>
        </div>
    )

    if (isLoading) return (
        <div className="loading-container">
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <h2>Cargando información del turno...</h2>
            </div>
        </div>
    )

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
                                            {data?.service.signPrice !== 0 && <div className="info-item">
                                                <span className="label">💳 Seña:</span>
                                                <span className="value">${data?.service.signPrice}</span>
                                            </div>
                                            }
                                        </div>
                                    </div>

                                    {data?.service.signPrice !== 0 && (
                                        <div className="refund-notice">
                                            <p>⚠️ <strong>Importante:</strong> Si cancelas este turno y pagaste una seña, se te devolverá el 50% del monto de la seña (${(data?.service.signPrice * 0.5).toFixed(2)}).</p>
                                        </div>
                                    )}

                                    <div className="action-buttons">
                                        {isAppointmentDatePassed(data?.date) ? (
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
