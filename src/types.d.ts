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
    reminders: {
        hoursBefore: number
        services: {
            _id: string
            title: string
        }[]
    }[]
}

export type CompanyToUser = Omit<Company, "scheduledAppointments" | "connectedWithMP" | "reminders" | "company_id">

export interface Appointment extends UserData {
    _id: string
    serviceId: Service
    companyId?: Company
    date: string
    totalPaidAmount?: number
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
    selectOptions?: string[];
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