import { type Appointment, type Company, type Service } from "@/types"

export type Action =
    | { type: "SET_COMPANY_DATA"; payload: Company }
    | { type: "UPDATE_COMPANY_DATA"; payload: Partial<Company> }
    | { type: "UPDATE_SERVICES"; payload: Service }
    | { type: "ADD_SERVICE"; payload: Service }
    | { type: "DELETE_SERVICE"; payload: string }
    | { type: "UPDATE_APPOINTMENTS"; payload: Appointment }
    | { type: "ADD_APPOINTMENT"; payload: Appointment }
    | { type: "DELETE_APPOINTMENT_FROM_CANCEL"; payload: { appointment: Appointment; service: Service } }
    | { type: "DELETE_APPOINTMENT"; payload: string }
    | { type: "UPDATE_SERVICE_AVAILABILITY"; payload: { serviceId: string; availableAppointments: any[]; slots?: any[] } }

export const initialState: Company = {
    type: "company",
    _id: "",
    name: "",
    city: "",
    street: "",
    number: "",
    email: "",
    payer_email: "",
    phone: "",
    company_id: "",
    services: [],
    reminders: [],
    cancellationAnticipationHours: 0,
    bookingAnticipationHours: 0,
    slotsVisibilityDays: 7,
    scheduledAppointments: [],
    connectedWithMP: false,
    subscription: {
        id: "",
        plan: "individual",
        status: "pending",
        mpPreapprovalId: "",
        nextPaymentDate: undefined,
        startDate: undefined,
    }
}

export const resolveAppointmentService = (appointment: Appointment): Service | undefined => {
    if (appointment.service) return appointment.service
    if (appointment.serviceId && typeof appointment.serviceId === "object") {
        return appointment.serviceId as Service
    }
    return undefined
}

export const resolveAppointmentServiceId = (appointment: Appointment): string => {
    if (typeof appointment.serviceId === "string") return appointment.serviceId
    if (appointment.serviceId && typeof appointment.serviceId === "object") {
        return appointment.serviceId._id
    }
    return appointment.service?._id ?? ""
}

export const companyReducer = (state: Company, action: Action): Company => {
    switch (action.type) {
        case "SET_COMPANY_DATA":
            return action.payload;

        case "UPDATE_COMPANY_DATA":
            return { ...state, ...action.payload };

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

        case "ADD_APPOINTMENT": {
            const service = resolveAppointmentService(action.payload)
            const serviceId = resolveAppointmentServiceId(action.payload)
            const newArrayServices = service
                ? state.services.map(s => s._id === service._id ? service : s)
                : state.services
            return {
                ...state,
                scheduledAppointments: [
                    ...state.scheduledAppointments,
                    {
                        ...action.payload,
                        serviceId: service ?? serviceId,
                        service,
                    },
                ],
                services: newArrayServices
            };
        }

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
                        ? {
                            ...service,
                            availableAppointments: action.payload.availableAppointments,
                            ...(action.payload.slots ? { slots: action.payload.slots } : {}),
                        }
                        : service
                )
            };

        default:
            return state;
    }
}
