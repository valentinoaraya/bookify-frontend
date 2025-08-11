import "./UserInterface.css"
import { type ServiceToSchedule, type Service, type CompanyToUser } from "../../../../types";
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

    const [results, setResults] = useState<Service[] | null>(company.services || null)
    const [serviceToSchedule, setServiceToSchedule] = useState<ServiceToSchedule | null>(null)

    return (
        <div className="divInterfaceUserContainer">
            <ToastContainer />
            <div className="divUserPanel">
                <DataCompany
                    dataCompany={company}
                />
                <div className="userPanelContent">
                    {
                        serviceToSchedule ?
                            <ServiceToSchedulePanel
                                setResults={setResults}
                                serviceToSchedule={serviceToSchedule}
                                setServiceToSchedule={setServiceToSchedule}
                            />
                            :
                            <>
                                <Title>
                                    Servicios disponibles
                                </Title>
                                <ResultsPanel
                                    company={company}
                                    setServiceToSchedule={setServiceToSchedule}
                                    results={results}
                                />
                            </>
                    }
                </div>
            </div>
        </div>
    );
}

export default UserInterface;
