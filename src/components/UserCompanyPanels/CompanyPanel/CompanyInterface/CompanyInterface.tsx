import "./CompanyInterface.css"
import SideBar from "../../SideBar/SideBar";
import { type Company, type View, type Service } from "../../../../types";
import { useContext, useState } from "react";
import ServicesPanel from "./ServicesPanel/ServicesPanel";
import ScheduledAppointmentsPanel from "./ScheduledAppointmentsPanel/ScheduledAppointmentsPanel";
import CalendarServicePanel from "./CalendarServicePanel/CalendarServicePanel";
import { CompanyContext } from "../../../../contexts/CompanyContext";
import { ToastContainer } from "react-toastify";

interface Props {
    company: Company
}

const CompanyInterface: React.FC<Props> = ({ company }) => {

    const { deleteService, updateAppointments } = useContext(CompanyContext)
    const [activeView, setActiveView] = useState<View>("appointments")
    const [serviceOnCalendar, setServiceOnCalendar] = useState<Service | null>(null)

    const onDeleteService = (id: string, scheduledAppointmentsToDelete: string[]) => {
        deleteService(company.services.filter(service => service._id !== id))
        updateAppointments(company.scheduledAppointments.filter(appointment => !scheduledAppointmentsToDelete.includes(appointment._id)))
    }

    const handleChangeToCalendar = (id: string, view: View) => {
        setActiveView(view)
        setServiceOnCalendar(company.services.find(service => service._id === id) || null)
    }

    return (
        <div className="divInterfaceCompanyContainer">
            <ToastContainer />
            <SideBar
                data={{ ...company, type: "company" }}
                onViewChange={(view: View) => setActiveView(view)}
            />
            <div className="divCompanyPanel">
                {
                    activeView === "calendar" ?
                        <CalendarServicePanel
                            service={serviceOnCalendar as Service}
                        />
                        :
                        <>
                            {
                                activeView === "appointments" ?
                                    <ScheduledAppointmentsPanel
                                        scheduledAppointments={company.scheduledAppointments}
                                    />
                                    :
                                    <ServicesPanel
                                        companyServices={company.services}
                                        onDeleteService={onDeleteService}
                                        handleChangeToCalendar={handleChangeToCalendar}
                                    />
                            }
                        </>
                }
            </div>
        </div>
    );
}

export default CompanyInterface;
