import "./ServiceToSchedulePanel.css"
import Button from "../../../../../common/Button/Button";
import { UserData, type Service, type ServiceToSchedule } from "../../../../../types";
import Title from "../../../../../common/Title/Title";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"
import { notifyError } from "../../../../../utils/notifications";
import { confirmDelete } from "../../../../../utils/alerts";
import { parseDateToString } from "../../../../../utils/parseDateToString";
import { useNavigate } from "react-router-dom";
import { BACKEND_API_URL } from "../../../../../config";
import { useFetchData } from "../../../../../hooks/useFetchData";
import { formatDate } from "../../../../../utils/formatDate";
import ModalForm from "../../../../ModalForm/ModalForm";
import { useState } from "react";
import LoadingModal from "../../../../../common/LoadingModal/LoadingModal";

interface Props {
    serviceToSchedule: ServiceToSchedule;
    setServiceToSchedule: React.Dispatch<React.SetStateAction<ServiceToSchedule | null>>;
    setResults: React.Dispatch<React.SetStateAction<Service[] | null>>;
}

const ServiceToSchedulePanel: React.FC<Props> = ({ serviceToSchedule, setServiceToSchedule }) => {

    const [isOpen, setIsOpen] = useState(false)
    const [dateAppointment, setDateAppointment] = useState<Date | null>(null)
    const { error, isLoading, fetchData } = useFetchData(
        `${BACKEND_API_URL}/appointments/add-appointment`,
        "POST",
    )
    const [isScheduling, setIsScheduling] = useState(false)

    if (error) notifyError("Error al reservar turno.")
    const navigate = useNavigate()

    const confirmAppointment = async (date: Date, dataUser: UserData) => {

        const { stringDate, time } = parseDateToString(date)
        const formattedDate = formatDate(stringDate)

        const decisionConfirmed = await confirmDelete({
            question: `¿Desea reservar un turno para ${serviceToSchedule.title} el día ${formattedDate} a las ${time} hs?`,
            mesasge: serviceToSchedule.signPrice !== 0 ? `Al aceptar, serás redirigido al Checkout donde realizarás el pago de la seña que requiere la empresa para confirmar el turno. Solo podrás cancelar el turno con más de 24 horas de anticipación y se te devolverá un 50% del dinero abonado.` : "Solo podrás cancelar el turno con más de 24 horas de anticipación.",
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            cancelButton: true
        })

        if (decisionConfirmed && serviceToSchedule.signPrice !== 0) {
            navigate("/checkout", {
                state: {
                    date: `${stringDate} ${time}`,
                    service: {
                        serviceId: serviceToSchedule._id,
                        title: serviceToSchedule.title,
                        signPrice: serviceToSchedule.signPrice,
                        companyId: serviceToSchedule.companyId,
                        totalPrice: serviceToSchedule.price
                    },
                    dataUser
                }
            })
        } else if (decisionConfirmed && serviceToSchedule.signPrice === 0) {
            setIsScheduling(true)
            const response = await fetchData({
                dataAppointment: {
                    date: `${stringDate} ${time}`,
                    serviceId: serviceToSchedule._id,
                    companyId: serviceToSchedule.companyId
                },
                dataUser
            })
            setIsScheduling(true)
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
            if (response.error) notifyError("Error al confirmar turno. Inténtelo de nuevo más tarde.")
        }
    }

    const arrayEvents = serviceToSchedule.availableAppointments.map(date => {
        return {
            title: window.innerWidth <= 1150 ? "" : "Disponible",
            start: date,
            backgroundColor: "green",
            borderColor: "green"
        }
    })
    const arrayEventsScheduled = serviceToSchedule.scheduledAppointments.map(date => {
        return {
            title: window.innerWidth <= 1150 ? "" : "Ocupado",
            start: date,
            backgroundColor: "red",
            borderColor: "red"
        }
    })

    return (
        <div className="serviceToScheduleContainer">
            <Title
                fontSize={window.innerWidth <= 930 ? "1.5rem" : ""}
            >
                Turnos disponibles para {serviceToSchedule.title}
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
                            setDateAppointment(info.event.start as Date)
                            setIsOpen(true)
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
                text="Agendando turno..."
                isOpen={isScheduling}
            />
        </div>
    );
}

export default ServiceToSchedulePanel;
