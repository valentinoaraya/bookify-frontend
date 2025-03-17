import "./AppointmentCard.css";
import Button from "../../../common/Button/Button";
import { parseDateToString } from "../../../utils/parseDateToString";
import { confirmDelete } from "../../../utils/alerts";
import { useFetchData } from "../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../config";
import { notifyError, notifySuccess } from "../../../utils/notifications";
import { type User, type Appointment, type Company } from "../../../types";
import { formatDate } from "../../../utils/formatDate";

interface Props {
    _id: string;
    title: string;
    date: string;
    serviceId: string;
    company?: string;
    companyLocation?: string;
    servicePrice?: number;
    serviceDuration?: number;
    client?: string;
    clientEmail?: string;
    clientPhone?: string;
    state: User | Company;
    onCancelAppointment: (appointments: Appointment[], appointmentToDelete: string, serviceId: string) => void;
}

const AppointmentCard: React.FC<Props> = ({
    _id,
    serviceId,
    title,
    date,
    company,
    companyLocation,
    serviceDuration,
    servicePrice,
    client,
    clientEmail,
    clientPhone,
    state,
    onCancelAppointment
}) => {
    const token = localStorage.getItem("access_token")
    const { error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/appointments/${state.type === "user" ? "cancel" : "delete"}-appointment/${_id}`,
        "DELETE",
        token
    )

    if (error) notifyError("Error al cancelar turno. Inténtalo de nuevo más tarde.")

    const { stringDate, time } = parseDateToString(date)
    const formattedDate = formatDate(stringDate)
    const handleCancelAppointment = async () => {
        const confirm = await confirmDelete({
            question: "¿Seguro que desea cancelar el turno?",
            mesasge: client ? "Si cobraste una seña por este turno, se le devolverá el dinero al cliente." : "Si pagaste una seña para este turno, se te devolverá el 50% del dinero.",
            icon: "warning",
            cancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Aceptar"
        })
        if (confirm) {
            const response = await fetchData({})
            if (response.data) {
                onCancelAppointment(
                    state.type === "user" ?
                        state.appointments.filter(appointment => appointment._id !== response.data._id)
                        :
                        state.scheduledAppointments.filter(appointment => appointment._id !== response.data._id)
                    , `${stringDate} ${time}`, serviceId
                )
                notifySuccess("Turno cancelado con éxito.")
            }
            if (response.error) {
                notifyError(response.error)
            }
        }
    }

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
                <p className="parrafAppointment"><span>Fecha:</span> {formattedDate}</p>
                <p className="parrafAppointment"><span>Horario:</span> {time} hs</p>
            </div>
            <Button
                onSubmit={handleCancelAppointment}
                fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                padding=".8rem"
            >
                Cancelar turno
            </Button>
        </div>
    );
}

export default AppointmentCard;
