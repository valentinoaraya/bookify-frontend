import { useEffect, useState } from "react"

/**
 * Suscribe a un media query y actualiza el valor cuando cambia el viewport.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === "undefined") return false
        return window.matchMedia(query).matches
    })

    useEffect(() => {
        const mediaQuery = window.matchMedia(query)
        const onChange = () => setMatches(mediaQuery.matches)

        onChange()
        mediaQuery.addEventListener("change", onChange)
        return () => mediaQuery.removeEventListener("change", onChange)
    }, [query])

    return matches
}
