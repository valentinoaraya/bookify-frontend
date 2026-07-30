import { useEffect, useState } from "react"

/**
 * Shared open/close transition for overlay modals.
 */
export function useModalTransition(
    isOpen: boolean,
    options: { bodyClass?: string; durationMs?: number } = {}
) {
    const { bodyClass = "settings-modal-open", durationMs = 300 } = options
    const [shouldRender, setShouldRender] = useState(isOpen)
    const [closing, setClosing] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
            setClosing(false)
            document.body.classList.add(bodyClass)
        } else {
            setClosing(true)
            document.body.classList.remove(bodyClass)
            const timeout = setTimeout(() => {
                setShouldRender(false)
                setClosing(false)
            }, durationMs)
            return () => clearTimeout(timeout)
        }

        return () => document.body.classList.remove(bodyClass)
    }, [isOpen, bodyClass, durationMs])

    return { shouldRender, closing }
}
