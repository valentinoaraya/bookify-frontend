import "./AnticipationsSettings.css"
import { Company } from "../../../../../types";
import { useEffect, useState } from "react";
import { BACKEND_API_URL } from "../../../../../config";
import Button from "../../../../../common/Button/Button";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { useCompany } from "../../../../../hooks/useCompany";
import { MemoryIcon } from "../../../../../common/Icons/Icons";
import { useAuthenticatedPut } from "../../../../../hooks/useAuthenticatedFetch";

interface Props {
    data: Company
}

const AnticipationsSettings: React.FC<Props> = ({ data }) => {

    const { updateCompanyData } = useCompany()
    const [form, setForm] = useState({
        cancellationAnticipationHours: data.cancellationAnticipationHours ?? 24,
        bookingAnticipationHours: data.bookingAnticipationHours ?? 1,
        slotsVisibilityDays: data.slotsVisibilityDays ?? 7,
    })
    const { isLoading, error, put } = useAuthenticatedPut()
    const urlUpdateCompany = `${BACKEND_API_URL}/companies/update-company`

    useEffect(() => {
        setForm({
            cancellationAnticipationHours: data.cancellationAnticipationHours ?? 24,
            bookingAnticipationHours: data.bookingAnticipationHours ?? 1,
            slotsVisibilityDays: data.slotsVisibilityDays ?? 7,
        })
    }, [data.cancellationAnticipationHours, data.bookingAnticipationHours, data.slotsVisibilityDays])

    const hoursOptions = [0, 1, 2, 4, 6, 12, 24, 48, 72, 96]
    const visibilityDaysOptions = [7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84]

    const handleSave = async () => {
        const payload = {
            ...data,
            cancellationAnticipationHours: form.cancellationAnticipationHours,
            bookingAnticipationHours: form.bookingAnticipationHours,
            slotsVisibilityDays: form.slotsVisibilityDays,
        }

        if (payload.cancellationAnticipationHours === data.cancellationAnticipationHours &&
            payload.bookingAnticipationHours === data.bookingAnticipationHours &&
            payload.slotsVisibilityDays === data.slotsVisibilityDays) {
            notifyError("No hay cambios para guardar.")
            return
        }

        const response = await put(urlUpdateCompany, payload)
        if (response.data) {
            updateCompanyData(response.data.data)
            notifySuccess("Cambios guardados correctamente.")
        }
        if (response.error) notifyError("No se pudieron guardar los cambios. Inténtalo más tarde.")
    }

    if (error) notifyError("Error en el servidor. Inténtalo de nuevo más tarde.")

    return (
        <div className="anticipationsSettings animation-section">
            <div className="header-settings">
                <h2 className="titleSetting">Anticipación de reserva y cancelación</h2>
                <p>Puedes configurar el tiempo de anticipación de cancelación y reservas de turnos.</p>
            </div>

            <div className="anticipations-content">
                <div className="anticipation-item">
                    <div>
                        <h3 className="anticipation-title">Cancelación de turnos</h3>
                        <p className="anticipation-desc">Define cuántas horas antes del turno los clientes podrán cancelar.</p>
                    </div>
                    <select
                        className="anticipation-select"
                        value={form.cancellationAnticipationHours}
                        onChange={(e) => setForm({ ...form, cancellationAnticipationHours: parseInt(e.target.value) })}
                    >
                        {hoursOptions.map(h => {
                            if (h === 0) {
                                return <option key={`cancel-${h}`} value={h}>
                                    {h === 0 && "Sin anticipación"}
                                </option>
                            }
                            return (
                                <option key={`cancel-${h}`} value={h}>
                                    {h >= 24 ? `${h / 24} ${h / 24 === 1 ? "día" : "días"} antes` : `${h} ${h === 1 ? "hora" : "horas"} antes`}
                                </option>
                            )
                        })}
                    </select>
                </div>
                <div className="anticipation-item">
                    <div>
                        <h3 className="anticipation-title">Reserva de turnos</h3>
                        <p className="anticipation-desc">Define hasta cuántas horas antes del turno se podrá reservar.</p>
                    </div>
                    <select
                        className="anticipation-select"
                        value={form.bookingAnticipationHours}
                        onChange={(e) => setForm({ ...form, bookingAnticipationHours: parseInt(e.target.value) })}
                    >
                        {hoursOptions.map(h => {
                            if (h === 0) {
                                return <option key={`cancel-${h}`} value={h}>
                                    {h === 0 && "Sin anticipación"}
                                </option>
                            }
                            return (
                                <option key={`cancel-${h}`} value={h}>
                                    {h >= 24 ? `${h / 24} ${h / 24 === 1 ? "día" : "días"} antes` : `${h} ${h === 1 ? "hora" : "horas"} antes`}
                                </option>
                            )
                        })}
                    </select>
                </div>
                <div className="anticipation-item">
                    <div>
                        <h3 className="anticipation-title">Visibilidad de turnos disponibles</h3>
                        <p className="anticipation-desc">Define cuántos días a partir de hoy se mostrarán los turnos disponibles para reservar.</p>
                    </div>
                    <select
                        className="anticipation-select"
                        value={form.slotsVisibilityDays}
                        onChange={(e) => setForm({ ...form, slotsVisibilityDays: parseInt(e.target.value) })}
                    >
                        {visibilityDaysOptions.map(days => {
                            const weeks = days / 7
                            return (
                                <option key={`visibility-${days}`} value={days}>
                                    {weeks === 1 ? "1 semana" : `${weeks} semanas`}
                                </option>
                            )
                        })}
                    </select>
                </div>
            </div>

            <div className="anticipations-actions">
                <Button
                    backgroundColor="#1282A2"
                    fontSize="1rem"
                    fontWeight="600"
                    padding=".5rem 1rem"
                    onSubmit={handleSave}
                    disabled={isLoading}
                    width="auto"
                    margin="0"
                    iconSVG={
                        <MemoryIcon
                            width="16"
                            height="16"
                            fill="white"
                        />
                    }
                >
                    Guardar cambios
                </Button>
            </div>
        </div>
    );
}

export default AnticipationsSettings;
