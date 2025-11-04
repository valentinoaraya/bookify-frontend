import "./CompanyInterface.css"
import { type View } from "../../../../types";
import { useContext, useState } from "react";
import ServicesPanel from "./ServicesPanel/ServicesPanel";
import HistoryPanel from "./HistoryPanel/HistoryPanel";
import ScheduledAppointmentsPanel from "./ScheduledAppointmentsPanel/ScheduledAppointmentsPanel";
import CalendarServicePanel from "./CalendarServicePanel/CalendarServicePanel";
import { CompanyContext } from "../../../../contexts/CompanyContext";
import DataCompanyToCompany from "../DataCompanyToCompany/DataCompanyToCompany";

const CompanyInterface = () => {
    const { state, deleteService, deleteAppointment } = useContext(CompanyContext)
    const [activeView, setActiveView] = useState<View>("appointments")
    const [serviceOnCalendar, setServiceOnCalendar] = useState<string | null>(null)

    const onDeleteService = (id: string, scheduledAppointmentsToDelete: string[]) => {
        deleteService(id)
        scheduledAppointmentsToDelete.forEach(app => deleteAppointment(app))
    }

    const handleChangeToCalendar = (id: string, view: View) => {
        setActiveView(view)
        setServiceOnCalendar(id)
    }

    return (
        <div className="divInterfaceCompanyContainer">
            <div className="divCompanyPanelContainer">
                <div className="divCompanyPanel">
                    <DataCompanyToCompany
                        dataCompany={state}
                        scheduledAppointments={state.scheduledAppointments}
                        servicesLength={state.services.length}
                    />
                    {
                        activeView === "calendar" ?
                            <CalendarServicePanel
                                serviceId={serviceOnCalendar as string}
                                setActiveView={setActiveView}
                            />
                            :
                            <div className="divSectionAndButtonsContainer">
                                <div className="divButtonsContainer">
                                    <button
                                        className={`buttonSection ${activeView === "appointments" ? "active" : "noActive"}`}
                                        onClick={() => setActiveView("appointments")}
                                    >
                                        Próximos turnos
                                    </button>
                                    <button
                                        className={`buttonSection ${activeView === "history" ? "active" : "noActive"}`}
                                        onClick={() => setActiveView("history")}
                                    >
                                        Historial
                                    </button>
                                    <button
                                        className={`buttonSection ${activeView === "services" ? "active" : "noActive"}`}
                                        onClick={() => setActiveView("services")}
                                    >
                                        Servicios
                                    </button>
                                </div>
                                <>
                                    {
                                        activeView === "appointments" ?
                                            <ScheduledAppointmentsPanel
                                                scheduledAppointments={state.scheduledAppointments}
                                            />
                                            :
                                            <>
                                                {
                                                    activeView === "history" ?
                                                        <HistoryPanel company={state} />
                                                        :
                                                        <ServicesPanel
                                                            companyPlan={state.plan}
                                                            connectedWithMP={state.connectedWithMP}
                                                            companyServices={state.services}
                                                            onDeleteService={onDeleteService}
                                                            handleChangeToCalendar={handleChangeToCalendar}
                                                        />
                                                }
                                            </>
                                    }
                                </>
                            </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default CompanyInterface;
