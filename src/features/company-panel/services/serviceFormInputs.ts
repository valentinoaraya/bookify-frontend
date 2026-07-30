import type { Input, Service } from "@/types"

type ServiceMode = Service["mode"]

const MODE_OPTIONS: Record<ServiceMode, { label: string; value: ServiceMode }> = {
    "in-person": { label: "Presencial en local", value: "in-person" },
    online: { label: "Virtual", value: "online" },
    "in-person-at-home": { label: "Presencial a domicilio", value: "in-person-at-home" },
}

const DEFAULT_MODE_ORDER: ServiceMode[] = ["in-person", "online", "in-person-at-home"]

export function getModeSelectOptions(currentMode?: ServiceMode) {
    const order = currentMode
        ? [currentMode, ...DEFAULT_MODE_ORDER.filter((mode) => mode !== currentMode)]
        : DEFAULT_MODE_ORDER

    return order.map((mode) => MODE_OPTIONS[mode])
}

export function getSignPriceInput(connectedWithMP: boolean): Input {
    return connectedWithMP
        ? {
            type: "number",
            name: "signPrice",
            placeholder: "Precio de la seña",
            label: "Precio de la seña (Si no quieres cobrar señas para tus turnos deja '0')",
        }
        : {
            type: "none",
            name: "notConnectedWithMP",
            placeholder: "No puede cobrar señas",
            label: "Si quiere cobrar señas, vincule su cuenta de Mercado Pago.",
        }
}

interface ServiceFormInputsOptions {
    connectedWithMP: boolean
    currentMode?: ServiceMode
}

/** Config de inputs compartida entre el alta y la edición de servicios. */
export function getServiceFormInputs({ connectedWithMP, currentMode }: ServiceFormInputsOptions): Input[] {
    return [
        { type: "text", name: "title", placeholder: "Título", label: "Título" },
        { type: "text", name: "description", placeholder: "Descripción", label: "Descripción" },
        { type: "number", name: "price", placeholder: "Precio", label: "Precio" },
        { type: "select", name: "mode", label: "Modalidad", selectOptions: getModeSelectOptions(currentMode) },
        { type: "number", name: "duration", placeholder: "Duración", label: "Duración (en minutos)" },
        { type: "number", name: "capacityPerShift", placeholder: "Capacidad de personas por turno", label: "Capacidad de personas por turno" },
        getSignPriceInput(connectedWithMP),
    ]
}
