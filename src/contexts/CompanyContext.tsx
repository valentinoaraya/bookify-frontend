import { createContext, useReducer, useEffect, ReactNode, useCallback, useState } from "react";
import { type Appointment, type Service, type Company } from "../types";
import { useFetchData } from "../hooks/useFetchData";
import { BACKEND_API_URL } from "../config";
import { socket, connectSocket, disconnectSocket } from "../socket";
import { notifyError, notifySuccess } from "../utils/notifications";

type Action =
    | { type: "SET_COMPANY_DATA"; payload: Company }
    | { type: "UPDATE_SERVICES"; payload: Service }
    | { type: "ADD_SERVICE"; payload: Service }
    | { type: "DELETE_SERVICE"; payload: string }
    | { type: "UPDATE_APPOINTMENTS"; payload: Appointment }
    | { type: "ADD_APPOINTMENT"; payload: Appointment }
    | { type: "DELETE_APPOINTMENT_FROM_CANCEL"; payload: { appointment: Appointment, service: Service } }
    | { type: "DELETE_APPOINTMENT"; payload: string }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "UPDATE_SERVICE_AVAILABILITY"; payload: { serviceId: string; availableAppointments: any[] } };

const initialState: Company = {
    type: "company",
    _id: "",
    name: "",
    city: "",
    street: "",
    number: "",
    email: "",
    phone: "",
    services: [],
    scheduledAppointments: [],
    connectedWithMP: false
};

interface CompanyContextState {
    state: Company;
    isLoading: boolean;
    error: string | null;
}

interface CompanyContextActions {
    fetchCompanyData: () => Promise<void>;
    updateServices: (service: Service) => void;
    addService: (service: Service) => void;
    deleteService: (serviceId: string) => void;
    updateAppointments: (appointment: Appointment) => void;
    addAppointment: (appointment: Appointment) => void;
    deleteAppointment: (appointmentAndService: string) => void;
    updateServiceAvailability: (serviceId: string, availableAppointments: any[]) => void;
    clearError: () => void;
}

type CompanyContextType = CompanyContextState & CompanyContextActions;

const companyReducer = (state: Company, action: Action): Company => {
    switch (action.type) {
        case "SET_COMPANY_DATA":
            return action.payload;

        case "UPDATE_SERVICES":
            return {
                ...state,
                services: state.services.map(s => s._id === action.payload._id ? action.payload : s)
            };

        case "ADD_SERVICE":
            return {
                ...state,
                services: [...state.services, action.payload]
            };

        case "DELETE_SERVICE":
            return {
                ...state,
                services: state.services.filter(service => service._id !== action.payload)
            };

        case "UPDATE_APPOINTMENTS":
            return { ...state, scheduledAppointments: state.scheduledAppointments.map(a => a._id === action.payload._id ? action.payload : a) };

        case "ADD_APPOINTMENT":
            notifySuccess(`${action.payload.name} ${action.payload.lastName} acaba de agendar un nuevo turno`, true)
            const newArrayServices = state.services.map(s => s._id === action.payload.serviceId._id ? action.payload.serviceId : s)
            return {
                ...state,
                scheduledAppointments: [...state.scheduledAppointments, action.payload],
                services: newArrayServices
            };

        case "DELETE_APPOINTMENT":
            return {
                ...state,
                scheduledAppointments: state.scheduledAppointments.filter(appointment => appointment._id !== action.payload),
            };

        case "DELETE_APPOINTMENT_FROM_CANCEL":
            return {
                ...state,
                scheduledAppointments: state.scheduledAppointments.filter(appointment => appointment._id !== action.payload.appointment._id),
                services: state.services.map(s => s._id === action.payload.service._id ? action.payload.service : s)
            };

        case "UPDATE_SERVICE_AVAILABILITY":
            return {
                ...state,
                services: state.services.map(service =>
                    service._id === action.payload.serviceId
                        ? { ...service, availableAppointments: action.payload.availableAppointments }
                        : service
                )
            };

        default:
            return state;
    }
};

