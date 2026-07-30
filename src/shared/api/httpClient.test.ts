import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { unwrapData, type HttpResult } from "@/shared/api/httpClient"

describe("unwrapData", () => {
    it("unwraps envelope data", () => {
        const result: HttpResult<{ data: { id: string } }> = {
            data: { data: { id: "1" } },
        }
        expect(unwrapData(result)).toEqual({ data: { id: "1" } })
    })

    it("preserves errors", () => {
        const result: HttpResult<{ data: string }> = {
            error: "boom",
            code: "X",
        }
        expect(unwrapData(result)).toEqual({ error: "boom", code: "X" })
    })
})

describe("httpClient", () => {
    beforeEach(() => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ data: { ok: true } }),
            })
        )
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.resetModules()
    })

    it("returns parsed JSON on success", async () => {
        const { httpGet } = await import("@/shared/api/httpClient")
        const result = await httpGet<{ data: { ok: boolean } }>(
            "https://example.com/api",
            { skipAuth: true }
        )
        expect(result.data).toEqual({ data: { ok: true } })
        expect(result.error).toBeUndefined()
    })
})
