import "./ServiceToSchedulePanel.css"
import Button from "../../../../../common/Button/Button";
import { type UserData } from "../../../../../types";
import { notifyError } from "../../../../../utils/notifications";
import ModalForm from "../../../../ModalForm/ModalForm";
import { useEffect, useMemo, useState } from "react";
import LoadingModal from "../../../../../common/LoadingModal/LoadingModal";
import LoadingSpinner from "../../../../../common/LoadingSpinner/LoadingSpinner";
import DayCard from "./DayCard";
import TimeSlotCard from "./TimeSlotCard";
import { getServiceSlots } from "../../../../../utils/cleanAppointmentsArray";
import { useBookAppointment } from "@/features/public-booking/hooks/useBookAppointment";

interface Props {
    slotsVisibilityDays: number;
    cancellationAnticipationHours: number;
    serviceToSchedule: string;
    setServiceToSchedule: React.Dispatch<React.SetStateAction<string | null>>;
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const
const DAY_NAMES_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const
const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const

const modeLabel = {
    "in-person": "Presencial",
    online: "Virtual",
    "in-person-at-home": "A domicilio",
} as const

const ServiceToSchedulePanel: React.FC<Props> = ({
    serviceToSchedule,
    setServiceToSchedule,
    cancellationAnticipationHours,
    slotsVisibilityDays,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [dateAppointment, setDateAppointment] = useState<Date | null>(null)
    const [selectedDay, setSelectedDay] = useState<string | null>(null)

    const {
        serviceData: serviceToScheduleData,
        isLoadingData,
        isLoadingCheckHour,
        isLoadingConfirm,
        isScheduling,
        checkOrderHour,
        confirmAppointment,
    } = useBookAppointment(serviceToSchedule, {
        cancellationAnticipationHours,
        onScheduled: () => setServiceToSchedule(null),
    })

    const weekDays = useMemo(() => {
        const days = []
        const today = new Date()

        for (let i = 0; i < slotsVisibilityDays; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)

            days.push({
                date: new Intl.DateTimeFormat("es-AR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    timeZone: "America/Argentina/Buenos_Aires",
                })
                    .format(date)
                    .split("/")
                    .reverse()
                    .join("-"),
                dayName: DAY_NAMES[date.getDay()],
                dayNameShort: DAY_NAMES_SHORT[date.getDay()],
                dayNumber: date.getDate(),
                month: MONTH_NAMES[date.getMonth()],
            })
        }

        return days
    }, [slotsVisibilityDays])

    const getTimeSlotsForDay = (dayDate: string) => {
        if (!serviceToScheduleData) return []

        const slots = getServiceSlots(serviceToScheduleData)
        const dayAppointments = slots.filter(
            appointment => appointment.datetime.startsWith(dayDate)
        )

        const now = new Date()
        const pendingByDatetime = (serviceToScheduleData.pendingAppointments || [])
            .filter(pending => new Date(pending.expiresAt) > now)
            .reduce<Record<string, number>>((acc, pending) => {
                const key = new Date(pending.datetime).getTime()
                acc[key] = (acc[key] ?? 0) + 1
                return acc
            }, {})

        return dayAppointments.map(appointment => {
            const date = new Date(appointment.datetime)
            const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
            const pendingCount = pendingByDatetime[date.getTime()] ?? 0
            const availablePlaces = appointment.capacity - appointment.taken - pendingCount

            return {
                datetime: appointment.datetime,
                time,
                availablePlaces,
                totalCapacity: appointment.capacity,
                isAvailable: availablePlaces > 0 && date > now,
            }
        }).sort((a, b) => a.time.localeCompare(b.time))
    }

    const getAvailableSlotsForDay = (dayDate: string) => {
        return getTimeSlotsForDay(dayDate).filter(slot => slot.isAvailable).length
    }

    useEffect(() => {
        setSelectedDay(null)
    }, [serviceToSchedule])

    useEffect(() => {
        if (!serviceToScheduleData || selectedDay !== null || weekDays.length === 0) return
        const firstWithSlots = weekDays.find(day => getAvailableSlotsForDay(day.date) > 0)
        setSelectedDay(firstWithSlots?.date ?? weekDays[0].date)
        // Intencional: solo auto-seleccionar cuando todavía no hay día elegido
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serviceToScheduleData, selectedDay, weekDays])

    if (isLoadingData) {
        return (
            <div className="serviceToScheduleContainer">
                <LoadingSpinner text="Cargando turnos..." shadow="none" />
            </div>
        )
    }

    if (!serviceToScheduleData) {
        return (
            <div className="serviceToScheduleContainer serviceNotFound">
                <h2>No encontramos ese servicio</h2>
                <p>Volvé a la lista e intentá con otro.</p>
                <Button
                    margin="1rem 0 0"
                    width="auto"
                    padding="0.65rem 1.15rem"
                    fontSize="1rem"
                    variant="ghost"
                    onSubmit={() => setServiceToSchedule(null)}
                >
                    Volver a servicios
                </Button>
            </div>
        )
    }

    const checkOrderHourForSlot = async (datetime: string) => {
        const startEvent = new Date(datetime)
        const canBook = await checkOrderHour(serviceToScheduleData.companyId, datetime)
        if (canBook) {
            setDateAppointment(startEvent)
            setIsOpen(true)
        }
    }

