import { createContext } from "react"
import { type Appointment, type Company, type Service } from "@/types"

export interface CompanyContextState {
    state: Company
    isLoading: boolean
    error: string | null
}

export interface CompanyContextActions {
    fetchCompanyData: () => Promise<void>
    updateCompanyData: (data: Partial<Company>) => void
    updateServices: (service: Service) => void
    addService: (service: Service) => void
    deleteService: (serviceId: string) => void
    updateAppointments: (appointment: Appointment) => void
    addAppointment: (appointment: Appointment) => void
    deleteAppointment: (appointmentAndService: string) => void
    updateServiceAvailability: (serviceId: string, availableAppointments: any[], slots?: any[]) => void
    clearError: () => void
}

export type CompanyContextType = CompanyContextState & CompanyContextActions

export const CompanyContext = createContext<CompanyContextType | null>(null)
