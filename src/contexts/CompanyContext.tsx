import { createContext, useReducer, useEffect, ReactNode } from "react";
import { type Appointment, type Service, type Company } from "../types";
import { useFetchData } from "../hooks/useFetchData";
import { BACKEND_API_URL } from "../config";

interface ContextProps {
    state: Company;
    isLoading: boolean;
    error: string | null;
    fetchCompanyData: () => Promise<void>;
    updateServices: (services: Service[]) => void;
    updateAppointments: (appointments: Appointment[]) => void;
    deleteService: (services: Service[]) => void;
    deleteAppointment: (appointments: Appointment[]) => void;
}

type Action =
    | { type: "SET_COMPANY_DATA"; payload: Company }
    | { type: "UPDATE_SERVICES"; payload: Service[] }
    | { type: "DELETE_SERVICE"; payload: Service[] }
    | { type: "UPDATE_APPOINTMENTS"; payload: Appointment[] }
    | { type: "DELETE_APPOINTMENT"; payload: Appointment[] }

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

const companyReducer = (state: Company, action: Action): Company => {
    switch (action.type) {
        case "SET_COMPANY_DATA":
            return action.payload;
        case "UPDATE_SERVICES":
            return { ...state, services: action.payload };
        case "DELETE_SERVICE":
            return { ...state, services: action.payload };
        case "UPDATE_APPOINTMENTS":
            return { ...state, scheduledAppointments: action.payload };
        case "DELETE_APPOINTMENT":
            return { ...state, scheduledAppointments: action.payload }
        default:
            return state;
    }
};

export const CompanyContext = createContext<ContextProps>({
    state: initialState,
    isLoading: false,
    error: null,
    fetchCompanyData: async () => { },
    updateServices: () => { },
    updateAppointments: () => { },
    deleteService: () => { },
    deleteAppointment: () => { },
});

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const token = localStorage.getItem("access_token")
    const [state, dispatch] = useReducer(companyReducer, initialState);
    const { isLoading, error, fetchData } = useFetchData(`${BACKEND_API_URL}/companies/get-company`, "GET", token)

    const fetchCompanyData = async () => {
        try {
            const response = await fetchData({});
            if (response.error) {
                dispatch({ type: "SET_COMPANY_DATA", payload: initialState });
                console.error("Error fetching company data:", response.error);
                return
            }
            dispatch({ type: "SET_COMPANY_DATA", payload: response.data });
        } catch (error) {
            console.error("Error fetching company data:", error);
        }
    };

    const updateServices = (services: Service[]) => {
        dispatch({ type: "UPDATE_SERVICES", payload: services });
    };

    const deleteService = (services: Service[]) => {
        dispatch({ type: "DELETE_SERVICE", payload: services })
    }

    const updateAppointments = (appointments: Appointment[]) => {
        dispatch({ type: "UPDATE_APPOINTMENTS", payload: appointments });
    };

    const deleteAppointment = (appointments: Appointment[]) => {
        dispatch({ type: "DELETE_APPOINTMENT", payload: appointments })
    }

    useEffect(() => {
        fetchCompanyData();
    }, []);

    return (
        <CompanyContext.Provider value={{ state, isLoading, error, fetchCompanyData, updateServices, deleteService, updateAppointments, deleteAppointment }}>
            {children}
        </CompanyContext.Provider>
    );
};
