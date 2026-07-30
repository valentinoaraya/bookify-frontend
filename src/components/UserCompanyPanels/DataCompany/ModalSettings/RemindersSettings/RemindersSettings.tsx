import "./RemindersSettings.css"
import { Company } from "../../../../../types";
import { EmailIcon } from "../../../../../common/Icons/Icons";
import WhatsAppLogo from "../../../../../assets/images/wsp-logo.webp"
import ModalAddReminder from "./ModalAddReminder/ModalAddReminder";
import { useState } from "react";
import { updateCompany } from "@/shared/api/companies";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { useCompany } from "../../../../../hooks/useCompany";

interface Props {
    data: Company
}

const formatHoursBefore = (hoursBefore: number) => {
    if (hoursBefore >= 24) {
        const days = hoursBefore / 24
        return `${days} ${days === 1 ? "día" : "días"} antes`
    }
    return `${hoursBefore} ${hoursBefore === 1 ? "hora" : "horas"} antes`
}

const RemindersSettings: React.FC<Props> = ({ data }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
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
            reminders: [...data.reminders, reminder]
        }
        setIsLoading(true)
        try {
            const response = await updateCompany(updatedCompany)
            if (response.data) {
                updateCompanyData(response.data.data)
                setIsOpen(false)
                notifySuccess("Recordatorio agregado")
            }
            if (response.error) {
                notifyError("No se pudo agregar el recordatorio. Inténtalo de nuevo más tarde.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (index: number) => {
        setDeletingIndex(index)
        setIsLoading(true)
        try {
            const updatedCompany = {
                ...data,
                reminders: data.reminders.filter((_, i) => i !== index)
            }
            const response = await updateCompany(updatedCompany)
            if (response.data) {
                updateCompanyData(response.data.data)
                notifySuccess("Recordatorio eliminado")
            }
            if (response.error) {
                notifyError("No se pudo eliminar el recordatorio. Inténtalo de nuevo más tarde.")
            }
        } finally {
            setIsLoading(false)
            setDeletingIndex(null)
        }
    }

    return (
        <div className="animation-section">
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
                            fill="#1282A2"
                        />
                        <div>
                            <h3 className="reminder-title">Recordatorios por email</h3>
                            <p className="reminder-p">Envía recordatorios por email a tus clientes antes de sus turnos.</p>
                        </div>
                    </div>

                    <div className="remindersList">
                        {data.reminders && data.reminders.length > 0 ? (
                            data.reminders.map((reminder, index) => (
                                <article key={`${reminder.hoursBefore}-${index}`} className="reminderCard">
                                    <div className="reminderCardMain">
                                        <div className="reminderCardWhen">
                                            <span className="reminderCardWhenLabel">Se envía</span>
                                            <strong className="reminderCardWhenValue">
                                                {formatHoursBefore(reminder.hoursBefore)}
                                            </strong>
                                        </div>
                                        <div className="reminderCardServices">
                                            <span className="reminderCardServicesLabel">Servicios</span>
                                            <div className="reminderCardChips">
                                                {reminder.services && reminder.services.length > 0 ? (
                                                    reminder.services.map((service) => (
                                                        <span key={service._id} className="reminderChip">
                                                            {service.title}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="reminderChip is-empty">Sin servicios</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="reminderDelete"
                                        disabled={isLoading}
                                        onClick={() => handleDelete(index)}
                                    >
                                        {deletingIndex === index ? "Eliminando..." : "Eliminar"}
                                    </button>
                                </article>
                            ))
                        ) : (
                            <div className="remindersEmpty">
                                <p>Todavía no tenés recordatorios configurados.</p>
                            </div>
                        )}

                        <button
                            type="button"
                            className="reminderAdd"
                            onClick={() => setIsOpen(true)}
                            disabled={isLoading || isOpen}
                        >
                            + Agregar recordatorio
                        </button>

                        <ModalAddReminder
                            isLoading={isLoading}
                            onSubmit={handleSubmit}
                            services={data.services}
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                        />
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
        </div>
    );
}

export default RemindersSettings;
