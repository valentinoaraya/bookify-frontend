import "./AppointmentCard.css"
import Button from "../../../common/Button/Button";

interface Props {
    title: string;
    date: string;
    company?: string;
    companyLocation?: string;
    servicePrice?: number;
    serviceDuration?: number;
    client?: string;
    clientEmail?: string;
    clientPhone?: string;
}

const AppointmentCard: React.FC<Props> = ({
    title,
    date,
    company,
    companyLocation,
    serviceDuration,
    servicePrice,
    client,
    clientEmail,
    clientPhone
}) => {

    const newDate = new Date(date)
    const stringDate = `${String(newDate.getDate()).padStart(2, "0")} - ${String(newDate.getMonth() + 1).padStart(2, "0")} - ${newDate.getFullYear()}`
    const time = `${String(newDate.getHours()).padStart(2, "0")}:${String(newDate.getMinutes()).padStart(2, "0")}`

    return (
        <div className="appointmentCard">
            <h2 className="titleService">{title}</h2>
            {company && <p className="parrafAppointment"><span>En {company}</span></p>}
            <div className="divDataContainer">
                {
                    client &&
                    <>
                        <p className="parrafAppointment"><span>Cliente:</span> {client}</p>
                        <p className="parrafAppointment"><span>Email:</span> {clientEmail}</p>
                        <p className="parrafAppointment"><span>Teléfono:</span> {clientPhone}</p>
                    </>
                }
                {
                    company &&
                    <>
                        <p className="parrafAppointment"><span>Ubicación:</span> {companyLocation}</p>
                        <p className="parrafAppointment"><span>Duración:</span> {serviceDuration} mins</p>
                        <p className="parrafAppointment"><span>Precio:</span> ${servicePrice}</p>
                    </>
                }
                <p className="parrafAppointment"><span>Fecha:</span> {stringDate}</p>
                <p className="parrafAppointment"><span>Horario:</span> {time} hs</p>
            </div>
            <Button
                fontSize="1.2rem"
                padding=".8rem"
            >
                Cancelar turno
            </Button>
        </div>
    );
}

export default AppointmentCard;
