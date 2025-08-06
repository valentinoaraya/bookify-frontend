import "./CompanyInterface.css"
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
import ModalForm from "../../../ModalForm/ModalForm";
import { notifySuccess } from "../../../../utils/notifications";
import { PencilIcon } from "../../../../common/Icons/Icons";
import { CloseIcon } from "../../../../common/Icons/Icons";


interface Props {
    company: Company
}

const CompanyInterface: React.FC<Props> = ({ company }) => {

    const token = localStorage.getItem("access_token")
    const { deleteService, updateAppointments } = useContext(CompanyContext)
    const [activeView, setActiveView] = useState<View>("appointments")
    const [serviceOnCalendar, setServiceOnCalendar] = useState<Service | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newData, setNewData] = useState<Company>(company)
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/mercadopago/oauth/generate-url/${company._id}`,
        "GET",
        token
    )
    const { isLoading: isLoadingUpdate, error: errorUpdate, fetchData: fetchDataUpdate } = useFetchData(
        `${BACKEND_API_URL}/companies/update-company`,
        "PUT",
        token
    )

    if (error) notifyError("Error en el servidor. Inténtalo de nuevo más tarde.")
    if (errorUpdate) notifyError("Error al actualizar los datos. Inténtalo de nuevo más tarde.")


    const updateData = async (data: { [key: string]: any }) => {
        const response = await fetchDataUpdate(data)
        setIsModalOpen(false)
        if (response?.data) {
            setNewData(response.data)
            notifySuccess("Datos actualizados")
        }
        if (response?.error) notifyError("Error al actualizar los datos")
    }

    const handleLogout = async () => {
        localStorage.removeItem("access_token")
        window.location.href = "/"
    }

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
            <NavBar />
            <div className="divCompanyPanelContainer">
                <div className="divCompanyPanel">
                    <div className="dataCompanyPanel">
                        <h2 className="h2TitleCompanyPanel">{newData.name}</h2>
                        <div className="dataContainer">
                            <p className="parrafData">
                                <span>Teléfono</span>
                                {newData.phone}
                            </p>
                            <p className="parrafData">
                                <span>Email</span>
                                {newData.email}
                            </p>
                            <p className="parrafData">
                                <span>Ubicación: </span>
                                {newData.city} - {newData.street} {newData.number}
                            </p>
                        </div>
                        {
                            !company.connectedWithMP &&
                            <div className="divGenerateURL">
                                <p className="parrafVinculate">Vinculate con <span>Mercado Pago</span> para poder cobrar señas de turnos: </p>
                                <Button
                                    fontSize={window.innerWidth <= 480 ? ".8rem" : "1rem"}
                                    padding=".8rem .8rem"
                                    width="100%"
                                    margin=".5rem 0 0 0"
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
                        <div className="configurationsContainer">
                            <div
                                className="divIconParrafContainer"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <PencilIcon
                                    width="12"
                                    height="12"
                                    fill="#0A4A5A"
                                />
                                <p className="parrafConfig">Editar datos</p>
                            </div>
                            <div
                                className="divIconParrafContainer"
                                onClick={handleLogout}
                            >
                                <CloseIcon
                                    width="12"
                                    height="12"
                                    fill="#0A4A5A"
                                />
                                <p className="parrafConfig">Cerrar sesión</p>
                            </div>
                        </div>

                    </div>
                    {
                        activeView === "calendar" ?
                            <CalendarServicePanel
                                service={serviceOnCalendar as Service}
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
                                                scheduledAppointments={newData.scheduledAppointments}
                                            />
                                            :
                                            <ServicesPanel
                                                connectedWithMP={newData.connectedWithMP}
                                                companyServices={newData.services}
                                                onDeleteService={onDeleteService}
                                                handleChangeToCalendar={handleChangeToCalendar}
                                            />
                                    }
                                </div>
                            </div>
                    }
                </div>
            </div>
            <ModalForm
                title="Editar datos"
                inputs={
                    [
                        { type: "text", name: "name", placeholder: "Nombre", label: "Nombre" },
                        { type: "text", name: "phone", placeholder: "Teléfono", label: "Teléfono" },
                        { type: "email", name: "email", placeholder: "Email", label: "Email" },
                        { type: "text", name: "city", placeholder: "Ciudad", label: "Ciudad" },
                        { type: "text", name: "street", placeholder: "Calle", label: "Calle" },
                        { type: "number", name: "number", placeholder: "Número", label: "Número" }
                    ]
                }
                initialData={
                    {
                        name: newData.name,
                        phone: newData.phone,
                        email: newData.email,
                        city: newData.city,
                        street: newData.street,
                        number: newData.number
                    }
                }
                isOpen={isModalOpen}
                disabledButtons={isLoadingUpdate}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => updateData(data)}
            />
        </div>
    );
}

export default CompanyInterface;
