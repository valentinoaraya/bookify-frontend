import "./UserInterface.css"
import { type ServiceToSchedule, type Service, type Company } from "../../../../types";
import { ToastContainer } from "react-toastify";
import { useState } from "react";
import ResultsPanel from "./ResultsPanel/ResultsPanel";
import ServiceToSchedulePanel from "./ServiceToSchedulePanel/ServiceToSchedulePanel";

interface Props {
    company: Omit<Company, "scheduledAppointments">;
}

const UserInterface: React.FC<Props> = ({ company }) => {

    const [results, setResults] = useState<Service[] | null>(null)
    const [serviceToSchedule, setServiceToSchedule] = useState<ServiceToSchedule | null>(null)

    return (
        <div className="divInterfaceUserContainer">
            <ToastContainer />
            <div className="divUserPanel">
                {
                    serviceToSchedule ?
                        <ServiceToSchedulePanel
                            setResults={setResults}
                            serviceToSchedule={serviceToSchedule}
                            setServiceToSchedule={setServiceToSchedule}
                        />
                        :
                        <ResultsPanel
                            setServiceToSchedule={setServiceToSchedule}
                            results={company.services}
                        />

                }
            </div>
        </div>
    );
}

export default UserInterface;
