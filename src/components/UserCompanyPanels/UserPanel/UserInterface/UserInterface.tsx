import "./UserInterface.css"
import SideBar from "../../SideBar/SideBar";
import { type ServiceToSchedule, type Service, type User } from "../../../../types";
import SearchBar from "../../../SearchBar/SearchBar";
import { ToastContainer } from "react-toastify";
import { useState } from "react";
import AppointmentsUsedServicesPanel from "./AppointmentsUsedServicesPanel/AppointmentsUsedServicesPanel";
import ResultsPanel from "./ResultsPanel/ResultsPanel";
import ServiceToSchedulePanel from "./ServiceToSchedulePanel/ServiceToSchedulePanel";

interface Props {
    user: User
}

const UserInterface: React.FC<Props> = ({ user }) => {

    const [results, setResults] = useState<Service[] | null>(null)
    const [serviceToSchedule, setServiceToSchedule] = useState<ServiceToSchedule | null>(null)

    return (
        <div className="divInterfaceUserContainer">
            <ToastContainer />
            <SideBar data={{ ...user, type: "user" }} />
            <div className="divUserPanel">
                <SearchBar
                    setResults={setResults}
                />
                {
                    serviceToSchedule ?
                        <ServiceToSchedulePanel
                            serviceToSchedule={serviceToSchedule}
                            setServiceToSchedule={setServiceToSchedule}
                            setResults={setResults}
                        />
                        :
                        <>
                            {
                                !results ?
                                    <AppointmentsUsedServicesPanel
                                        appointments={user.appointments}
                                        servicesUsed={user.servicesUsed}
                                    />
                                    :
                                    <ResultsPanel
                                        setServiceToSchedule={setServiceToSchedule}
                                        results={results}
                                    />
                            }
                        </>
                }
            </div>
        </div>
    );
}

export default UserInterface;
