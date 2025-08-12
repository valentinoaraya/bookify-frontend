import "./DataCompany.css";
import { ClockIcon, CalendarCheckIcon, UsersIcon } from "../../../common/Icons/Icons";
import { Appointment, type CompanyToUser } from "../../../types";

interface Props {
    dataCompany: CompanyToUser;
    children?: React.ReactNode;
    scheduledAppointments?: Appointment[];
}

const DataCompany: React.FC<Props> = ({ dataCompany, children, scheduledAppointments }) => {

    const availableAppointmentsQuantity = dataCompany.services.reduce((total, service) => {
        return total + (service.availableAppointments ? service.availableAppointments.length : 0);
    }, 0);

    const todayAppointments = scheduledAppointments
        ? scheduledAppointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            const today = new Date();
            return appointmentDate.getDate() === today.getDate() &&
                appointmentDate.getMonth() === today.getMonth() &&
                appointmentDate.getFullYear() === today.getFullYear();
        })
        : [];

    return (
        <div className="dataCompanyPanel">
            <div className="dataContent">
                <div className="titleContainer">
                    <h2 className="h2TitleCompanyPanel">{dataCompany.name}</h2>
                    {scheduledAppointments && <p>Gestioná tus turnos y servicios</p>}
                </div>
                <div className="dataContainer">
                    <p className="parrafData">
                        <span>Teléfono</span>
                        {dataCompany.phone}
                    </p>
                    <p className="parrafData">
                        <span>Email</span>
                        {dataCompany.email}
                    </p>
                    <p className="parrafData">
                        <span>Ubicación: </span>
                        {dataCompany.city} - {dataCompany.street} {dataCompany.number}
                    </p>
                </div>
                {children}
            </div>
            <div className="divQuantityAppointmentsContainer">
                {
                    scheduledAppointments ?
                        <>
                            <div className="divQuantityAppointments">
                                <ClockIcon
                                    width="36px"
                                    height="36px"
                                    fill="#1282A2"
                                />
                                <div>
                                    <h2>{todayAppointments.length}</h2>
                                    <h3>Turnos para hoy</h3>
                                </div>
                            </div>
                            <div className="divQuantityAppointments">
                                <CalendarCheckIcon
                                    width="36px"
                                    height="36px"
                                    fill="#1282A2"
                                />
                                <div>
                                    <h2>{scheduledAppointments.length}</h2>
                                    <h3>Turnos totales</h3>
                                </div>
                            </div>
                        </>
                        :
                        <>
                            <div className="divQuantityAppointments">
                                <CalendarCheckIcon
                                    width="36px"
                                    height="36px"
                                    fill="#1282A2"
                                />
                                <div>
                                    <h2>{availableAppointmentsQuantity}</h2>
                                    <h3>Turnos disponibles</h3>
                                </div>
                            </div>
                        </>
                }
                <div className="divQuantityAppointments">
                    <UsersIcon
                        width="36px"
                        height="36px"
                        fill="#1282A2"
                    />
                    <div>
                        <h2>{dataCompany.services.length}</h2>
                        <h3>Servicios activos</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataCompany;
