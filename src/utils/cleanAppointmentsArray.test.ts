import { describe, it, expect } from "vitest"
import {
    getServiceSlots,
    slotsToAvailable,
    slotsToScheduledDates,
} from "@/utils/cleanAppointmentsArray"
import type { Service, Slot } from "@/types"

describe("cleanAppointmentsArray", () => {
    const slots: Slot[] = [
        { datetime: "2026-01-01T10:00:00.000Z", capacity: 2, taken: 1 },
        { datetime: "2026-01-01T11:00:00.000Z", capacity: 1, taken: 1 },
    ]

    it("getServiceSlots prefers slots over availableAppointments", () => {
        const service = {
            slots,
            availableAppointments: [
                { datetime: "old", capacity: 1, taken: 0 },
            ],
        } as Pick<Service, "slots" | "availableAppointments">

        expect(getServiceSlots(service)).toEqual(slots)
    })

    it("slotsToAvailable keeps only slots with free capacity", () => {
        expect(slotsToAvailable(slots)).toHaveLength(1)
        expect(slotsToAvailable(slots)[0].datetime).toContain("10:00")
    })

    it("slotsToScheduledDates expands taken counts", () => {
        expect(slotsToScheduledDates(slots)).toEqual([
            "2026-01-01T10:00:00.000Z",
            "2026-01-01T11:00:00.000Z",
        ])
    })
})
