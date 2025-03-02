import { createContext, ReactNode, useEffect, useReducer } from "react";
import { type Appointment, type ServiceUsed, type User } from "../types";
import { useFetchData } from "../hooks/useFetchData";
import { BACKEND_API_URL } from "../config";

interface ContextProps {
    state: User;
    isLoading: boolean;
    error: string | null;
    fetchUserData: () => Promise<void>;
    updateAppointments: (appointments: Appointment[]) => void;
    updateServicesUsed: (services: ServiceUsed[]) => void;
}

type Action =
    | { type: "SET_USER_DATA"; payload: User }
    | { type: "UPDATE_APPOINTMENTS"; payload: Appointment[] }
    | { type: "UPDATE_SERVICESUSED"; payload: ServiceUsed[] }

const initialState: User = {
    _id: "",
    type: "user",
    name: "",
    lastName: "",
    email: "",
    phone: "",
    appointments: [],
    servicesUsed: []
}

const userReducer = (state: User, action: Action): User => {
    switch (action.type) {
        case "SET_USER_DATA":
            return action.payload
        case "UPDATE_APPOINTMENTS":
            return { ...state, appointments: action.payload }
        case "UPDATE_SERVICESUSED":
            return { ...state, servicesUsed: action.payload }
    }
}

export const UserContext = createContext<ContextProps>({
    state: initialState,
    isLoading: false,
    error: null,
    fetchUserData: async () => { },
    updateAppointments: () => { },
    updateServicesUsed: () => { },
})

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState)
    const { isLoading, error, fetchData } = useFetchData(`${BACKEND_API_URL}/users/get-user`, "GET", true)

    const fetchUserData = async () => {
        try {
            const response = await fetchData({});
            if (response.error) {
                dispatch({ type: "SET_USER_DATA", payload: initialState });
                console.error("Error fetching user data:", response.error);
                return
            }
            dispatch({ type: "SET_USER_DATA", payload: response.data });
        } catch (error) {
            console.error("Error fetching company data:", error);
        }
    }

    const updateAppointments = (appointments: Appointment[]) => {
        dispatch({ type: "UPDATE_APPOINTMENTS", payload: appointments })
    }

    const updateServicesUsed = (serivces: ServiceUsed[]) => {
        dispatch({ type: "UPDATE_SERVICESUSED", payload: serivces })
    }

    useEffect(() => {
        fetchUserData()
    }, [])

    return (
        <UserContext.Provider value={{ state, isLoading, error, fetchUserData, updateAppointments, updateServicesUsed }}>
            {children}
        </UserContext.Provider>
    )
}