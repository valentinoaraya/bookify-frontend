export interface ServiceBasicInfo {
    _id: string
    title: string
}

export interface Service extends ServiceBasicInfo {
    description: string
    duration: number
    price: number
    companyId: string
    availableAppointments: string[]
    scheduledAppointments: string[]
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
}

export interface Appointment {
    _id: string
    serviceId: Service
    companyId?: Company
    clientId?: User
    date: string
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

export type View = "appointments" | "services" | "calendar"

export interface Input {
    type: string;
    name: string;
    label: string;
    placeholder?: string;
    selectOptions?: string[];
    mainSelectOption?: string;
}