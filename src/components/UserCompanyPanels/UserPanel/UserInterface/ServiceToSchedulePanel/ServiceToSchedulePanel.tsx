import "./ServiceToSchedulePanel.css"
import Button from "../../../../../common/Button/Button";
import { type UserData, type ServiceToSchedule } from "../../../../../types";
import Title from "../../../../../common/Title/Title";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid/index.js"
import { notifyError } from "../../../../../utils/notifications";
import { confirmDelete } from "../../../../../utils/alerts";
import { parseDateToString } from "../../../../../utils/parseDateToString";
import { useNavigate } from "react-router-dom";
import { BACKEND_API_URL } from "../../../../../config";
import { formatDate } from "../../../../../utils/formatDate";
import ModalForm from "../../../../ModalForm/ModalForm";
import { useEffect, useState } from "react";
import LoadingModal from "../../../../../common/LoadingModal/LoadingModal";
import { generateAvailableAppointmentsArray, generateScheudledAppointmentArray } from "../../../../../utils/cleanAppointmentsArray";
import LoadingSpinner from "../../../../../common/LoadingSpinner/LoadingSpinner";
import { useAuthenticatedGet, useAuthenticatedPost } from "../../../../../hooks/useAuthenticatedFetch";

interface Props {
    bookingAnticipationHours: number;
    serviceToSchedule: string;
    setServiceToSchedule: React.Dispatch<React.SetStateAction<string | null>>;
}

const ServiceToSchedulePanel: React.FC<Props> = ({ serviceToSchedule, setServiceToSchedule, bookingAnticipationHours }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [dateAppointment, setDateAppointment] = useState<Date | null>(null)
    const [isScheduling, setIsScheduling] = useState(false)
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

    if (isLoadingData) return <div className="serviceToScheduleContainer">
        <LoadingSpinner
            text="Cargando servicio..."
            shadow="none"
        />
    </div>

    if (!serviceToScheduleData) return <div className="serviceToScheduleContainer">
        <h1>Lo sentimos, no encontramos el servicio que buscabas...</h1>
    </div>

    const checkOrderHour = async (startEvent: Date) => {
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

    const arrayEvents = generateAvailableAppointmentsArray(serviceToScheduleData.availableAppointments)
    const arrayEventsScheduled = generateScheudledAppointmentArray(serviceToScheduleData.scheduledAppointments, serviceToScheduleData.availableAppointments)

    return (
        <div className="serviceToScheduleContainer">
            <Title
                fontSize={window.innerWidth <= 930 ? "1.5rem" : ""}
            >
                Turnos disponibles para {serviceToScheduleData.title}
            </Title>
            {
                window.innerWidth <= 1150 &&
                <div className="divAvailabilityIndicator">
                    <div className="pointContainer">
                        <div className="greenPoint point"></div>
                        <p className="greenParraf">Disponible</p>
                    </div>
                    <div className="pointContainer">
                        <div className="redPoint point"></div>
                        <p className="redParraf">Ocupado</p>
                    </div>
                </div>
            }
            <div className="calendarContainerUser">
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridWeek"
                    contentHeight={"65vh"}
                    locale={"es"}
                    eventClassNames={"event"}
                    eventDisplay="block"
                    eventTimeFormat={{
                        hour: "numeric",
                        minute: "2-digit",
                        omitZeroMinute: false,
                        meridiem: "short"
                    }}
                    buttonText={{
                        today: "Hoy"
                    }}
                    dayHeaderFormat={{
                        weekday: "long",
                        month: "numeric",
                        day: "numeric",
                        omitCommas: true
                    }}
                    titleFormat={{
                        month: "long",
                        day: "numeric"
                    }}
                    headerToolbar={
                        {
                            right: "prev,today,next"
                        }
                    }
                    events={[
                        ...arrayEvents || [],
                        ...arrayEventsScheduled || []
                    ]}
                    eventClick={(info) => {
                        if (info.event.backgroundColor === "red") {
                            notifyError("El turno seleccionado ya está ocupado.")
                        } else {
                            checkOrderHour(info.event.start as Date)
                        }
                    }}
                />
            </div>
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
