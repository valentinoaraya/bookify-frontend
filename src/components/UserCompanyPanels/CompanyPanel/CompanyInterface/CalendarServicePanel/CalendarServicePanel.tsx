import "./CalendarServicePanel.css"
import Title from "../../../../../common/Title/Title";
import { type Service } from "../../../../../types";
import Button from "../../../../../common/Button/Button";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"
import { useContext, useState } from "react";
import ModalForm from "../../../../ModalForm/ModalForm";
import { useFetchData } from "../../../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../../../config";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { parseDateToString } from "../../../../../utils/parseDateToString";
import { CompanyContext } from "../../../../../contexts/CompanyContext";

interface Props {
    service: Service
}

const CalendarServicePanel: React.FC<Props> = ({ service }) => {

    const token = localStorage.getItem("access_token")
    const { state, updateServices } = useContext(CompanyContext)
    const [availableAppointments, setAvailableAppointments] = useState<string[]>(service.availableAppointments)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/enable-appointments/${service._id}`,
        "POST",
        token
    )
    const { isLoading: isLoadingDelete, error: errorDelete, fetchData: fetchDataDelete } = useFetchData(
        `${BACKEND_API_URL}/services/delete-appointment/${service._id}`,
        "DELETE",
        token
    )

    const arrayEvents = availableAppointments?.map(availableAppointment => {
        return {
            title: window.innerWidth <= 1150 ? "" : "Disponible",
            start: availableAppointment,
            backgroundColor: "green",
            borderColor: "green"
        }
    })
    const arrayEventsScheduled = service.scheduledAppointments.map(scheduledAppointment => {
        return {
            title: window.innerWidth <= 1150 ? "" : "Ocupado",
            start: scheduledAppointment,
            backgroundColor: "red",
            borderColor: "red"
        }
    })

    const onSubmitForm = async (data: { [key: string]: any }) => {
        const response = await fetchData(data)
        setIsModalOpen(false)
        if (response.data) {
            const serviceUpdated = { ...service, availableAppointments: response.data }
            setAvailableAppointments(response.data)
            updateServices(state.services.map(service => service._id === serviceUpdated._id ? serviceUpdated : service))
            notifySuccess("Turnos habilitados correctamente.")
        }
        if (response.error) notifyError("Error al habilitar los turnos.")

    }

    const deleteAppointment = async (date: Date) => {
        const { stringDate, time } = parseDateToString(date)
        const response = await fetchDataDelete({ date: `${stringDate} ${time}` })
        if (response.data) {
            const newAvailableAppointments = availableAppointments.filter(availableAppointment => availableAppointment !== `${stringDate} ${time}`)
            setAvailableAppointments(newAvailableAppointments)
            const serviceUpdated = { ...service, availableAppointments: newAvailableAppointments }
            updateServices(state.services.map(service => service._id === serviceUpdated._id ? serviceUpdated : service))
        }
        if (response.error) notifyError("Error al eliminar turno")
    }

    if (error || errorDelete) notifyError("Error al habilitar los turnos")

    return (
        <>
            <Title
                fontSize={window.innerWidth <= 930 ? "1.5rem" : ""}
            >
                Calendario para {service.title}
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
                        if (info.event.backgroundColor === "red") {
                            notifyError("No es posible eliminar un turno asignado desde este panel.")
                        } else {
                            deleteAppointment(info.event.start as Date)
                        }
                    }}
                />
            </div>
            <Button onSubmit={() => setIsModalOpen(true)}>Habilitar turnos</Button>
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
                disabledButtons={isLoading || isLoadingDelete}
                initialData={{
                    hourStart: "",
                    hourFinish: "",
                    turnEach: "",
                    days: null
                }}
            />
        </>
    );
}

export default CalendarServicePanel;