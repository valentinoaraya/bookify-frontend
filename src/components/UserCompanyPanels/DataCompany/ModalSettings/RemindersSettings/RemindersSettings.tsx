import "./RemindersSettings.css"
import { Company } from "../../../../../types";
import { EmailIcon } from "../../../../../common/Icons/Icons";
import WhatsAppLogo from "../../../../../assets/images/wsp-logo.png"
import ModalAddReminder from "./ModalAddReminder/ModalAddReminder";
import { useState } from "react";
import { useFetchData } from "../../../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../../../config";
import { notifyError } from "../../../../../utils/notifications";
import { useCompany } from "../../../../../hooks/useCompany";

interface Props {
    data: Company
}

const RemindersSettings: React.FC<Props> = ({ data }) => {
    const [isOpen, setIsOpen] = useState(false)
    const token = localStorage.getItem("access_token")
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/companies/update-company`,
        "PUT",
        token
    )
    const { updateCompanyData } = useCompany()

    const handleSubmit = async (reminder: {
        hoursBefore: number;
        services: string[];
    }) => {

        if (reminder.services.length === 0) {
            notifyError("Debes seleccionar al menos un servicio.", true)
            setIsOpen(false)
            return
        }

        if (data.reminders.some(r => r.hoursBefore === reminder.hoursBefore && r.services.sort().toString() === reminder.services.sort().toString())) {
            notifyError("Ya existe un recordatorio con las mismas horas y servicios.", true)
            setIsOpen(false)
            return
        }

        if (data.reminders.some(r => r.hoursBefore === reminder.hoursBefore &&
            r.services.some(s => reminder.services.includes(s._id))
        )) {
            notifyError("Ya existe un recordatorio para alguno de los servicios seleccionados a la misma cantidad de horas.", true)
            setIsOpen(false)
            return
        }

        const updatedCompany = {
            ...data,
            reminders: [...data.reminders, reminder]
        }
        const response = await fetchData(updatedCompany)
        if (response.data) {
            updateCompanyData(response.data)
            setIsOpen(false)
        }
        if (response.error) {
            notifyError("No se pudo agregar el recordatorio. Inténtalo de nuevo más tarde.")
        }
    }

    if (error) notifyError("Error en el servidor. Inténtalo de nuevo más tarde.")

    return (
        <div>
            <div className="header-settings">
                <h2 className="titleSetting">Configura los recordatorios para tus clientes</h2>
                <p>Puedes enviar recordatorios de los turnos X horas antes de los mismos.</p>
            </div>
            <div className="reminders-settings">
                <div className="reminders-email">
                    <div className="reminders-setting-title-icon">
                        <EmailIcon
                            width="32"
                            height="32"
                            fill="#4a90e2"
                        />
                        <div>
                            <h3 className="reminder-title">Recordatorios por email</h3>
                            <p className="reminder-p">Envía recordatorios por email a tus clientes antes de sus turnos.</p>
                        </div>
                    </div>
                    <div className="table-reminders-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Recordar</th>
                                    <th>Servicios afectados</th>
                                    <th>Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.reminders && data.reminders.length > 0 ? (
                                    <>
                                        {
                                            data.reminders.map((reminder, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        {
                                                            reminder.hoursBefore >= 24
                                                                ? `${reminder.hoursBefore / 24} ${reminder.hoursBefore / 24 === 1 ? "día" : "días"} antes`
                                                                : `${reminder.hoursBefore} ${reminder.hoursBefore === 1 ? "hora" : "horas"} antes`
                                                        }
                                                    </td>
                                                    <td>
                                                        {reminder.services && reminder.services.length > 0
                                                            ? reminder.services.map(service => service.title).join(", ")
                                                            : "Todos los servicios"}
                                                    </td>
                                                    <td>
                                                        <button className="delete-reminder-button" onClick={async () => {
                                                            const updatedCompany = {
                                                                ...data,
                                                                reminders: data.reminders.filter((_, i) => i !== index)
                                                            }
                                                            const response = await fetchData(updatedCompany)
                                                            if (response.data) {
                                                                updateCompanyData(response.data)
                                                            }
                                                            if (response.error) {
                                                                notifyError("No se pudo eliminar el recordatorio. Inténtalo de nuevo más tarde.")
                                                            }
                                                        }}>Eliminar</button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        <tr>
                                            <td colSpan={3} className="add-reminder-td" onClick={() => setIsOpen(true)}>+ Agregar recordatorio</td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td >No hay recordatorios agregados</td>
                                        <td colSpan={2} className="add-reminder-td" onClick={() => setIsOpen(true)}>+ Agregar recordatorio</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="reminders-whatsapp div-reminders-wsp-coming-soon">
                    <div className="reminders-setting-title-icon">
                        <img className="wsp-logo" src={WhatsAppLogo} alt="Logo Whatsapp" />
                        <div>
                            <h3 className="reminder-title">Recordatorios por WhatsApp</h3>
                            <p className="reminder-p">Próximamente podrás enviar recordatorios por WhatsApp</p>
                        </div>
                    </div>
                </div>
            </div>
            <ModalAddReminder
                isLoading={isLoading}
                onSubmit={handleSubmit}
                services={data.services}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            />
        </div>
    );
}

export default RemindersSettings;
