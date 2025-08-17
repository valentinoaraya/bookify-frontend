import "./CompanyInterface.css"
import { type Company, type View, type Service } from "../../../../types";
import { useContext, useState } from "react";
import ServicesPanel from "./ServicesPanel/ServicesPanel";
import HistoryPanel from "./HistoryPanel/HistoryPanel";
import ScheduledAppointmentsPanel from "./ScheduledAppointmentsPanel/ScheduledAppointmentsPanel";
import CalendarServicePanel from "./CalendarServicePanel/CalendarServicePanel";
import { CompanyContext } from "../../../../contexts/CompanyContext";
import { ToastContainer } from "react-toastify";
import DataCompanyToCompany from "../DataCompanyToCompany/DataCompanyToCompany";

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
            <div className="divCompanyPanelContainer">
                <div className="divCompanyPanel">
                    <DataCompanyToCompany
                        dataCompany={company}
                    />
                    {
                        activeView === "calendar" ?
                            <CalendarServicePanel
                                service={serviceOnCalendar as Service}
                                setActiveView={setActiveView}
                            />
                            :
                            <div className="divSectionAndButtonsContainer">
                                <div className="divButtonsContainer">
                                    <button
                                        className={`buttonSection ${activeView === "appointments" ? "active" : ""}`}
                                        onClick={() => setActiveView("appointments")}
                                    >
                                        Próximos turnos
                                    </button>
                                    <button
                                        className={`buttonSection ${activeView === "history" ? "active" : ""}`}
                                        onClick={() => setActiveView("history")}
                                    >
                                        Historial
                                    </button>
                                    <button
                                        className={`buttonSection ${activeView === "services" ? "active" : ""}`}
                                        onClick={() => setActiveView("services")}
                                    >
                                        Servicios
                                    </button>
                                </div>
                                <div className="divSectionContainer">
                                    {
                                        activeView === "appointments" ?
                                            <ScheduledAppointmentsPanel
                                                scheduledAppointments={company.scheduledAppointments}
                                            />
                                            :
                                            <>
                                                {
                                                    activeView === "history" ?
                                                        <HistoryPanel company={company} />
                                                        :
                                                        <ServicesPanel
                                                            connectedWithMP={company.connectedWithMP}
                                                            companyServices={company.services}
                                                            onDeleteService={onDeleteService}
                                                            handleChangeToCalendar={handleChangeToCalendar}
                                                        />
                                                }
                                            </>
                                    }
                                </div>
                            </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default CompanyInterface;
