import "./AnticipationsSettings.css"
import { Company } from "../../../../../types";
import { useEffect, useState } from "react";
import { useFetchData } from "../../../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../../../config";
import Button from "../../../../../common/Button/Button";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { useCompany } from "../../../../../hooks/useCompany";
import { MemoryIcon } from "../../../../../common/Icons/Icons";

interface Props {
    data: Company
}

const AnticipationsSettings: React.FC<Props> = ({ data }) => {

    const token = localStorage.getItem("access_token")
    const { updateCompanyData } = useCompany()

    const [form, setForm] = useState({
        cancellationAnticipationHours: data.cancellationAnticipationHours ?? 24,
        bookingAnticipationHours: data.bookingAnticipationHours ?? 1,
    })

    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/companies/update-company`,
        "PUT",
        token
    )

    useEffect(() => {
        setForm({
            cancellationAnticipationHours: data.cancellationAnticipationHours ?? 24,
            bookingAnticipationHours: data.bookingAnticipationHours ?? 1,
        })
    }, [data.cancellationAnticipationHours, data.bookingAnticipationHours])

    const hoursOptions = [1, 2, 4, 6, 12, 24, 48, 72, 96]

    const handleSave = async () => {
        const payload = {
            ...data,
            cancellationAnticipationHours: form.cancellationAnticipationHours,
            bookingAnticipationHours: form.bookingAnticipationHours,
        }

        if (payload.cancellationAnticipationHours === data.cancellationAnticipationHours && payload.bookingAnticipationHours === data.bookingAnticipationHours) {
            notifyError("No hay cambios para guardar.")
            return
        }

        const response = await fetchData(payload)
        if (response.data) {
            updateCompanyData(response.data)
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
                        {hoursOptions.map(h => (
                            <option key={`cancel-${h}`} value={h}>
                                {h >= 24 ? `${h / 24} ${h / 24 === 1 ? "día" : "días"} antes` : `${h} ${h === 1 ? "hora" : "horas"} antes`}
                            </option>
                        ))}
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
                        {hoursOptions.map(h => (
                            <option key={`book-${h}`} value={h}>
                                {h >= 24 ? `${h / 24} ${h / 24 === 1 ? "día" : "días"} antes` : `${h} ${h === 1 ? "hora" : "horas"} antes`}
                            </option>
                        ))}
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
