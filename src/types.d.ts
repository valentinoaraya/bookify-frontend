export interface AvailableAppointment {
    datetime: string
    capacity: number
    taken: number
}

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
    mode: "in-person" | "online"
    companyId: string
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

export interface Company extends CompanyBasicInfo {
    type: "company"
    city: string
    street: string
    number: string
    email: string
    phone: string
    services: Service[]
    scheduledAppointments: Appointment[]
    connectedWithMP: boolean
    company_id: string
    suscription: {
        suscription_id: string
        plan: "individual" | "individual_plus" | "team"
        status_suscription: "inactive" | "active" | "pending"
        start_date?: Date
        next_payment_date?: Date
    }
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

export type CompanyToUser = Omit<Company, "scheduledAppointments" | "connectedWithMP" | "reminders" | "company_id" | "suscription">

export interface Appointment extends UserData {
    _id: string
    serviceId: Service
    serviceInfo?: {
        title: string
    }
    companyId?: Company
    date: string
    mode: "in-person" | "online"
    price: number
    duration: number
    totalPaidAmount?: number
    status: "scheduled" | "finished" | "cancelled" | "pending_action" | "did_not_attend"
    cancelledBy: "company" | "client"
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
    userId: string
}