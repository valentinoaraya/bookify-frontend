import "./ServiceToSchedulePanel.css"
import Button from "../../../../../common/Button/Button";
import { type ServiceToSchedule } from "../../../../../types";
import Title from "../../../../../common/Title/Title";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"
import { notifyError } from "../../../../../utils/notifications";
import { confirmDelete } from "../../../../../utils/alerts";
import { parseDateToString } from "../../../../../utils/parseDateToString";
import { useNavigate } from "react-router-dom";

interface Props {
    serviceToSchedule: ServiceToSchedule;
    setServiceToSchedule: React.Dispatch<React.SetStateAction<ServiceToSchedule | null>>;
}

const ServiceToSchedulePanel: React.FC<Props> = ({ serviceToSchedule, setServiceToSchedule }) => {

    // const { error, fetchData } = useFetchData(
    //     `${BACKEND_API_URL}/appointments/add-appointment`,
    //     "POST",
    //     token
    // )

    // if (error) notifyError("Error al reservar turno.")
    const navigate = useNavigate()

    const confirmAppointment = async (date: Date) => {

        const { stringDate, time } = parseDateToString(date)

        const decisionConfirmed = await confirmDelete({
            question: `¿Desea reservar un turno para ${serviceToSchedule.title} el día ${stringDate} a las ${time} hs?`,
            mesasge: `Al aceptar, serás redirigido al Checkout donde realizarás el pago de la seña que requiere la empresa para confirmar el turno.`,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            cancelButton: true
        })
        if (decisionConfirmed) {

            navigate("/checkout", {
                state: {
                    date: `${stringDate} ${time}`,
                    service: {
                        serviceId: serviceToSchedule._id,
                        title: serviceToSchedule.title,
                        price: serviceToSchedule.price, // Cambiar por porcentaje o por cantidad neta elegida por la empresa
                        companyId: serviceToSchedule.companyId
                    }
                }
            })

            // const response = await fetchData({
            //     date: `${stringDate} ${time}`,
            //     serviceId: serviceToSchedule._id,
            //     companyId: serviceToSchedule.companyId
            // })

            // if (response.data) {
            //     updateAppointments([...state.appointments, response.data])
            //     const confirm = await confirmDelete({
            //         icon: "success",
            //         question: `Turno confirmado correctamente.`,
            //         confirmButtonText: "Aceptar",
            //         cancelButton: false
            //     })
            //     if (confirm) {
            //         setServiceToSchedule(null)
            //         setResults(null)
            //     }
            // }
            // if (response.error) notifyError("Error al confirmar turno. Inténtelo de nuevo más tarde.")
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
                            confirmAppointment(info.event.start as Date)
                        }
                    }}
                />
            </div>
            <Button onSubmit={() => setServiceToSchedule(null)}>Cancelar</Button>

        </div>
    );
}

export default ServiceToSchedulePanel;
