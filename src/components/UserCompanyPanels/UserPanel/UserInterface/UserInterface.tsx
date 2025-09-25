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

    return (
        <div className="divInterfaceUserContainer">
            <ToastContainer />
            <div className="divUserPanel">
                <DataCompany
                    dataCompany={company}
                    servicesLenght={company.services.length}
                />
                <div className="userPanelContent">
                    {
                        serviceToScheduleId ?
                            <ServiceToSchedulePanel
                                bookingAnticipationHours={company.bookingAnticipationHours}
                                serviceToSchedule={serviceToScheduleId}
                                setServiceToSchedule={setServiceToScheduleId}
                            />
                            :
                            <>
                                <Title>
                                    Servicios disponibles
                                </Title>
                                <ResultsPanel
                                    company={company}
                                    setServiceToSchedule={setServiceToScheduleId}
                                    results={company.services}
                                />
                            </>
                    }
                </div>
            </div>
        </div>
    );
}

export default UserInterface;
