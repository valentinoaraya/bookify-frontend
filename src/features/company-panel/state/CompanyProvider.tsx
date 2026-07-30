import { useCallback, useEffect, useReducer, useState, type ReactNode } from "react"
import { type Company } from "@/types"
import { getCompany } from "@/shared/api/companies"
import { getAccessToken, hasValidTokens, logout } from "@/utils/tokenManager"
import { companyReducer, initialState } from "./companyReducer"
import { CompanyContext, type CompanyContextType } from "./CompanyContext"
import { useCompanySocket } from "./useCompanySocket"

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(companyReducer, initialState)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const token = getAccessToken()

    const fetchCompanyData = useCallback(async () => {
        if (!hasValidTokens()) {
            setError("No hay token de autenticación")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await getCompany()

            if (response.error) {
                if (response.code === "SESSION_EXPIRED") {
                    await logout()
                    window.location.href = "/login/company"
                    return
                }
                setError(response.error)
                dispatch({ type: "SET_COMPANY_DATA", payload: initialState })
                return
            }

            dispatch({ type: "SET_COMPANY_DATA", payload: response.data! })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido"
            setError(errorMessage)
            console.error("Error fetching company data:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const updateCompanyData = useCallback((data: Partial<Company>) => {
        dispatch({ type: "UPDATE_COMPANY_DATA", payload: data })
    }, [])

    const updateServices = useCallback((service: Parameters<CompanyContextType["updateServices"]>[0]) => {
        dispatch({ type: "UPDATE_SERVICES", payload: service })
    }, [])

    const addService = useCallback((service: Parameters<CompanyContextType["addService"]>[0]) => {
        dispatch({ type: "ADD_SERVICE", payload: service })
    }, [])

    const deleteService = useCallback((serviceId: string) => {
        dispatch({ type: "DELETE_SERVICE", payload: serviceId })
    }, [])

    const updateAppointments = useCallback((appointment: Parameters<CompanyContextType["updateAppointments"]>[0]) => {
        dispatch({ type: "UPDATE_APPOINTMENTS", payload: appointment })
    }, [])

    const addAppointment = useCallback((appointment: Parameters<CompanyContextType["addAppointment"]>[0]) => {
        dispatch({ type: "ADD_APPOINTMENT", payload: appointment })
    }, [])

    const deleteAppointment = useCallback((appointemntId: string) => {
        dispatch({ type: "DELETE_APPOINTMENT", payload: appointemntId })
    }, [])

    const updateServiceAvailability = useCallback((serviceId: string, availableAppointments: any[], slots?: any[]) => {
        dispatch({
            type: "UPDATE_SERVICE_AVAILABILITY",
            payload: { serviceId, availableAppointments, slots }
        })
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    useCompanySocket(token, state._id, dispatch)

    useEffect(() => {
        fetchCompanyData()
    }, [])

    const contextValue: CompanyContextType = {
        state,
        isLoading,
        error,
        fetchCompanyData,
        updateCompanyData,
        updateServices,
        addService,
        deleteService,
        updateAppointments,
        addAppointment,
        deleteAppointment,
        updateServiceAvailability,
        clearError,
    }

    return (
        <CompanyContext.Provider value={contextValue}>
            {children}
        </CompanyContext.Provider>
    )
}
