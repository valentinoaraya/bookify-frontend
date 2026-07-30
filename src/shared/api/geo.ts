import { PROVINCES_API_URL } from "@/config"
import { httpGet } from "./httpClient"

export async function fetchProvinces() {
    return httpGet<{ provincias: Array<{ id: string; nombre: string }> }>(
        `${PROVINCES_API_URL}/provincias?campos=id,nombre&max=100`,
        { skipAuth: true }
    )
}

export async function fetchMunicipalities(provinceId: string) {
    return httpGet<{
        municipios: Array<{ id: string; nombre: string }>
    }>(
        `${PROVINCES_API_URL}/municipios?provincia=${provinceId}&campos=id,nombre&max=1000`,
        { skipAuth: true }
    )
}
