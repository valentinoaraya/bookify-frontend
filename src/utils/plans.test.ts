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

    it("individual is free with up to 3 services", () => {
        const individual = plans.find((p) => p.id === "individual")
        expect(individual?.price).toBe("Gratis")
        expect(individual?.features.some((f) => f.includes("3 servicios"))).toBe(
            true
        )
    })

    it("individual_plus costs 9900 and includes Mercado Pago", () => {
        const plus = plans.find((p) => p.id === "individual_plus")
        expect(plus?.price).toBe("$9.900")
        expect(plus?.features.some((f) => f.includes("Mercado Pago"))).toBe(true)
    })
})
