import "./UserInterface.css"
import { type CompanyToUser } from "../../../../types";
import { ToastContainer } from "react-toastify";
import { useState } from "react";
import ResultsPanel from "./ResultsPanel/ResultsPanel";
import ServiceToSchedulePanel from "./ServiceToSchedulePanel/ServiceToSchedulePanel";
import DataCompany from "../../DataCompany/DataCompany";
import Title from "../../../../common/Title/Title";

interface Props {
    company: CompanyToUser;
}

const UserInterface: React.FC<Props> = ({ company }) => {
    const [serviceToScheduleId, setServiceToScheduleId] = useState<string | null>(null)
    const servicesCount = company.services.length

    return (
        <div className="divInterfaceUserContainer">
            <ToastContainer />
            <div className="divUserPanel">
                <DataCompany
                    variant="user"
                    dataCompany={company}
                    servicesLength={servicesCount}
                />
                <div className={`userServicesContent ${serviceToScheduleId ? "is-scheduling" : ""}`}>
                    {serviceToScheduleId ? (
                        <ServiceToSchedulePanel
                            company={company}
                            slotsVisibilityDays={company.slotsVisibilityDays}
                            cancellationAnticipationHours={company.cancellationAnticipationHours}
                            serviceToSchedule={serviceToScheduleId}
                            setServiceToSchedule={setServiceToScheduleId}
                        />
                    ) : (
                        <>
                            <header className="userServicesHeader">
                                <Title>Servicios disponibles</Title>
                                <p className="userServicesSubtitle">
                                    {servicesCount === 0
                                        ? "Elegí un servicio para ver horarios y reservar."
                                        : `${servicesCount} servicio${servicesCount !== 1 ? "s" : ""} · tocá uno para ver turnos`}
                                </p>
                            </header>
                            <ResultsPanel
                                company={company}
                                setServiceToSchedule={setServiceToScheduleId}
                                results={company.services}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserInterface;
