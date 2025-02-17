import "./CalendarServicePanel.css"
import Title from "../../../../../common/Title/Title";
import { Appointment, type Service } from "../../../../../types";
import Button from "../../../../../common/Button/Button";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"

interface Props {
    service: Service | null
    scheduledAppointmens: Appointment[]
}

const CalendarServicePanel: React.FC<Props> = ({ service, scheduledAppointmens }) => {

    console.log(scheduledAppointmens)

    return (
        <>
            <Title>
                Calendario para {service?.title}
            </Title>
            <div className="calendarContainer">
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridWeek"
                    contentHeight={"72vh"}
                    locale={"es"}
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
                />
            </div>
            <Button>Habilitar turnos</Button>
        </>
    );
}

export default CalendarServicePanel;
