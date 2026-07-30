import { describe, it, expect } from "vitest"
import { plans } from "@/utils/plans"

describe("plans", () => {
    it("exposes the three SaaS plans", () => {
        expect(plans.map((p) => p.id)).toEqual([
            "individual",
            "individual_plus",
            "team",
        ])
    })

    it("marks team as unavailable", () => {
        expect(plans.find((p) => p.id === "team")?.available).toBe(false)
    })

    it("individual allows up to 5 services in copy", () => {
        const individual = plans.find((p) => p.id === "individual")
        expect(individual?.features.some((f) => f.includes("5 servicios"))).toBe(
            true
        )
    })
})