export const CompanyContext = createContext<CompanyContextType>({
    state: initialState,
    isLoading: false,
    error: null,
    fetchCompanyData: async () => { },
    updateServices: () => { },
    addService: () => { },
    deleteService: () => { },
    updateAppointments: () => { },
    addAppointment: () => { },
    deleteAppointment: () => { },
    updateServiceAvailability: () => { },
    clearError: () => { },
});

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const token = localStorage.getItem("access_token");
    const [state, dispatch] = useReducer(companyReducer, initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { fetchData } = useFetchData(`${BACKEND_API_URL}/companies/get-company`, "GET", token);

    const fetchCompanyData = useCallback(async () => {
        if (!token) {
            setError("No hay token de autenticación");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchData({});

            if (response.error) {
                setError(response.error);
                dispatch({ type: "SET_COMPANY_DATA", payload: initialState });
                return;
            }

            dispatch({ type: "SET_COMPANY_DATA", payload: response.data });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            setError(errorMessage);
            console.error("Error fetching company data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchData, token]);

    const updateServices = useCallback((service: Service) => {
        dispatch({ type: "UPDATE_SERVICES", payload: service });
    }, []);

    const addService = useCallback((service: Service) => {
        dispatch({ type: "ADD_SERVICE", payload: service });
    }, []);

    const deleteService = useCallback((serviceId: string) => {
        dispatch({ type: "DELETE_SERVICE", payload: serviceId });
    }, []);

    const updateAppointments = useCallback((appointment: Appointment) => {
        dispatch({ type: "UPDATE_APPOINTMENTS", payload: appointment });
    }, []);

    const addAppointment = useCallback((appointment: Appointment) => {
        dispatch({ type: "ADD_APPOINTMENT", payload: appointment });
    }, []);

    const deleteAppointment = useCallback((appointemntId: string) => {
        dispatch({ type: "DELETE_APPOINTMENT", payload: appointemntId });
    }, []);

    const updateServiceAvailability = useCallback((serviceId: string, availableAppointments: any[]) => {
        dispatch({
            type: "UPDATE_SERVICE_AVAILABILITY",
            payload: { serviceId, availableAppointments }
        });
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    useEffect(() => {
        if (!token) return;

        connectSocket(token);

        socket.emit("joinCompany", state._id)

        const handleServiceAdded = (service: Service) => {
            dispatch({ type: "ADD_SERVICE", payload: service });
        };

        const handleServiceDeleted = (serviceId: string) => {
            dispatch({ type: "DELETE_SERVICE", payload: serviceId });
        };

        const handleServiceUpdated = (service: Service) => {
            dispatch({ type: "UPDATE_SERVICES", payload: service });
        };

        const handleAppointmentAdded = (appointment: Appointment) => {
            dispatch({ type: "ADD_APPOINTMENT", payload: appointment });
        };

        const handleAppointmentDeleted = (appointmentAndService: { appointment: Appointment, service: Service }) => {
            notifyError(`${appointmentAndService.appointment.name} ${appointmentAndService.appointment.lastName} ha cancelado un turno`, true)
            console.log(appointmentAndService)
            dispatch({ type: "DELETE_APPOINTMENT_FROM_CANCEL", payload: appointmentAndService });
        };

        const handleAppointmentUpdated = (appointment: Appointment) => {
            dispatch({ type: "UPDATE_APPOINTMENTS", payload: appointment });
        };

        const handleAvailabilityUpdated = (data: { serviceId: string; availableAppointments: any[] }) => {
            dispatch({ type: "UPDATE_SERVICE_AVAILABILITY", payload: { serviceId: data.serviceId, availableAppointments: data.availableAppointments } });
        };

        socket.on("company:service-added", handleServiceAdded);
        socket.on("company:service-deleted", handleServiceDeleted);
        socket.on("company:service-updated", handleServiceUpdated);
        socket.on("company:appointment-added", handleAppointmentAdded);
        socket.on("company:appointment-deleted", handleAppointmentDeleted);
        socket.on("company:appointment-updated", handleAppointmentUpdated);
        socket.on("company:availability-updated", handleAvailabilityUpdated);

        return () => {
            socket.off("company:service-added", handleServiceAdded);
            socket.off("company:service-deleted", handleServiceDeleted);
            socket.off("company:service-updated", handleServiceUpdated);
            socket.off("company:appointment-added", handleAppointmentAdded);
            socket.off("company:appointment-deleted", handleAppointmentDeleted);
            socket.off("company:appointment-updated", handleAppointmentUpdated);
            socket.off("company:availability-updated", handleAvailabilityUpdated);
            disconnectSocket();
        };
    }, [token, state._id]);

    useEffect(() => {
        fetchCompanyData();
    }, []);

    const contextValue: CompanyContextType = {
        state,
        isLoading,
        error,
        fetchCompanyData,
        updateServices,
        addService,
        deleteService,
        updateAppointments,
        addAppointment,
        deleteAppointment,
        updateServiceAvailability,
        clearError,
    };

    return (
        <CompanyContext.Provider value={contextValue}>
            {children}
        </CompanyContext.Provider>
    );
};
