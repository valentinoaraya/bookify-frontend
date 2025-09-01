import { Service, Appointment } from "../types";

// Eventos del servidor hacia el cliente
export interface ServerToClientEvents {
    // Eventos de servicios
    "company:service-added": (service: Service) => void;
    "company:service-deleted": (serviceId: string) => void;
    "company:service-updated": (service: Service) => void;

    // Eventos de citas
    "company:appointment-added": (appointment: Appointment) => void;
    "company:appointment-deleted": (appointmentId: string) => void;
    "company:appointment-updated": (appointment: Appointment) => void;

    // Eventos de disponibilidad
    "company:availability-updated": (data: { serviceId: string; availableAppointments: any[] }) => void;

    // Eventos de notificaciones
    "company:notification": (message: string) => void;
    "company:error": (error: string) => void;
}

// Eventos del cliente hacia el servidor
export interface ClientToServerEvents {
    // Eventos de autenticación
    "auth:login": (token: string) => void;
    "auth:logout": () => void;

    // Eventos de servicios
    "service:create": (service: Omit<Service, "_id">) => void;
    "service:update": (service: Service) => void;
    "service:delete": (serviceId: string) => void;

    // Eventos de citas
    "appointment:create": (appointment: Omit<Appointment, "_id">) => void;
    "appointment:update": (appointment: Appointment) => void;
    "appointment:delete": (appointmentId: string) => void;

    // Eventos de disponibilidad
    "availability:update": (data: { serviceId: string; availableAppointments: any[] }) => void;
}

// Tipos para los datos de autenticación del socket
export interface SocketAuth {
    token: string;
}

// Tipos para respuestas de eventos
export interface SocketResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
} 