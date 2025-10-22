import "./ServiceToSchedulePanel.css"
import Button from "../../../../../common/Button/Button";
import { type UserData, type ServiceToSchedule } from "../../../../../types";
import Title from "../../../../../common/Title/Title";
import { notifyError } from "../../../../../utils/notifications";
import { confirmDelete } from "../../../../../utils/alerts";
import { parseDateToString } from "../../../../../utils/parseDateToString";
import { useNavigate } from "react-router-dom";
import { BACKEND_API_URL } from "../../../../../config";
import { formatDate } from "../../../../../utils/formatDate";
import ModalForm from "../../../../ModalForm/ModalForm";
import { useEffect, useState } from "react";
import LoadingModal from "../../../../../common/LoadingModal/LoadingModal";
import LoadingSpinner from "../../../../../common/LoadingSpinner/LoadingSpinner";
import { useAuthenticatedGet, useAuthenticatedPost } from "../../../../../hooks/useAuthenticatedFetch";
import DayCard from "./DayCard";
import TimeSlotCard from "./TimeSlotCard";

interface Props {
    bookingAnticipationHours: number;
    serviceToSchedule: string;
    setServiceToSchedule: React.Dispatch<React.SetStateAction<string | null>>;
}

const ServiceToSchedulePanel: React.FC<Props> = ({ serviceToSchedule, setServiceToSchedule, bookingAnticipationHours }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [dateAppointment, setDateAppointment] = useState<Date | null>(null)
    const [isScheduling, setIsScheduling] = useState(false)
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const { error, isLoading, post } = useAuthenticatedPost()
    const urlAddAppointment = `${BACKEND_API_URL}/appointments/add-appointment`
    const { error: errorData, isLoading: isLoadingData, get } = useAuthenticatedGet()
    const urlGetService = `${BACKEND_API_URL}/services/${serviceToSchedule}`
    const { error: errorConfirm, isLoading: isLoadingConfirm, get: getSignPrice } = useAuthenticatedGet()
    const urlGetSignPrice = `${BACKEND_API_URL}/services/contains-sign-price/${serviceToSchedule}`
    const { error: errorCheckHour, isLoading: isLoadingCheckHour, post: postCheckBookingHour } = useAuthenticatedPost()
    const urlCheckBookingHour = `${BACKEND_API_URL}/appointments/check-booking-hour`

    if (error) notifyError("Error al reservar turno.")
    if (errorData) notifyError("Error al obtener el servicio.")
    if (errorConfirm) notifyError("Error al obtener el servicio.")
    if (errorCheckHour) notifyError("Error al verificar dispoinibilidad del turno")

    const [serviceToScheduleData, setServiceToScheduleData] = useState<ServiceToSchedule | null>(null)

    const navigate = useNavigate()

    const generateWeekDays = () => {
        const days = []
        const today = new Date()

        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)

            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

            days.push({
                date: date.toISOString().split('T')[0],
                dayName: dayNames[date.getDay()],
                dayNumber: date.getDate(),
                month: monthNames[date.getMonth()]
            })
        }

        return days
    }

    const getTimeSlotsForDay = (dayDate: string) => {
        if (!serviceToScheduleData) return []

        const dayAppointments = serviceToScheduleData.availableAppointments.filter(
            appointment => appointment.datetime.startsWith(dayDate)
        )

        return dayAppointments.map(appointment => {
            const date = new Date(appointment.datetime)
            const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

            const availablePlaces = appointment.capacity - appointment.taken

            return {
                datetime: appointment.datetime,
                time,
                availablePlaces,
                totalCapacity: appointment.capacity,
                isAvailable: availablePlaces > 0
            }
        }).sort((a, b) => a.time.localeCompare(b.time))
    }

    const getAvailableSlotsForDay = (dayDate: string) => {
        const timeSlots = getTimeSlotsForDay(dayDate)
        return timeSlots.filter(slot => slot.isAvailable).length
    }

    useEffect(() => {
        const fetchService = async () => {
            const response = await get(urlGetService, { skipAuth: true })
            if (response.data) {
                setServiceToScheduleData(response.data.data)
            } else if (response.error) {
                notifyError("Error al obtener el servicio. Inténtelo de nuevo más tarde.")
            }
        }

        fetchService()
    }, [])

    if (isLoadingData) return <div className="serviceToScheduleContainer animation-section">
        <LoadingSpinner
            text="Cargando servicio..."
            shadow="none"
        />
    </div>

    if (!serviceToScheduleData) return <div className="serviceToScheduleContainer animation-section">
        <h1>Lo sentimos, no encontramos el servicio que buscabas...</h1>
    </div>

    const checkOrderHour = async (datetime: string) => {
        const startEvent = new Date(datetime)
        const response = await postCheckBookingHour(urlCheckBookingHour, {
            companyId: serviceToScheduleData.companyId,
            date: startEvent
        }, { skipAuth: true })
        if (response.data) {
            setDateAppointment(startEvent)
            setIsOpen(true)
        }
        if (response.error) {
            notifyError(response.error, true)
        }
    }

    const confirmAppointment = async (date: Date, dataUser: UserData) => {

        const { stringDate, time } = parseDateToString(date)
        const formattedDate = formatDate(stringDate)

        let messageHours = ""
        if (bookingAnticipationHours > 24) {
            messageHours = `${bookingAnticipationHours / 24} ${bookingAnticipationHours / 24 === 1 ? "día" : "días"}`
        } else {
            messageHours = `${bookingAnticipationHours} ${bookingAnticipationHours === 1 ? "hora" : "horas"}`
        }

        const decisionConfirmed = await confirmDelete({
            question: `¿Desea reservar un turno para ${serviceToScheduleData.title} el día ${formattedDate} a las ${time} hs?`,
            mesasge: `Solo podrás cancelar el turno con más de ${messageHours} de anticipación.`,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            cancelButton: true
        })

        if (decisionConfirmed) {
            const response = await getSignPrice(urlGetSignPrice, { skipAuth: true })
            if (response.data) {
                if (response.data.data.contains) {
                    navigate("/checkout", {
                        state: {
                            date: `${stringDate} ${time}`,
                            service: {
                                serviceId: serviceToScheduleData._id,
                                title: serviceToScheduleData.title,
                                signPrice: serviceToScheduleData.signPrice,
                                companyId: serviceToScheduleData.companyId,
                                totalPrice: serviceToScheduleData.price
                            },
                            dataUser
                        }
                    })
                } else {
                    setIsScheduling(true)
                    const response = await post(urlAddAppointment, {
                        dataAppointment: {
                            date: `${stringDate} ${time}`,
                            serviceId: serviceToScheduleData._id,
                            companyId: serviceToScheduleData.companyId
                        },
                        dataUser
                    }, { skipAuth: true })
                    setIsScheduling(false)
                    if (response.data) {
                        const confirm = await confirmDelete({
                            icon: "success",
                            question: `Turno confirmado correctamente.`,
                            confirmButtonText: "Aceptar",
                            cancelButton: false
                        })
                        if (confirm) {
                            setServiceToSchedule(null)
                            window.location.reload()
                        }
                    }
                    if (response.error) notifyError(response.error, true)

                }
            }
            if (response.error) notifyError("Error al verificar el servicio. Inténtelo de nuevo más tarde.")
        }
    }

    const weekDays = generateWeekDays()

    return (
        <div className="serviceToScheduleContainer animation-section">
            <Title
                fontSize={window.innerWidth <= 930 ? "1.5rem" : ""}
            >
                Turnos disponibles para {serviceToScheduleData.title}
            </Title>

            <div className="weekDaysContainer">
                {weekDays.map((day) => (
                    <DayCard
                        key={day.date}
                        dayName={day.dayName}
                        dayNumber={day.dayNumber}
                        month={day.month}
                        availableSlots={getAvailableSlotsForDay(day.date)}
                        isSelected={selectedDay === day.date}
                        onClick={() => setSelectedDay(selectedDay === day.date ? null : day.date)}
                    />
                ))}
            </div>

            {selectedDay && (
                <div className="timeSlotsContainer animation-section">
                    <h3 className="timeSlotsTitle animation-section">
                        Horarios disponibles para {weekDays.find(d => d.date === selectedDay)?.dayName} {weekDays.find(d => d.date === selectedDay)?.dayNumber}
                    </h3>
                    <div className="timeSlotsGrid">
                        {getTimeSlotsForDay(selectedDay).map((slot) => (
                            <TimeSlotCard
                                key={slot.datetime}
                                time={slot.time}
                                availablePlaces={slot.availablePlaces}
                                totalCapacity={slot.totalCapacity}
                                isAvailable={slot.isAvailable}
                                onClick={() => checkOrderHour(slot.datetime)}
                            />
                        ))}
                    </div>
                    {getTimeSlotsForDay(selectedDay).length === 0 && (
                        <p className="noSlotsMessage animation-section">No hay horarios disponibles para este día.</p>
                    )}
                </div>
            )}
            <Button onSubmit={() => setServiceToSchedule(null)}>Cancelar</Button>
            <ModalForm
                title="Completa tus datos"
                isOpen={isOpen}
                inputs={[
                    { type: "text", name: "name", placeholder: "Nombre", label: "Nombre" },
                    { type: "text", name: "lastName", placeholder: "Apellido", label: "Apellido" },
                    { type: "text", name: "email", placeholder: "Email", label: "Email" },
                    { type: "text", name: "dni", placeholder: "DNI", label: "DNI" },
                    { type: "text", name: "phone", placeholder: "Teléfono", label: "Teléfono" },
                ]}
                initialData={{ name: "", lastName: "", email: "", dni: "", phone: "", }}
                onClose={() => setIsOpen(false)}
                onSubmitForm={(data) => {
                    if (!dateAppointment) return notifyError("No se ha especificado una fecha para el turno.")
                    confirmAppointment(dateAppointment, data as UserData)
                    setIsOpen(false)
                }}
                disabledButtons={isLoading}
            />
            <LoadingModal
                text={isLoadingConfirm ? "Verificando servicio..." : "Agendando turno..."}
                isOpen={isScheduling || isLoadingConfirm}
            />
            <LoadingModal
                text={"Verificando horario..."}
                isOpen={isLoadingCheckHour}
            />
        </div>
    );
}

export default ServiceToSchedulePanel;
