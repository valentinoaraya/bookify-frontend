import "./CalendarServicePanel.css"
import Title from "../../../../../common/Title/Title";
import { type View, type Service, AvailableAppointment } from "../../../../../types";
import Button from "../../../../../common/Button/Button";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid/index.js"
import { useContext, useState, useEffect } from "react";
import ModalForm from "../../../../ModalForm/ModalForm";
import { useFetchData } from "../../../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../../../config";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { parseDateToString } from "../../../../../utils/parseDateToString";
import { CompanyContext } from "../../../../../contexts/CompanyContext";
import { CalendarCheckIcon } from "../../../../../common/Icons/Icons";
import { generateAvailableAppointmentsArray, generateScheudledAppointmentArray } from "../../../../../utils/cleanAppointmentsArray";
import ModalDisponibility from "./ModalDisponibility/ModalDisponibility";
import LoadingSpinner from "../../../../../common/LoadingSpinner/LoadingSpinner";

interface Props {
    setActiveView: (view: View) => void
    service: Service
}

const CalendarServicePanel: React.FC<Props> = ({ service, setActiveView }) => {
    const token = localStorage.getItem("access_token")
    const { state, updateServices } = useContext(CompanyContext)
    const [serviceData, setServiceData] = useState<Service | null>(null)
    const [availableAppointments, setAvailableAppointments] = useState<AvailableAppointment[]>([])
    const [scheduledAppointments, setScheduledAppointments] = useState<string[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalDisponibilityOpen, setIsModalDisponibilityOpen] = useState(false)
    const [appointment, setAppointment] = useState<AvailableAppointment | undefined>(undefined)

    const { isLoading: isLoadingService, error: errorService, fetchData: fetchDataService } = useFetchData(
        `${BACKEND_API_URL}/services/${service._id}`,
        "GET",
    )

    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/enable-appointments/${service._id}`,
        "POST",
        token
    )

    useEffect(() => {
        const fetchService = async () => {
            const response = await fetchDataService({})
            if (response.data) {
                setServiceData(response.data)
                setAvailableAppointments(response.data.availableAppointments)
                setScheduledAppointments(response.data.scheduledAppointments)
            } else if (response.error) {
                notifyError("Error al obtener el servicio. Inténtelo de nuevo más tarde.")
            }
        }

        fetchService()
    }, [])

    if (isLoadingService) return <div className="calendarServicePanel">
        <LoadingSpinner
            text="Cargando servicio..."
            shadow="none"
        />
    </div>

    if (!serviceData) return <div className="calendarServicePanel">
        <h1>Lo sentimos, no encontramos el servicio que buscabas...</h1>
    </div>


    const arrayEvents = generateAvailableAppointmentsArray(availableAppointments, serviceData.pendingAppointments)
    const arrayEventsScheduled = generateScheudledAppointmentArray(scheduledAppointments, availableAppointments)

    const onSubmitForm = async (data: { [key: string]: any }) => {
        const response = await fetchData(data)
        setIsModalOpen(false)
        if (response.data) {
            const serviceUpdated = { ...serviceData, availableAppointments: [...availableAppointments, ...response.data] }
            setAvailableAppointments(serviceUpdated.availableAppointments)
            updateServices(state.services.map(service => service._id === serviceUpdated._id ? serviceUpdated : service))
            notifySuccess("Turnos habilitados correctamente.")
        }
        if (response.error) {
            console.error(response.error)
            notifyError("Error al habilitar los turnos.")
        }
    }

    const onClickAppointment = (date: Date) => {
        const { stringDate, time } = parseDateToString(date)
        const appointment = availableAppointments.find(app => app.datetime === `${stringDate} ${time}`)
        const scheduleds = scheduledAppointments.filter(date => date === `${stringDate} ${time}`).length
        setAppointment(appointment || { datetime: `${stringDate} ${time}`, capacity: 0, taken: scheduleds })
        setIsModalDisponibilityOpen(true)
    }

    if (error) notifyError("Error al habilitar los turnos")
    if (errorService) notifyError("Error al obtener el servicio.")

    return (
        <div className="calendarServicePanel">
            <Title
                fontSize={window.innerWidth <= 930 ? "1.5rem" : ""}
            >
                Calendario para {serviceData.title}
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
            <div className="calendarContainer">
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridWeek"
                    contentHeight={"71vh"}
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
                        onClickAppointment(info.event.start as Date)
                    }}
                />
            </div>
            <div className="divButtonsCalendar">
                <Button margin="0" padding=".8rem 0" fontSize="1.4rem" onSubmit={() => setIsModalOpen(true)}
                    backgroundColor="green"
                    iconSVG={
                        <CalendarCheckIcon
                            width="20px"
                            height="20px"
                            fill="white"
                        />
                    }
                >
                    Habilitar turnos
                </Button>
                <Button margin="0" padding=".8rem 0" fontSize="1.4rem" onSubmit={() => setActiveView("services")}>Volver</Button>
            </div>
            <ModalForm
                title="Selecciona los días para habilitar turnos"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => onSubmitForm(data)}
                dayPicker
                horizontalForm
                inputs={
                    [
                        {
                            type: "selectHour",
                            name: "hourStart",
                            label: "Selecciona hora de comienzo:",
                        },
                        {
                            type: "selectHour",
                            name: "hourFinish",
                            label: "Selecciona hora del final:",
                        },
                        {
                            type: "text",
                            name: "turnEach",
                            label: "Turnos cada (minutos):",
                            placeholder: "Ej: 30"
                        }
                    ]
                }
                disabledButtons={isLoading}
                initialData={{
                    hourStart: "",
                    hourFinish: "",
                    turnEach: "",
                    days: null
                }}
            />
            <ModalDisponibility
                serviceId={serviceData._id}
                isOpen={isModalDisponibilityOpen}
                setAvailableAppointments={setAvailableAppointments}
                setScheduledAppointments={setScheduledAppointments}
                setIsOpen={setIsModalDisponibilityOpen}
                setAppointment={setAppointment}
                appointment={appointment}
            />
        </div>
    );
}

export default CalendarServicePanel;