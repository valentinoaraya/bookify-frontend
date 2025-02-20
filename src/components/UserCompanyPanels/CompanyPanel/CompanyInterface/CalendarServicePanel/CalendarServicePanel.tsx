import "./CalendarServicePanel.css"
import Title from "../../../../../common/Title/Title";
import { Appointment, type Service } from "../../../../../types";
import Button from "../../../../../common/Button/Button";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"
import { useState } from "react";
import ModalForm from "../../../../ModalForm/ModalForm";
import { useFetchData } from "../../../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../../../config";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { ToastContainer } from "react-toastify";
import { parseDateToString } from "../../../../../utils/parseDateToString";

interface Props {
    service: Service | null
    scheduledAppointments: Appointment[]
}

const CalendarServicePanel: React.FC<Props> = ({ service, scheduledAppointments }) => {

    const scheduledAppointmentsOfService = scheduledAppointments.filter(appointment => appointment.serviceId._id === service?._id)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [availableAppointments, setAvailableAppointments] = useState<string[] | undefined>(service?.availableAppointments.filter(availableAppointment => !scheduledAppointmentsOfService.some(scheduledAppointment => scheduledAppointment.date === availableAppointment)))
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/enable-appointments/${service?._id}`,
        "POST",
        true
    )

    const arrayEvents = availableAppointments?.map(availableAppointment => {
        return {
            title: "Disponible",
            start: availableAppointment,
            backgroundColor: "green",
            borderColor: "green"
        }
    })
    const arrayEventsScheduled = scheduledAppointmentsOfService.map(scheduledAppointment => {
        return {
            title: "Ocupado",
            start: scheduledAppointment.date,
            backgroundColor: "red",
            borderColor: "red"
        }
    })

    const onSubmitForm = async (data: { [key: string]: any }) => {
        const response = await fetchData(data)
        setIsModalOpen(false)
        console.log(response)
        if (response.data) {
            setAvailableAppointments(response.data)
            notifySuccess("Turnos habilitados correctamente.")
        }
        if (response.error) notifyError("Error al habilitar los turnos.")

    }

    const deleteAppointment = (date: Date) => {

        // TERMINAR DE IMPLEMENAR EL ELIMINADO DE TURNOS
        // LLAMAR AL ENDPOINT DE ELIMINAR TURNO

        const { stringDate, time } = parseDateToString(date)
        const newAvailableAppointments = availableAppointments?.filter(availableAppointment => availableAppointment !== `${stringDate} ${time}`)
        setAvailableAppointments(newAvailableAppointments)
    }

    if (error) notifyError("Error al habilitar los turnos.")

    return (
        <>
            <ToastContainer />
            <Title>
                Calendario para {service?.title}
            </Title>
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
                        deleteAppointment(info.event.start as Date)
                    }}
                />
            </div>
            <Button onSubmit={() => setIsModalOpen(true)}>Habilitar turnos</Button>
            <ModalForm
                title="Habilitar turnos"
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
                            label: "Selecciona hora del final :",
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
                    days: []
                }}
            />
        </>
    );
}

export default CalendarServicePanel;