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
}

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
}

export interface ServiceUsed {
    _id: string
    dateUsed: string
    serviceName: string
    companyName: string
}

export interface Appointment {
    _id: string
    serviceId: Service
    companyId?: Company
    clientId?: User
    date: string
}

export interface User {
    type: "user"
    name: string
    lastName: string
    email: string
    phone: string
    appointments: Appointment[]
    servicesUsed: ServiceUsed[]
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