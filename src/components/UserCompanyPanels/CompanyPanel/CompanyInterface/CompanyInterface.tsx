import "./CompanyInterface.css"
import SideBar from "../../../Bars/SideBar/SideBar";
import { type Company, type View, type Service } from "../../../../types";
import { useContext, useState } from "react";
import ServicesPanel from "./ServicesPanel/ServicesPanel";
import ScheduledAppointmentsPanel from "./ScheduledAppointmentsPanel/ScheduledAppointmentsPanel";
import CalendarServicePanel from "./CalendarServicePanel/CalendarServicePanel";
import { CompanyContext } from "../../../../contexts/CompanyContext";
import { ToastContainer } from "react-toastify";
import NavBar from "../../../Bars/NavBar/NavBar";
import Button from "../../../../common/Button/Button";
import { NewWindowIcon } from "../../../../common/Icons/Icons";
import { useFetchData } from "../../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../../config";
import { notifyError } from "../../../../utils/notifications";
import { confirmDelete } from "../../../../utils/alerts";

interface Props {
    company: Company
}

const CompanyInterface: React.FC<Props> = ({ company }) => {

    const token = localStorage.getItem("access_token")
    const { deleteService, updateAppointments } = useContext(CompanyContext)
    const [activeView, setActiveView] = useState<View>("appointments")
    const [serviceOnCalendar, setServiceOnCalendar] = useState<Service | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/mercadopago/oauth/generate-url/${company._id}`,
        "GET",
        token
    )

    if (error) notifyError("Error en el servidor. Inténtalo de nuevo más tarde.")

    const vinculateMP = async () => {
        const confirm = await confirmDelete({
            question: "Al vincular con Mercado Pago...",
            mesasge: "Al vincular con Mercado Pago podrás cobrar señas a tus clientes directamente en tu cuenta de Mercado Pago.",
            cancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar"
        })

        if (confirm) {
            const response = await fetchData(null)
            if (response.url) window.location.href = response.url
            if (response.error) notifyError("Error al obtener URL.")
        }
    }

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
            <NavBar
                data={{ ...company, type: "company" }}
                onViewChange={(view: View) => setActiveView(view)}
                setIsOpen={setIsOpen}
            />
            <SideBar
                data={{ ...company, type: "company" }}
                onViewChange={(view: View) => setActiveView(view)}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                mobile={window.innerWidth <= 930}
            />
            <div className="divCompanyPanel">
                {
                    !company.connectedWithMP &&
                    <div className="divGenerateURL">
                        <p className="parrafVinculate">Vinculate con <span>Mercado Pago</span> para poder cobrar señas de turnos: </p>
                        <Button
                            fontSize={window.innerWidth <= 480 ? ".8rem" : "1rem"}
                            padding=".8rem .8rem"
                            width="auto"
                            margin="0 0 0 .5rem"
                            disabled={isLoading}
                            iconSVG={
                                <NewWindowIcon
                                    width="16px"
                                    height="16px"
                                    fill="white"
                                />
                            }
                            onSubmit={vinculateMP}
                        >
                            Vincular Mercado Pago
                        </Button>
                    </div>
                }
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
    );
}

export default CompanyInterface;
