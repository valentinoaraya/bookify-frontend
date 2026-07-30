import { ReactNode } from "react"
import { useModalTransition } from "@/shared/hooks/useModalTransition"

interface Props {
    isOpen: boolean
    onClose?: () => void
    children: ReactNode
    bodyClass?: string
    overlayClassName?: string
    contentClassName?: string
}

export function ModalShell({
    isOpen,
    children,
    bodyClass = "settings-modal-open",
    overlayClassName = "modalOverlay",
    contentClassName,
}: Props) {
    const { shouldRender, closing } = useModalTransition(isOpen, { bodyClass })

    if (!shouldRender) return null

    return (
        <div className={`${overlayClassName} ${closing ? "closing" : "opening"}`}>
            {contentClassName ? (
                <div className={contentClassName}>{children}</div>
            ) : (
                children
            )}
        </div>
    )
}

export default ModalShell
