import { createElement } from "react"
import { createRoot, Root } from "react-dom/client"
import { ConfirmDialog, ConfirmIcon } from "@/shared/ui/ConfirmDialog/ConfirmDialog"
import "@/shared/ui/ConfirmDialog/ConfirmDialog.css"

interface Alert {
    question: string
    message?: string
    icon?: ConfirmIcon
    confirmButtonText: string
    cancelButtonText?: string
    cancelButton: boolean
}

type Pending = {
    resolve: (value: boolean) => void
}

let host: HTMLDivElement | null = null
let root: Root | null = null
let pending: Pending | null = null

const ensureHost = () => {
    if (host && root) return
    host = document.createElement("div")
    host.id = "bk-confirm-root"
    document.body.appendChild(host)
    root = createRoot(host)
}

const cleanup = () => {
    document.body.classList.remove("bk-confirm-open")
    root?.render(null)
}

const settle = (value: boolean) => {
    const current = pending
    pending = null
    cleanup()
    current?.resolve(value)
}

export const confirmDelete = (alert: Alert): Promise<boolean> => {
    if (pending) {
        const previous = pending
        pending = null
        previous.resolve(false)
    }

    ensureHost()
    document.body.classList.add("bk-confirm-open")

    return new Promise<boolean>((resolve) => {
        pending = { resolve }

        root!.render(
            createElement(ConfirmDialog, {
                question: alert.question,
                message: alert.message,
                icon: alert.icon,
                confirmButtonText: alert.confirmButtonText,
                cancelButtonText: alert.cancelButtonText,
                cancelButton: alert.cancelButton,
                onConfirm: () => settle(true),
                onCancel: () => settle(false),
            })
        )
    })
}
