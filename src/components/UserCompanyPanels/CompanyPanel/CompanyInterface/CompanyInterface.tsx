import "./CompanyInterface.css"
import SideBar from "../../SideBar/SideBar";
import { type Company, type View, type Service, type Appointment } from "../../../../types";
import { useState } from "react";
import ServicesPanel from "./ServicesPanel/ServicesPanel";
import ScheduledAppointmentsPanel from "./ScheduledAppointmentsPanel/ScheduledAppointmentsPanel";
import CalendarServicePanel from "./CalendarServicePanel/CalendarServicePanel";

interface Props {
    company: Company
}

const CompanyInterface: React.FC<Props> = ({ company }) => {

    const [activeView, setActiveView] = useState<View>("appointments")
    const [scheduledAppointments, setScheduledAppointments] = useState<Appointment[]>(company.scheduledAppointments)
    const [companyServices, setCompanyServices] = useState<Service[]>(company.services)
    const [serviceOnCalendar, setServiceOnCalendar] = useState<Service | null>(null)

    const onDeleteService = (id: string, scheduledAppointmentsToDelete: string[]) => {
        setCompanyServices(companyServices.filter(service => service._id !== id))
        setScheduledAppointments(scheduledAppointments.filter(appointment => !scheduledAppointmentsToDelete.includes(appointment._id)))
    }

    const handleChangeToCalendar = (id: string, view: View) => {
        setActiveView(view)
        setServiceOnCalendar(companyServices.find(service => service._id === id) || null)
    }

    return (
        <div className="divInterfaceCompanyContainer">
            <SideBar
                data={{ ...company, type: "company" }}
                onViewChange={(view: View) => setActiveView(view)}
            />
            <div className="divCompanyPanel">
                {
                    activeView === "calendar" ?
                        <CalendarServicePanel
                            service={serviceOnCalendar}
                        />
                        :
                        <>
                            {
                                activeView === "appointments" ?
                                    <ScheduledAppointmentsPanel
                                        scheduledAppointments={scheduledAppointments}
                                    />
                                    :
                                    <ServicesPanel
                                        companyServices={companyServices}
                                        setCompanyServices={setCompanyServices}
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
