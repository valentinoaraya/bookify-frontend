import { Appointment } from "../../../../../types";
import { useState, useRef, SetStateAction } from "react";
import Button from "../../../../../common/Button/Button";
import { CalendarOutlined } from "@ant-design/icons";
import isBetween from "dayjs/plugin/isBetween";
import dayjs from "dayjs";
import { BACKEND_API_URL } from "../../../../../config";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { useAuthenticatedPut } from "../../../../../hooks/useAuthenticatedFetch";
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
    }>>
}

const HistoryAppointmentItem: React.FC<Props> = ({ appointment, setFilteredAppointments, setPendingAppointments, setCopyOfFilteredAppointments, setIsFilteredPendingAppointments, setStatistics }) => {

    const time = dayjs(appointment.date).format("HH:mm");
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const headerRef = useRef<HTMLDivElement>(null);
    const isPendingAction = appointment.status === "pending_action";

    const { isLoading, error, put } = useAuthenticatedPut()
    const urlChangeStatus = `${BACKEND_API_URL}/appointments/change-status`

    if (error) notifyError("Error en el servidor. Intente más tarde.")

    const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPendingAction || !headerRef.current) return;
        const rect = headerRef.current.getBoundingClientRect();
        const containerRect = e.currentTarget.getBoundingClientRect();
        const widthMenu = window.innerWidth <= 650 ? 207 : 0
        const x = rect.right - containerRect.left + 8 - widthMenu;
        const y = rect.top - containerRect.top - 10;
        setMenuPosition({ x, y });
        setMenuOpen((prev) => !prev);
    };

    const handleChangeStatus = async (status: "finished" | "did_not_attend") => {
        const response = await put(urlChangeStatus, {
            appointmentId: appointment._id,
            status
        })
        if (response.data) {
            setFilteredAppointments(prev => prev.map(app => {
                if (app._id === response.data.data._id) {
                    return { ...app, status: response.data.data.status }
                }
                return app
            })
            )
            setCopyOfFilteredAppointments(prev => prev.map(app => {
                if (app._id === response.data.data._id) {
                    return { ...app, status: response.data.data.status }
                }
                return app
            })
            )
            setPendingAppointments(prev => prev.filter(apt => apt._id !== response.data.data._id))
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
        setMenuOpen(false)
    }

    return (
        <div
            className={`history-appointment-item ${appointment.status}`}
            onClick={handleItemClick}
            role={isPendingAction ? "button" : undefined}
        >
            <div className="history-appointment-header" ref={headerRef}>
                <div className="history-client-info">
                    <h3 className="history-client-name">{`${appointment.name} ${appointment.lastName}`}</h3>
                    <p className="history-client-email">{appointment.email}</p>
                    {appointment.phone && <p className="history-client-phone">{appointment.phone}</p>}
                    <p className="card-client-phone">DNI: {appointment.dni}</p>
                </div>
            </div>
            <div className="history-appointment-details">
                <div className="history-service-info">
                    <h4 className="history-service-title">{appointment.serviceId.title}</h4>
                    <div className={`appointment-mode ${appointment.mode === "in-person" ? "presencial" : "virtual"}`}>
                        <span className="appointment-mode-dot"></span>
                        <span className="appointment-mode-label">Modalidad</span>
                        <span className="appointment-mode-value">{appointment.mode === "in-person" ? "Presencial" : "Virtual"}</span>
                    </div>
                    <p className="history-service-duration">Duración: {appointment.serviceId.duration} min</p>
                    <p className="history-service-price">Precio: ${appointment.price}</p>
                    {appointment.totalPaidAmount && <p className="history-service-sign-price">Seña: ${appointment.totalPaidAmount}</p>}
                </div>
            </div>
            <div className="divStatusAndDate">
                <div className={`divStatusAppointment ${appointment.status}`}>
                    {appointment.status === "finished" && "Finalizado"}
                    {appointment.status === "cancelled" && `Cancelado por ${appointment.cancelledBy === "company" ? "ti" : appointment.name}`}
                    {appointment.status === "pending_action" && "Pendiente de acción"}
                    {appointment.status === "did_not_attend" && "No asistió"}
                </div>
                <div className="history-date-time-info">
                    <p className="history-appointment-date">
                        <CalendarOutlined /> {dayjs(appointment.date).format("DD/MM/YYYY")} {time}
                    </p>
                </div>
            </div>

            {isPendingAction && menuOpen && (
                <div
                    className="history-appointment-menu animation-section-buttons"
                    style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        margin="0"
                        padding="6px 10px"
                        fontWeight="600"
                        onSubmit={() => handleChangeStatus("finished")}
                        backgroundColor="#3f9f0f"
                        width="auto"
                        disabled={isLoading}
                    >
                        Finalizó
                    </Button>
                    <Button
                        margin="0"
                        padding="6px 10px"
                        fontWeight="600"
                        backgroundColor="grey"
                        width="auto"
                        disabled={isLoading}
                        onSubmit={() => handleChangeStatus("did_not_attend")}
                    >
                        No asistió
                    </Button>
                </div>
            )}
        </div>
    );
};

export default HistoryAppointmentItem