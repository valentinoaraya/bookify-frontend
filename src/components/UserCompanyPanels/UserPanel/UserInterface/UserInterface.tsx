import "./UserInterface.css"
import SideBar from "../../../Bars/SideBar/SideBar";
import { type ServiceToSchedule, type Service, type User } from "../../../../types";
import SearchBar from "../../../Bars/SearchBar/SearchBar";
import { ToastContainer } from "react-toastify";
import { useState } from "react";
import AppointmentsPanel from "./AppointmentsPanel/AppointmentsPanel";
import ResultsPanel from "./ResultsPanel/ResultsPanel";
import ServiceToSchedulePanel from "./ServiceToSchedulePanel/ServiceToSchedulePanel";
import moment from "moment";
import NavBar from "../../../Bars/NavBar/NavBar";

interface Props {
    user: User
}

const UserInterface: React.FC<Props> = ({ user }) => {

    const [results, setResults] = useState<Service[] | null>(null)
    const [serviceToSchedule, setServiceToSchedule] = useState<ServiceToSchedule | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const sortedAppointments = user.appointments.sort((a, b) => moment(a.date, "YYYY-MM-DD HH:mm").valueOf() - moment(b.date, "YYYY-MM-DD HH:mm").valueOf())

    return (
        <div className="divInterfaceUserContainer">
            <ToastContainer />
            <NavBar
                data={{ ...user, type: "user" }}
                onBack={() => {
                    setServiceToSchedule(null)
                    setResults(null)
                }}
                setIsOpen={setIsOpen}
            />
            <SideBar
                data={{ ...user, type: "user" }}
                onBack={() => {
                    setServiceToSchedule(null)
                    setResults(null)
                }}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                mobile={window.innerWidth <= 930}
            />
            <div className="divUserPanel">
                <SearchBar
                    setResults={setResults}
                />
                {
                    serviceToSchedule ?
                        <ServiceToSchedulePanel
                            serviceToSchedule={serviceToSchedule}
                            setServiceToSchedule={setServiceToSchedule}
                        />
                        :
                        <>
                            {
                                !results ?
                                    <AppointmentsPanel
                                        appointments={sortedAppointments}
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