    const selectedDayData = weekDays.find(d => d.date === selectedDay)
    const selectedSlots = selectedDay ? getTimeSlotsForDay(selectedDay) : []
    const availableSelectedSlots = selectedSlots.filter(slot => slot.isAvailable)

    return (
        <div className="serviceToScheduleContainer animation-section">
            <header className="scheduleHeader">
                <div className="scheduleHeaderTop">
                    <Button
                        margin="0"
                        width="auto"
                        padding="0.5rem 0.95rem"
                        fontSize="0.9rem"
                        fontWeight="600"
                        variant="ghost"
                        onSubmit={() => setServiceToSchedule(null)}
                    >
                        ← Volver
                    </Button>
                </div>
                <h1 className="scheduleTitle">{serviceToScheduleData.title}</h1>
                <p className="scheduleSubtitle">Elegí un día y un horario para reservar</p>
                <div className="scheduleMeta">
                    <span className={`scheduleMode scheduleMode--${serviceToScheduleData.mode === "online" ? "online" : "presencial"}`}>
                        {modeLabel[serviceToScheduleData.mode]}
                    </span>
                    <span className="scheduleMetaDot" aria-hidden="true">·</span>
                    <span>{serviceToScheduleData.duration} min</span>
                    <span className="scheduleMetaDot" aria-hidden="true">·</span>
                    <span className="schedulePrice">${serviceToScheduleData.price}</span>
                    {serviceToScheduleData.signPrice !== 0 && (
                        <>
                            <span className="scheduleMetaDot" aria-hidden="true">·</span>
                            <span>Seña ${serviceToScheduleData.signPrice}</span>
                        </>
                    )}
                </div>
            </header>

            <section className="scheduleDaysSection" aria-label="Días disponibles">
                <h2 className="scheduleSectionLabel">Día</h2>
                <div className="weekDaysContainer">
                    {weekDays.map((day) => (
                        <DayCard
                            key={day.date}
                            dayName={day.dayName}
                            dayNameShort={day.dayNameShort}
                            dayNumber={day.dayNumber}
                            month={day.month}
                            availableSlots={getAvailableSlotsForDay(day.date)}
                            isSelected={selectedDay === day.date}
                            onClick={() => setSelectedDay(day.date)}
                        />
                    ))}
                </div>
            </section>

            {selectedDay && selectedDayData && (
                <section className="timeSlotsContainer animation-section" aria-label="Horarios disponibles">
                    <div className="timeSlotsHeader">
                        <h2 className="timeSlotsTitle">
                            {selectedDayData.dayName} {selectedDayData.dayNumber} de {selectedDayData.month}
                        </h2>
                        <p className="timeSlotsHint">
                            {availableSelectedSlots.length === 0
                                ? "No hay horarios libres este día"
                                : `${availableSelectedSlots.length} horario${availableSelectedSlots.length !== 1 ? "s" : ""} libre${availableSelectedSlots.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>

                    {selectedSlots.length === 0 ? (
                        <p className="noSlotsMessage">No hay horarios cargados para este día.</p>
                    ) : (
                        <div className="timeSlotsGrid">
                            {selectedSlots.map((slot) => (
                                <TimeSlotCard
                                    key={slot.datetime}
                                    time={slot.time}
                                    availablePlaces={slot.availablePlaces}
                                    totalCapacity={slot.totalCapacity}
                                    isAvailable={slot.isAvailable}
                                    onClick={() => checkOrderHourForSlot(slot.datetime)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}

            <ModalForm
                title="Completa tus datos"
                isOpen={isOpen}
                inputs={
                    serviceToScheduleData.mode === "in-person-at-home"
                        ? [
                            { type: "text", name: "name", placeholder: "Nombre", label: "Nombre" },
                            { type: "text", name: "lastName", placeholder: "Apellido", label: "Apellido" },
                            { type: "text", name: "email", placeholder: "Email", label: "Email" },
                            { type: "text", name: "dni", placeholder: "DNI", label: "DNI" },
                            { type: "text", name: "phone", placeholder: "Teléfono", label: "Teléfono" },
                            { type: "text", name: "userLocation", placeholder: "Calle, número y ciudad", label: "Tu dirección" },
                        ]
                        : [
                            { type: "text", name: "name", placeholder: "Nombre", label: "Nombre" },
                            { type: "text", name: "lastName", placeholder: "Apellido", label: "Apellido" },
                            { type: "text", name: "email", placeholder: "Email", label: "Email" },
                            { type: "text", name: "dni", placeholder: "DNI", label: "DNI" },
                            { type: "text", name: "phone", placeholder: "Teléfono", label: "Teléfono" },
                        ]
                }
                initialData={{ name: "", lastName: "", email: "", dni: "", phone: "", userLocation: "" }}
                onClose={() => setIsOpen(false)}
                onSubmitForm={(data) => {
                    if (!dateAppointment) return notifyError("No se ha especificado una fecha para el turno.")
                    confirmAppointment(serviceToScheduleData, dateAppointment, data as UserData)
                    setIsOpen(false)
                }}
                disabledButtons={isScheduling}
            />
            <LoadingModal
                text={isLoadingConfirm ? "Verificando servicio..." : "Agendando turno..."}
                isOpen={isScheduling || isLoadingConfirm}
            />
            <LoadingModal
                text="Verificando horario..."
                isOpen={isLoadingCheckHour}
            />
        </div>
    );
}

export default ServiceToSchedulePanel;
