import "./ServiceCard.css"
import Button from "../../../common/Button/Button"
import { notifyError, notifySuccess } from "../../../utils/notifications"
import { confirmDelete } from "../../../utils/alerts"
import ModalForm from "../../ModalForm/ModalForm"
import { useMemo, useState } from "react"
import { CompanyLocation, View } from "../../../types"
import { deleteService, editService } from "@/shared/api/services"
import { getServiceFormInputs } from "@/features/company-panel/services/serviceFormInputs"

interface Props {
    id: string
    duration: number
    price: number
    title: string
    description: string
    signPrice: number
    connectedWithMP: boolean
    scheduledAppointmentsLenght?: number
    availableAppointmentsLenght?: number
    capacityPerShift: number
    mode: "in-person" | "online" | "in-person-at-home"
    locationIds?: string[]
    locations?: CompanyLocation[]
    active: boolean
    onDeleteService: (id: string, scheduledAppointmentsToDelete: string[]) => void
    onUpdateService: (data: { [key: string]: any }) => void
    onRedirectToCalendar: (id: string, view: View) => void
}

const modeLabel: Record<Props["mode"], string> = {
    "in-person": "Presencial",
    online: "Virtual",
    "in-person-at-home": "A domicilio",
}

const ServiceCard: React.FC<Props> = ({
    id,
    duration,
    price,
    title,
    description,
    mode,
    locationIds = [],
    locations = [],
    signPrice,
    connectedWithMP,
    scheduledAppointmentsLenght = 0,
    availableAppointmentsLenght = 0,
    capacityPerShift,
    onDeleteService,
    onUpdateService,
    onRedirectToCalendar,
    active,
}) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [moreOpen, setMoreOpen] = useState(false)

    const serviceLocations = useMemo(() => {
        if (mode !== "in-person" || locations.length === 0) return []

        if (locationIds.length > 0) {
            const idSet = new Set(locationIds.map(String))
            return locations.filter((loc) => idSet.has(String(loc._id)))
        }

        // Legacy / sin locationIds: sede principal
        const def = locations.find((loc) => loc.isDefault) ?? locations[0]
        return def ? [def] : []
    }, [mode, locationIds, locations])

    const deleteServiceHandler = async () => {
        const deleteConfirmed = await confirmDelete({
            question: "¿Seguro que desea eliminar el servicio?",
            message: "Al eliminar el servicio se eliminarán todos los turnos pendientes de clientes relacionados a este servicio.",
            icon: "warning",
            confirmButtonText: "Eliminar servicio",
            cancelButton: true,
            cancelButtonText: "Cancelar"
        })
        if (deleteConfirmed) {
            setIsLoading(true)
            try {
                const response = await deleteService(id)
                if (response?.data) {
                    onDeleteService(id, (response.data as { appointmentsToDelete?: string[] }).appointmentsToDelete ?? [])
                    notifySuccess("Servicio eliminado")
                }
                if (response?.error) notifyError("Error al eliminar el servicio")
            } finally {
                setIsLoading(false)
            }
        }
    }

    const updateService = async (data: { [key: string]: any }) => {
        setIsLoadingUpdate(true)
        try {
            const response = await editService(id, data)
            setIsModalOpen(false)
            if (response?.data) {
                onUpdateService(response.data.data)
                notifySuccess("Servicio actualizado")
            }
            if (response?.error) notifyError("Error al actualizar el servicio")
        } finally {
            setIsLoadingUpdate(false)
        }
    }

    return (
        <>
            <article className={`serviceCard ${active ? "" : "is-disabled"}`}>
                <div className="serviceCardMain">
                    <div className="serviceCardBody">
                        <div className="serviceCardTitleRow">
                            <h3 className="serviceCardTitle">{title}</h3>
                            {!active && <span className="serviceCardDisabledBadge">Deshabilitado</span>}
                        </div>

                        {description && (
                            <p className="serviceCardDescription">{description}</p>
                        )}

                        <p className="serviceCardMeta">
                            <span className={`serviceCardMode serviceCardMode--${mode === "online" ? "online" : "presencial"}`}>
                                {modeLabel[mode]}
                            </span>
                            <span className="serviceCardDot" aria-hidden="true">·</span>
                            <span>{duration} min</span>
                            <span className="serviceCardDot" aria-hidden="true">·</span>
                            <span className="serviceCardPrice">${price}</span>
                        </p>

                        {serviceLocations.length > 0 && (
                            <div className="serviceCardLocations" aria-label="Sedes del servicio">
                                {serviceLocations.map((loc) => (
                                    <span
                                        key={loc._id}
                                        className="serviceCardLocationChip"
                                        title={`${loc.street} ${loc.number}, ${loc.city}`}
                                    >
                                        {loc.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="serviceCardStats">
                            <span className="service-stat available">{availableAppointmentsLenght} disponibles</span>
                            <span className="service-stat scheduled">{scheduledAppointmentsLenght} agendados</span>
                            <span className="serviceCardExtra">
                                {capacityPerShift} {capacityPerShift > 1 ? "personas" : "persona"}/horario
                                <span className="serviceCardDot" aria-hidden="true">·</span>
                                {signPrice !== 0 ? `Seña $${signPrice}` : "Sin seña"}
                            </span>
                        </div>
                    </div>

                    <div className="serviceCardActions">
                        {active ? (
                            <>
                                <Button
                                    fontSize="0.9rem"
                                    variant="primary"
                                    padding="0.5rem 1rem"
                                    fontWeight="600"
                                    margin="0"
                                    width="auto"
                                    loading={isLoading || isLoadingUpdate}
                                    onSubmit={() => onRedirectToCalendar(id, "calendar")}
                                >
                                    Habilitar turnos
                                </Button>
                                <Button
                                    fontSize="0.88rem"
                                    variant="ghost"
                                    padding="0.45rem 0.9rem"
                                    fontWeight="600"
                                    margin="0"
                                    width="auto"
                                    loading={isLoading || isLoadingUpdate}
                                    onSubmit={() => setIsModalOpen(true)}
                                >
                                    Editar
                                </Button>
                                <button
                                    type="button"
                                    className="serviceCardMore"
                                    aria-expanded={moreOpen}
                                    onClick={() => setMoreOpen((open) => !open)}
                                >
                                    {moreOpen ? "Menos" : "Más"}
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>

                {active && moreOpen && (
                    <div className="serviceCardMorePanel">
                        <Button
                            fontSize="0.88rem"
                            padding="0.45rem 0.9rem"
                            fontWeight="600"
                            variant="danger-ghost"
                            margin="0"
                            width="auto"
                            onSubmit={deleteServiceHandler}
                            loading={isLoading || isLoadingUpdate}
                        >
                            Eliminar servicio
                        </Button>
                    </div>
                )}
            </article>
            <ModalForm
                title="Editar servicio"
                isOpen={isModalOpen}
                inputs={getServiceFormInputs({
                    connectedWithMP,
                    currentMode: mode,
                    locations,
                })}
                initialData={{
                    title,
                    description,
                    price,
                    mode,
                    duration,
                    signPrice,
                    capacityPerShift,
                    locationIds: locationIds.map(String),
                }}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => updateService(data)}
                disabledButtons={isLoading}
            />
        </>
    );
}

export default ServiceCard;
