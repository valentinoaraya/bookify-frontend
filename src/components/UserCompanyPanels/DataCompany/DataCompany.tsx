import "./DataCompany.css";
import { ClockIcon, CalendarCheckIcon, UsersIcon, SettingsIcon } from "../../../common/Icons/Icons";
import { Appointment, type CompanyToUser } from "../../../types";
import Button from "../../../common/Button/Button";
import ModalSettings from "./ModalSettings/ModalSettings";
import { SetStateAction } from "react";

interface Props {
    dataCompany: CompanyToUser;
    children?: React.ReactNode;
    scheduledAppointments?: Appointment[];
    servicesLength?: number;
    /** @deprecated use servicesLength */
    servicesLenght?: number;
    variant?: "user" | "company";
    isModalOpen?: boolean
    setIsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>
    active?: string
    setActive?: React.Dispatch<SetStateAction<string>>
}

const DataCompany: React.FC<Props> = ({
    dataCompany,
    children,
    scheduledAppointments,
    servicesLength,
    servicesLenght,
    variant = "user",
    isModalOpen = false,
    setIsModalOpen,
    active = "",
    setActive,
}) => {
    const servicesCount = servicesLength ?? servicesLenght ?? 0
    const isCompany = variant === "company"

    const todayAppointments = scheduledAppointments
        ? scheduledAppointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            const today = new Date();
            return appointmentDate.getDate() === today.getDate() &&
                appointmentDate.getMonth() === today.getMonth() &&
                appointmentDate.getFullYear() === today.getFullYear();
        })
        : [];

    const openSettings = () => {
        if (!setActive || !setIsModalOpen) return
        setActive("profile")
        setIsModalOpen(true)
    }

    return (
        <div className={`dataCompanyPanel ${variant === "user" ? "user" : ""}`}>
            <div className="dataCompanyMobileHeader">
                <div className="dataCompanyMobileHeaderText">
                    <h2 className="h2TitleCompanyPanel">{dataCompany.name}</h2>
                    <p>{isCompany ? "Gestioná tus turnos y servicios" : "Reservá tu turno"}</p>
                </div>
                {isCompany && setIsModalOpen && setActive && (
                    <Button
                        iconSVG={
                            <SettingsIcon
                                width="22px"
                                height="22px"
                                fill="white"
                            />
                        }
                        padding="0.75rem"
                        width="auto"
                        variant="primary"
                        fontSize="1rem"
                        fontWeight="600"
                        margin="0"
                        onSubmit={openSettings}
                    />
                )}
            </div>
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
                    {
                        (() => {
                            const defaultLoc =
                                dataCompany.locations?.find((l) => l.isDefault) ??
                                dataCompany.locations?.[0]
                            if (defaultLoc) {
                                return (
                                    <p className="parrafData">
                                        <span>Ubicación: </span>
                                        {dataCompany.locations && dataCompany.locations.length > 1
                                            ? `${defaultLoc.name} (+${dataCompany.locations.length - 1})`
                                            : `${defaultLoc.city} - ${defaultLoc.street} ${defaultLoc.number}`}
                                    </p>
                                )
                            }
                            if (dataCompany.city && dataCompany.street && dataCompany.number) {
                                return (
                                    <p className="parrafData">
                                        <span>Ubicación: </span>
                                        {dataCompany.city} - {dataCompany.street} {dataCompany.number}
                                    </p>
                                )
                            }
                            return null
                        })()
                    }
                </div>
                {children}
            </div>
            <div className="divQuantityAppointmentsContainer">
                {
                    scheduledAppointments &&
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
                            <h2>{servicesCount}</h2>
                        </div>
                        <h2 className="iconContainer">{servicesCount}</h2>
                        <h3>Servicios activos</h3>
                    </div>
                </div>
            </div>
            {
                isCompany && setIsModalOpen && setActive &&
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
                            variant="primary"
                            fontSize="1rem"
                            fontWeight="600"
                            margin="0"
                            onSubmit={openSettings}
                        >
                            Configuración
                        </Button>
                    </div>
                    <ModalSettings
                        active={active}
                        setActive={setActive}
                        isOpen={isModalOpen}
                        setIsOpen={setIsModalOpen}
                    />
                </>
            }
        </div>
    );
}

export default DataCompany;
