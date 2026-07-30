import "./CalendarServicePanel.css"
import Title from "../../../../../common/Title/Title";
import { type View, type AvailableAppointmentWithPendings, type AvailableAppointment } from "../../../../../types";
import Button from "../../../../../common/Button/Button";
import FullCalendar from "@fullcalendar/react";
import type { FormatterInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid/index.js"
import { useEffect, useMemo, useRef, useState } from "react";
import ModalForm from "../../../../ModalForm/ModalForm";
import { enableAppointments } from "@/shared/api/services";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { parseDateToString } from "../../../../../utils/parseDateToString";
import { useCompany } from "../../../../../hooks/useCompany";
import { useMediaQuery } from "../../../../../hooks/useMediaQuery";
import { CalendarCheckIcon } from "../../../../../common/Icons/Icons";
import { generateCalendarEventsFromService, getServiceSlots } from "../../../../../utils/cleanAppointmentsArray";
import ModalDisponibility from "./ModalDisponibility/ModalDisponibility";

interface Props {
    setActiveView: (view: View) => void
    serviceId: string
}

type CalendarViewName = "dayGridWeek" | "dayGridFiveDay" | "dayGridThreeDay"

const DAY_HEADER_LONG: FormatterInput = {
    weekday: "long",
    month: "numeric",
    day: "numeric",
    omitCommas: true,
}

const DAY_HEADER_SHORT: FormatterInput = {
    weekday: "short",
    day: "numeric",
    omitCommas: true,
}

const DAY_HEADER_NARROW: FormatterInput = {
    weekday: "narrow",
    day: "numeric",
    omitCommas: true,
}

const buildAvailabilityHtml = (disponibility: number, taken: number, pendingCount: number) => `
    <div class="fc-event-metrics">
        <div class="fc-event-metric fc-event-metric--full">${disponibility} Disponible${disponibility !== 1 ? "s" : ""}</div>
        <div class="fc-event-metric fc-event-metric--short">${disponibility} Disp.</div>
        <div class="fc-event-metric fc-event-metric--full">${taken} Ocupado${taken !== 1 ? "s" : ""}</div>
        <div class="fc-event-metric fc-event-metric--short">${taken} Ocup.</div>
        ${pendingCount >= 1 ? `
            <div class="fc-event-metric fc-event-metric--full">${pendingCount} Pendiente${pendingCount !== 1 ? "s" : ""}</div>
            <div class="fc-event-metric fc-event-metric--short">${pendingCount} Pend.</div>
        ` : ""}
    </div>
`

const buildScheduledHtml = (scheduledCount: number) => `
    <div class="fc-event-metrics">
        <div class="fc-event-metric fc-event-metric--full">${scheduledCount} Ocupado${scheduledCount !== 1 ? "s" : ""}</div>
        <div class="fc-event-metric fc-event-metric--short">${scheduledCount} Ocup.</div>
    </div>
`

const CalendarServicePanel: React.FC<Props> = ({ serviceId, setActiveView }) => {
    const { state, updateServices } = useCompany()
    const calendarRef = useRef<FullCalendar>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalDisponibilityOpen, setIsModalDisponibilityOpen] = useState(false)
    const [appointment, setAppointment] = useState<AvailableAppointmentWithPendings | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(false)

    const isNarrow = useMediaQuery("(max-width: 800px)")
    const isMobile = useMediaQuery("(max-width: 500px)")
    const isTiny = useMediaQuery("(max-width: 420px)")

    const calendarView: CalendarViewName = isMobile
        ? "dayGridThreeDay"
        : isNarrow
            ? "dayGridFiveDay"
            : "dayGridWeek"

    const contentHeight = isTiny ? "52vh" : isNarrow ? "58vh" : "71vh"

    const dayHeaderFormat = useMemo<FormatterInput>(() => {
        if (isTiny) return DAY_HEADER_NARROW
        if (isNarrow) return DAY_HEADER_SHORT
        return DAY_HEADER_LONG
    }, [isNarrow, isTiny])

    const service = state.services.find(s => s._id === serviceId)

    useEffect(() => {
        const api = calendarRef.current?.getApi()
        if (!api) return
        if (api.view.type !== calendarView) {
            api.changeView(calendarView)
        }
    }, [calendarView])

    if (!service) return <div className="calendarServicePanel">
        <h1>Lo sentimos, no encontramos el servicio que buscabas...</h1>
    </div>

    const { available: arrayEvents, scheduled: arrayEventsScheduled } =
        generateCalendarEventsFromService(service)
    const serviceSlots = getServiceSlots(service)

    const onSubmitForm = async (data: { [key: string]: any }) => {
        setIsLoading(true)
        try {
            const response = await enableAppointments(serviceId, data)
            setIsModalOpen(false)
            if (response.data) {
                const newSlots = response.data.data as unknown as AvailableAppointment[]
                const serviceUpdated = {
                    ...service,
                    availableAppointments: [...serviceSlots, ...newSlots],
                    slots: [...(service.slots || serviceSlots), ...newSlots],
                }
                updateServices(serviceUpdated)
                notifySuccess("Turnos habilitados correctamente.")
            }
            if (response.error) {
                console.error(response.error)
                notifyError("Error al habilitar los turnos.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const onClickAppointment = (date: Date) => {
        const { stringDate, time } = parseDateToString(date)
        const datetimeKey = `${stringDate} ${time}`
        const appointment = serviceSlots.find(app => app.datetime === datetimeKey)
        const scheduleds = (service.scheduledAppointments || []).filter(d => d === datetimeKey).length
            || (service.slots || []).find(s => s.datetime === datetimeKey)?.taken
            || 0
        const pendings = (service.pendingAppointments || []).filter(p => p.datetime === datetimeKey).length
        setAppointment(appointment ? { ...appointment, pendings } : { datetime: datetimeKey, capacity: 0, taken: scheduleds, pendings })
        setIsModalDisponibilityOpen(true)
    }

    return (
        <div className="calendarServicePanel animation-section">
            <Title>
                Calendario para {service.title}
            </Title>
            <div className="calendarContainer">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin]}
                    initialView={calendarView}
                    views={{
                        dayGridFiveDay: {
                            type: "dayGrid",
                            duration: { days: 5 },
                        },
                        dayGridThreeDay: {
                            type: "dayGrid",
                            duration: { days: 3 },
                        },
                    }}
                    contentHeight={contentHeight}
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
                    dayHeaderFormat={dayHeaderFormat}
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
                        const titleEl = info.el.querySelector(".fc-event-title")
                        if (!titleEl) return

                        if (extendedProps.disponibility !== undefined) {
                            titleEl.innerHTML = buildAvailabilityHtml(
                                extendedProps.disponibility,
                                extendedProps.taken || 0,
                                extendedProps.pendingCount || 0,
                            )
                        } else if (extendedProps.scheduledCount !== undefined) {
                            titleEl.innerHTML = buildScheduledHtml(extendedProps.scheduledCount)
                        }
                    }}
                    eventClick={(info) => {
                        onClickAppointment(info.event.start as Date)
                    }}
                />
            </div>
            <div className="divButtonsCalendar animation-section">
                <Button
                    margin="0"
                    padding=".65rem 1.15rem"
                    fontSize="1rem"
                    width="auto"
                    onSubmit={() => setIsModalOpen(true)}
                    variant="success"
                    iconSVG={
                        <CalendarCheckIcon
                            width="18px"
                            height="18px"
                            fill="currentColor"
                        />
                    }
                >
                    Habilitar turnos
                </Button>
                <Button
                    margin="0"
                    padding=".65rem 1.15rem"
                    fontSize="1rem"
                    width="auto"
                    variant="ghost"
                    onSubmit={() => setActiveView("services")}
                >
                    Volver
                </Button>
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
