import { createContext, useReducer, useEffect, ReactNode, useCallback, useState } from "react";
import { type Appointment, type Service, type Company } from "../types";
import { useFetchData } from "../hooks/useFetchData";
import { BACKEND_API_URL } from "../config";
import { socket, connectSocket, disconnectSocket } from "../socket";
import { notifyError, notifySuccess } from "../utils/notifications";

// Tipos para las acciones del reducer
type Action =
    | { type: "SET_COMPANY_DATA"; payload: Company }
    | { type: "UPDATE_SERVICES"; payload: Service[] }
    | { type: "ADD_SERVICE"; payload: Service }
    | { type: "DELETE_SERVICE"; payload: string }
    | { type: "UPDATE_APPOINTMENTS"; payload: Appointment[] }
    | { type: "ADD_APPOINTMENT"; payload: Appointment }
    | { type: "DELETE_APPOINTMENT"; payload: string }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "UPDATE_SERVICE_AVAILABILITY"; payload: { serviceId: string; availableAppointments: any[] } };

// Estado inicial
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

// Estado del contexto
interface CompanyContextState {
    state: Company;
    isLoading: boolean;
    error: string | null;
}

// Funciones del contexto
interface CompanyContextActions {
    fetchCompanyData: () => Promise<void>;
    updateServices: (services: Service[]) => void;
    addService: (service: Service) => void;
    deleteService: (serviceId: string) => void;
    updateAppointments: (appointments: Appointment[]) => void;
    addAppointment: (appointment: Appointment) => void;
    deleteAppointment: (appointmentId: string) => void;
    updateServiceAvailability: (serviceId: string, availableAppointments: any[]) => void;
    clearError: () => void;
}

// Tipo completo del contexto
type CompanyContextType = CompanyContextState & CompanyContextActions;

// Reducer para manejar el estado
const companyReducer = (state: Company, action: Action): Company => {
    switch (action.type) {
        case "SET_COMPANY_DATA":
            return action.payload;

        case "UPDATE_SERVICES":
            return { ...state, services: action.payload };

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
            return { ...state, scheduledAppointments: action.payload };

        case "ADD_APPOINTMENT":
            notifySuccess(`${action.payload.name} ${action.payload.lastName} acaba de agendar un nuevo turno`, true)
            return {
                ...state,
                scheduledAppointments: [...state.scheduledAppointments, action.payload]
            };

        case "DELETE_APPOINTMENT":

            const appointmentToDelete = state.scheduledAppointments.find(app => app._id === action.payload)

            if (appointmentToDelete) notifyError(`${appointmentToDelete.name} ${appointmentToDelete.lastName} ha cancelado un turno`, true)

            return {
                ...state,
                scheduledAppointments: state.scheduledAppointments.filter(appointment => appointment._id !== action.payload)
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

// Contexto
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

// Provider del contexto
export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const token = localStorage.getItem("access_token");
    const [state, dispatch] = useReducer(companyReducer, initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { fetchData } = useFetchData(`${BACKEND_API_URL}/companies/get-company`, "GET", token);

    // Función para obtener datos de la empresa
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

    // Funciones para manejar servicios
    const updateServices = useCallback((services: Service[]) => {
        dispatch({ type: "UPDATE_SERVICES", payload: services });
    }, []);

    const addService = useCallback((service: Service) => {
        dispatch({ type: "ADD_SERVICE", payload: service });
    }, []);

    const deleteService = useCallback((serviceId: string) => {
        dispatch({ type: "DELETE_SERVICE", payload: serviceId });
    }, []);

    // Funciones para manejar citas
    const updateAppointments = useCallback((appointments: Appointment[]) => {
        dispatch({ type: "UPDATE_APPOINTMENTS", payload: appointments });
    }, []);

    const addAppointment = useCallback((appointment: Appointment) => {
        dispatch({ type: "ADD_APPOINTMENT", payload: appointment });
    }, []);

    const deleteAppointment = useCallback((appointmentId: string) => {
        dispatch({ type: "DELETE_APPOINTMENT", payload: appointmentId });
    }, []);

    // Función para actualizar disponibilidad de servicios
    const updateServiceAvailability = useCallback((serviceId: string, availableAppointments: any[]) => {
        dispatch({
            type: "UPDATE_SERVICE_AVAILABILITY",
            payload: { serviceId, availableAppointments }
        });
    }, []);

    // Función para limpiar errores
    const clearError = useCallback(() => {
        setError(null);
    }, []);



    // Configuración de Socket.IO - Solo se ejecuta cuando cambia el token
    useEffect(() => {
        if (!token) return;

        // Conectar al socket con autenticación
        connectSocket(token);

        socket.emit("joinCompany", state._id)

        // Escuchar eventos de la empresa
        const handleServiceAdded = (service: Service) => {
            dispatch({ type: "ADD_SERVICE", payload: service });
        };

        const handleServiceDeleted = (serviceId: string) => {
            dispatch({ type: "DELETE_SERVICE", payload: serviceId });
        };

        const handleServiceUpdated = (service: Service) => {
            dispatch({
                type: "UPDATE_SERVICES",
                payload: state.services.map(s => s._id === service._id ? service : s)
            });
        };

        const handleAppointmentAdded = (appointment: Appointment) => {
            dispatch({ type: "ADD_APPOINTMENT", payload: appointment });
        };

        const handleAppointmentDeleted = (appointmentId: string) => {
            dispatch({ type: "DELETE_APPOINTMENT", payload: appointmentId });
        };

        const handleAppointmentUpdated = (appointment: Appointment) => {
            dispatch({
                type: "UPDATE_APPOINTMENTS",
                payload: state.scheduledAppointments.map(a => a._id === appointment._id ? appointment : a)
            });
        };

        const handleAvailabilityUpdated = (data: { serviceId: string; availableAppointments: any[] }) => {
            dispatch({
                type: "UPDATE_SERVICE_AVAILABILITY",
                payload: { serviceId: data.serviceId, availableAppointments: data.availableAppointments }
            });
        };

        // Registrar listeners
        socket.on("company:service-added", handleServiceAdded);
        socket.on("company:service-deleted", handleServiceDeleted);
        socket.on("company:service-updated", handleServiceUpdated);
        socket.on("company:appointment-added", handleAppointmentAdded);
        socket.on("company:appointment-deleted", handleAppointmentDeleted);
        socket.on("company:appointment-updated", handleAppointmentUpdated);
        socket.on("company:availability-updated", handleAvailabilityUpdated);

        // Limpiar listeners al desmontar
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
    }, [token, state._id]); // ← Solo depende del token

    // Cargar datos iniciales
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
