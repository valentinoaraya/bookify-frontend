import { createContext, ReactNode, useEffect, useReducer, useState } from "react";
import { type CompanyToUser } from "../types";
import { getPublicCompany } from "@/shared/api/companies";
import { useParams } from "react-router-dom";

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
    slotsVisibilityDays: 7,
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
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUserData = async () => {
        if (!company_id) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await getPublicCompany(company_id);
            if (response.error) {
                dispatch({ type: "SET_COMPANY_DATA", payload: initialState });
                setError(response.error)
                console.error("Error fetching company data:", response.error);
                return
            }
            dispatch({ type: "SET_COMPANY_DATA", payload: response.data! });
        } catch (err) {
            console.error("Error fetching company data:", err);
        } finally {
            setIsLoading(false)
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
