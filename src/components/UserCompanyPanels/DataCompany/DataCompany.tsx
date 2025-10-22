import "./DataCompany.css";
import { ClockIcon, CalendarCheckIcon, UsersIcon, SettingsIcon } from "../../../common/Icons/Icons";
import { Appointment, type CompanyToUser } from "../../../types";
import Button from "../../../common/Button/Button";
import ModalSettings from "./ModalSettings/ModalSettings";
import { useState } from "react";

interface Props {
    dataCompany: CompanyToUser;
    children?: React.ReactNode;
    scheduledAppointments?: Appointment[];
    servicesLenght?: number;
}

const DataCompany: React.FC<Props> = ({ dataCompany, children, scheduledAppointments, servicesLenght }) => {

    const [isModalOpen, setIsModalOpen] = useState(false)

    const availableAppointmentsQuantity = dataCompany.services.reduce((acc, service) => {
        return acc + service.availableAppointments.reduce((acc, appointment) => {
            return acc + appointment.capacity - appointment.taken;
        }, 0);
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
                                <div className="iconContainer">
                                    <ClockIcon
                                        width="36px"
                                        height="36px"
                                        fill="#1282A2"
                                    />
                                </div>
                                <div className="divQuantityAppointmentsText">
                                    <div className="divQuantityAppointmentsTextInner">
                                        <ClockIcon
                                            width="20px"
                                            height="20px"
                                            fill="#1282A2"
                                        />
                                        <h2>{todayAppointments.length}</h2>
                                    </div>
                                    <h2 className="iconContainer">{todayAppointments.length}</h2>
                                    <h3>Turnos para hoy</h3>
                                </div>
                            </div>
                            <div className="divQuantityAppointments">
                                <div className="iconContainer">
                                    <CalendarCheckIcon
                                        width="36px"
                                        height="36px"
                                        fill="#1282A2"
                                    />
                                </div>
                                <div className="divQuantityAppointmentsText">
                                    <div className="divQuantityAppointmentsTextInner">
                                        <CalendarCheckIcon
                                            width="20px"
                                            height="20px"
                                            fill="#1282A2"
                                        />
                                        <h2>{scheduledAppointments.length}</h2>
                                    </div>
                                    <h2 className="iconContainer">{scheduledAppointments.length}</h2>
                                    <h3>Turnos totales</h3>
                                </div>
                            </div>
                        </>
                        :
                        <>
                            <div className="divQuantityAppointments">
                                <div className="iconContainer">
                                    <CalendarCheckIcon
                                        width="36px"
                                        height="36px"
                                        fill="#1282A2"
                                    />
                                </div>
                                <div className="divQuantityAppointmentsText">
                                    <div className="divQuantityAppointmentsTextInner">
                                        <CalendarCheckIcon
                                            width="20px"
                                            height="20px"
                                            fill="#1282A2"
                                        />
                                        <h2>{availableAppointmentsQuantity}</h2>
                                    </div>
                                    <h2 className="iconContainer">{availableAppointmentsQuantity}</h2>
                                    <h3>Turnos disponibles</h3>
                                </div>
                            </div>
                        </>
                }
                <div className="divQuantityAppointments">
                    <div className="iconContainer">
                        <UsersIcon
                            width="36px"
                            height="36px"
                            fill="#1282A2"
                        />
                    </div>
                    <div className="divQuantityAppointmentsText">
                        <div className="divQuantityAppointmentsTextInner">
                            <UsersIcon
                                width="20px"
                                height="20px"
                                fill="#1282A2"
                            />
                            <h2>{servicesLenght}</h2>
                        </div>
                        <h2 className="iconContainer">{servicesLenght}</h2>
                        <h3>Servicios activos</h3>
                    </div>
                </div>
                {
                    window.location.pathname === "/company-panel" &&
                    <div className="divButtonSettingsMobile">
                        <Button
                            iconSVG={
                                <SettingsIcon
                                    width={window.innerWidth >= 740 ? "30px" : "25px"}
                                    height={window.innerWidth >= 740 ? "30px" : "25px"}
                                    fill="white"
                                />
                            }
                            padding="1rem"
                            backgroundColor="#1282A2"
                            fontSize="1rem"
                            fontWeight="600"
                            margin="0"
                            onSubmit={() => setIsModalOpen(true)}
                        >
                        </Button>
                    </div>
                }
            </div>
            {
                window.location.pathname === "/company-panel" &&
                <>
                    <div className="divButtonSettings">
                        <Button
                            iconSVG={
                                <SettingsIcon
                                    width="20px"
                                    height="20px"
                                    fill="white"
                                />
                            }
                            backgroundColor="#1282A2"
                            fontSize="1rem"
                            fontWeight="600"
                            margin="0"
                            onSubmit={() => setIsModalOpen(true)}
                        >
                            Configuración
                        </Button>
                    </div>
                    <ModalSettings
                        isOpen={isModalOpen}
                        setIsOpen={setIsModalOpen}
                    />
                </>
            }
        </div>
    );
}

export default DataCompany;
