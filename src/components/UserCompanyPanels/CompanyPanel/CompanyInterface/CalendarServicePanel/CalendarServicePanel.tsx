import "./CalendarServicePanel.css"
import Title from "../../../../../common/Title/Title";
import { type View, type AvailableAppointmentWithPendings } from "../../../../../types";
import Button from "../../../../../common/Button/Button";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid/index.js"
import { useContext, useState } from "react";
import ModalForm from "../../../../ModalForm/ModalForm";
import { BACKEND_API_URL } from "../../../../../config";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { parseDateToString } from "../../../../../utils/parseDateToString";
import { CompanyContext } from "../../../../../contexts/CompanyContext";
import { CalendarCheckIcon } from "../../../../../common/Icons/Icons";
import { generateAvailableAppointmentsArray, generateScheudledAppointmentArray } from "../../../../../utils/cleanAppointmentsArray";
import ModalDisponibility from "./ModalDisponibility/ModalDisponibility";
import { useAuthenticatedPost } from "../../../../../hooks/useAuthenticatedFetch";

interface Props {
    setActiveView: (view: View) => void
    serviceId: string
}

const CalendarServicePanel: React.FC<Props> = ({ serviceId, setActiveView }) => {
    const { state, updateServices } = useContext(CompanyContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalDisponibilityOpen, setIsModalDisponibilityOpen] = useState(false)
    const [appointment, setAppointment] = useState<AvailableAppointmentWithPendings | undefined>(undefined)

    const service = state.services.find(s => s._id === serviceId)

    if (!service) return <div className="calendarServicePanel">
        <h1>Lo sentimos, no encontramos el servicio que buscabas...</h1>
    </div>

    const { isLoading, error, post } = useAuthenticatedPost()
    const urlEnableAppointments = `${BACKEND_API_URL}/services/enable-appointments/${serviceId}`

    const arrayEvents = generateAvailableAppointmentsArray(service.availableAppointments, service.pendingAppointments)
    const arrayEventsScheduled = generateScheudledAppointmentArray(service.scheduledAppointments, service.availableAppointments)

    const onSubmitForm = async (data: { [key: string]: any }) => {
        const response = await post(urlEnableAppointments, data)
        setIsModalOpen(false)
        if (response.data) {
            const serviceUpdated = { ...service, availableAppointments: [...service.availableAppointments, ...response.data.data] }
            updateServices(serviceUpdated)
            notifySuccess("Turnos habilitados correctamente.")
        }
        if (response.error) {
            console.error(response.error)
            notifyError("Error al habilitar los turnos.")
        }
    }

    const onClickAppointment = (date: Date) => {
        const { stringDate, time } = parseDateToString(date)
        const appointment = service.availableAppointments.find(app => app.datetime === `${stringDate} ${time}`)
        const scheduleds = service.scheduledAppointments.filter(date => date === `${stringDate} ${time}`).length
        const pendings = service.pendingAppointments.filter(p => p.datetime === `${stringDate} ${time}`).length
        setAppointment(appointment ? { ...appointment, pendings } : { datetime: `${stringDate} ${time}`, capacity: 0, taken: scheduleds, pendings })
        setIsModalDisponibilityOpen(true)
    }

    if (error) notifyError("Error al habilitar los turnos")

    return (
        <div className="calendarServicePanel animation-section">
            <Title
                fontSize={window.innerWidth <= 930 ? "1.5rem" : ""}
            >
                Calendario para {service.title}
            </Title>
            <div className="calendarContainer">
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView={window.innerWidth <= 600 ? "dayGridMobile" : "dayGridWeek"}
                    views={{
                        dayGridMobile: {
                            type: "dayGrid",
                            duration: { days: 5 }
                        }
                    }}
                    contentHeight={"71vh"}
                    locale={"es"}
                    eventClassNames={"event animation-section"}
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
                    eventDidMount={(info) => {
                        const event = info.event
                        const extendedProps = event.extendedProps

                        if (extendedProps.disponibility !== undefined) {
                            const disponibility = extendedProps.disponibility
                            const taken = extendedProps.taken || 0
                            const pendingCount = extendedProps.pendingCount || 0

                            const eventEl = info.el
                            const titleEl = eventEl.querySelector('.fc-event-title')
                            if (titleEl) {
                                titleEl.innerHTML = window.innerWidth <= 700 ? `                                
                                    <div style="line-height: 1.2; padding: 0 4px;">
                                        <div style="font-weight: 550; color: #fff;">${disponibility} Disp.</div>
                                        <div style="font-weight: 550; color: #fff; margin-top: 2px;">${taken} Ocup.</div>
                                        ${pendingCount >= 1 ? `<div style="font-weight: 550; color: #fff; margin-top: 2px;">${pendingCount} Pend.</div>` : ""}
                                    </div>
                                ` : `                                
                                    <div style="line-height: 1.2; padding: 0 4px;">
                                        <div style="font-weight: 550; color: #fff;">${disponibility} Disponible${disponibility !== 1 ? 's' : ''}</div>
                                        <div style="font-weight: 550; color: #fff; margin-top: 2px;">${taken} Ocupado${taken !== 1 ? 's' : ''}</div>
                                        ${pendingCount >= 1 ? `<div style="font-weight: 550; color: #fff; margin-top: 2px;">${pendingCount} Pendiente${pendingCount !== 1 ? 's' : ''}</div>` : ""}
                                    </div>
                                `
                            }
                        } else if (extendedProps.scheduledCount !== undefined) {
                            const scheduledCount = extendedProps.scheduledCount
                            const eventEl = info.el
                            const titleEl = eventEl.querySelector('.fc-event-title')
                            if (titleEl) {
                                titleEl.innerHTML = window.innerWidth <= 700 ? `
                                    <div style="line-height: 1.2; padding: 0 4px;">
                                        <div style="font-weight: 550; color: #fff;">${scheduledCount} Ocup.</div>
                                    </div>
                                ` : `
                                    <div style="line-height: 1.2; padding: 0 4px;">
                                        <div style="font-weight: 550; color: #fff;">${scheduledCount} Ocupado${scheduledCount !== 1 ? 's' : ''}</div>
                                    </div>
                                `
                            }
                        }
                    }}
                    eventClick={(info) => {
                        onClickAppointment(info.event.start as Date)
                    }}
                />
            </div>
            <div className="divButtonsCalendar animation-section">
                <Button margin="0" padding=".8rem" fontSize="1.4rem" onSubmit={() => setIsModalOpen(true)}
                    backgroundColor="#3f9f0f"
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
                serviceId={service._id}
                isOpen={isModalDisponibilityOpen}
                setIsOpen={setIsModalDisponibilityOpen}
                setAppointment={setAppointment}
                appointment={appointment}
            />
        </div>
    );
}

export default CalendarServicePanel;