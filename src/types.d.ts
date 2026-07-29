export interface AvailableAppointment {
    _id?: string
    datetime: string
    capacity: number
    taken: number
}

export interface Slot extends AvailableAppointment {}

export interface AvailableAppointmentWithPendings extends AvailableAppointment {
    pendings: number
}

export interface ServiceBasicInfo {
    _id: string
    title: string
}

export interface Service extends ServiceBasicInfo {
    description: string
    capacityPerShift: number
    duration: number
    price: number
    mode: "in-person" | "online" | "in-person-at-home"
    active: boolean
    companyId: string
    /** Preferir slots; availableAppointments se deriva del backend para transición. */
    slots?: Slot[]
    availableAppointments: AvailableAppointment[]
    scheduledAppointments: string[]
    pendingAppointments: PendingAppointment[]
    signPrice: number
}

export type ServiceToSchedule = Omit<Service, "description" | "duration">

export interface CompanyBasicInfo {
    _id: string
    name: string
}

export interface CompanySubscription {
    id: string
    plan: "individual" | "individual_plus" | "team"
    pendingPlan?: "individual" | "individual_plus" | "team"
    status: "inactive" | "active" | "pending" | "upgrading" | "downgrading" | "cancelling"
    mpPreapprovalId?: string
    startDate?: Date
    nextPaymentDate?: Date | string
}

export interface Company extends CompanyBasicInfo {
    type: "company"
    city: string
    street: string
    number: string
    email: string
    /** Email de la cuenta de Mercado Pago usada para la suscripción SaaS. */
    payer_email?: string
    phone: string
    services: Service[]
    scheduledAppointments: Appointment[]
    connectedWithMP: boolean
    company_id: string
    subscription: CompanySubscription | null
    reminders: {
        hoursBefore: number
        services: {
            _id: string
            title: string
        }[]
    }[]
    cancellationAnticipationHours: number
    bookingAnticipationHours: number
    slotsVisibilityDays: number
}

export type CompanyToUser = Omit<Company, "scheduledAppointments" | "connectedWithMP" | "reminders" | "company_id" | "subscription">

export interface Appointment extends UserData {
    _id: string
    /** Id del servicio (contrato Phase 3.5). */
    serviceId: string | Service
    /** Servicio con slots / disponibilidad (sockets / confirm). */
    service?: Service
    serviceInfo?: {
        title: string
    }
    companyId?: Company | string
    date: string
    mode: "in-person" | "online" | "in-person-at-home"
    price: number
    duration: number
    totalPaidAmount?: number
    status: "scheduled" | "finished" | "cancelled" | "pending_action" | "did_not_attend"
    cancelledBy: "company" | "client"
    userLocation?: string
}

export interface UserData {
    name: string
    lastName: string
    email: string
    phone: string
    dni: string
}

export interface User {
    _id: string
    type: "user"
    name: string
    lastName: string
    email: string
    phone: string
    appointments: Appointment[]
}

export type View = "appointments" | "services" | "calendar" | "history"

export interface Input {
    type: string;
    name: string;
    label: string;
    placeholder?: string;
    selectOptions?: { label: string, value: string | number }[];
    mainSelectOption?: string;
}

export interface EventFullCalendar {
    title: string
    start: string
    backgroundColor: string
    borderColor: string
    extendedProps?: ExtendedProps
}

export interface ExtendedProps {
    disponibility?: number
    taken?: number
    capacity?: number
    pendingCount?: number
    scheduledCount?: number
}

export interface PendingAppointment {
    datetime: string
    expiresAt: Date
    /** Solo presente en el panel de la empresa; el endpoint público no lo expone. */
    userId?: string
}
