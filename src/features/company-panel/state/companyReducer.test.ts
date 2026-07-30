import { describe, it, expect } from "vitest"
import {
    companyReducer,
    initialState,
    resolveAppointmentServiceId,
} from "@/features/company-panel/state/companyReducer"
import type { Appointment, Service } from "@/types"

const baseService: Service = {
    _id: "svc-1",
    title: "Corte",
    description: "d",
    capacityPerShift: 1,
    duration: 30,
    price: 1000,
    mode: "online",
    active: true,
    companyId: "c1",
    availableAppointments: [],
    scheduledAppointments: [],
    pendingAppointments: [],
    signPrice: 0,
}

describe("companyReducer", () => {
    it("ADD_SERVICE appends a service", () => {
        const next = companyReducer(initialState, {
            type: "ADD_SERVICE",
            payload: baseService,
        })
        expect(next.services).toHaveLength(1)
        expect(next.services[0]._id).toBe("svc-1")
    })

    it("DELETE_APPOINTMENT removes by id without side effects", () => {
        const withAppt = {
            ...initialState,
            scheduledAppointments: [
                {
                    _id: "a1",
                    name: "A",
                    lastName: "B",
                    email: "a@b.com",
                    phone: "1",
                    dni: "1",
                    serviceId: "svc-1",
                    date: "2026-01-01",
                    mode: "online" as const,
                    price: 10,
                    duration: 30,
                    status: "scheduled" as const,
                    cancelledBy: "company" as const,
                },
            ],
        }
        const next = companyReducer(withAppt, {
            type: "DELETE_APPOINTMENT",
            payload: "a1",
        })
        expect(next.scheduledAppointments).toHaveLength(0)
    })

    it("resolveAppointmentServiceId handles string and object", () => {
        expect(
            resolveAppointmentServiceId({
                serviceId: "svc-1",
            } as Appointment)
        ).toBe("svc-1")
        expect(
            resolveAppointmentServiceId({
                serviceId: baseService,
            } as Appointment)
        ).toBe("svc-1")
    })
})
