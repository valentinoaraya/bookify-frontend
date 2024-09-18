export interface ServiceBasicInfo {
    _id: string
    title: string
}

export interface Service extends ServiceBasicInfo {
    description: string
    duration: number
    price: number
    companyId: string
}

export interface CompanyBasicInfo {
    _id: string
    name: string
}

export interface Company extends CompanyBasicInfo {
    location: string
    email: string
    phone: string
    services: Service[]
}

export interface ServiceUsed {
    _id: string
    dateUsed: string
    serviceName: string
    companyName: string
}

export interface Appointment {
    _id: string
    serviceId: {
        title: string
    }
    companyId: {
        name: string
    }
    date: string
}

export interface User {
    name: string
    lastName: string
    email: string
    phone: string
    appointments: Appointment[]
    servicesUsed: ServiceUsed[]
}