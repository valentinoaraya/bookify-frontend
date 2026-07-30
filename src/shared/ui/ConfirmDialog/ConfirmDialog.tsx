import Button, { ButtonVariant } from "@/common/Button/Button"

export type ConfirmIcon = "warning" | "error" | "success" | "info"

export interface ConfirmDialogProps {
    question: string
    message?: string
    icon?: ConfirmIcon
    confirmButtonText: string
    cancelButtonText?: string
    cancelButton: boolean
    onConfirm: () => void
    onCancel: () => void
}

const iconGlyph: Record<ConfirmIcon, string> = {
    warning: "!",
    error: "!",
    success: "✓",
    info: "i",
}

const confirmVariantFor = (icon?: ConfirmIcon): ButtonVariant => {
    if (icon === "success") return "success"
    if (icon === "error" || icon === "warning") return "danger"
    return "primary"
}

export function ConfirmDialog({
    question,
    message,
    icon,
    confirmButtonText,
    cancelButtonText = "Cancelar",
    cancelButton,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <div
            className="bkConfirmOverlay"
            role="presentation"
        >
            <div
                className="bkConfirmDialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="bk-confirm-title"
                aria-describedby={message ? "bk-confirm-message" : undefined}
            >
                {icon && (
                    <div className={`bkConfirmIcon bkConfirmIcon--${icon}`} aria-hidden="true">
                        <span>{iconGlyph[icon]}</span>
                    </div>
                )}

                <h2 id="bk-confirm-title" className="bkConfirmTitle">
                    {question}
                </h2>

                {message && (
                    <p id="bk-confirm-message" className="bkConfirmMessage">
                        {message}
                    </p>
                )}

                <div className="bkConfirmActions">
                    {cancelButton && (
                        <Button
                            type="button"
                            variant="neutral"
                            width="auto"
                            margin="0"
                            fontSize="0.95rem"
                            padding="0.7rem 1.15rem"
                            onSubmit={onCancel}
                        >
                            {cancelButtonText}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant={confirmVariantFor(icon)}
                        width="auto"
                        margin="0"
                        fontSize="0.95rem"
                        padding="0.7rem 1.15rem"
                        onSubmit={onConfirm}
                    >
                        {confirmButtonText}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
