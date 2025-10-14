import { createContext, ReactNode, useEffect, useReducer } from "react";
import { type CompanyToUser } from "../types";
import { BACKEND_API_URL } from "../config";
import { useParams } from "react-router-dom";
import { useAuthenticatedGet } from "../hooks/useAuthenticatedFetch";

interface ContextProps {
    state: CompanyToUser;
    isLoading: boolean;
    error: string | null;
    fetchUserData: () => Promise<void>;
}

type Action =
    | { type: "SET_COMPANY_DATA"; payload: CompanyToUser }

const initialState: CompanyToUser = {
    _id: "",
    type: "company",
    name: "",
    email: "",
    phone: "",
    city: "",
    street: "",
    number: "",
    services: [],
    cancellationAnticipationHours: 0,
    bookingAnticipationHours: 0,
}

const userReducer = (_state: CompanyToUser, action: Action): CompanyToUser => {
    switch (action.type) {
        case "SET_COMPANY_DATA":
            return action.payload
    }
}

export const UserContext = createContext<ContextProps>({
    state: initialState,
    isLoading: false,
    error: null,
    fetchUserData: async () => { },
})

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { company_id } = useParams();
    const [state, dispatch] = useReducer(userReducer, initialState)
    const { isLoading, error, get } = useAuthenticatedGet()
    const urlGetCompany = `${BACKEND_API_URL}/companies/company/${company_id}`

    const fetchUserData = async () => {
        try {
            const response = await get(urlGetCompany, { skipAuth: true });
            if (response.error) {
                dispatch({ type: "SET_COMPANY_DATA", payload: initialState });
                console.error("Error fetching company data:", response.error);
                return
            }
            dispatch({ type: "SET_COMPANY_DATA", payload: response.data.data });
        } catch (error) {
            console.error("Error fetching company data:", error);
        }
    }

    useEffect(() => {
        fetchUserData()
    }, [])

    return (
        <UserContext.Provider value={{ state, isLoading, error, fetchUserData }}>
            {children}
        </UserContext.Provider>
    )
}