import "./LoadingModal.css"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner"

interface Props {
    text: string
    isOpen: boolean
}

const LoadingModal: React.FC<Props> = ({ text, isOpen }) => {

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("loading-modal-open")
        } else {
            document.body.classList.remove("loading-modal-open")
        }

        return () => document.body.classList.remove("loading-modal-open")
    }, [isOpen])

    if (!isOpen) return null

    return createPortal(
        <div className="modalOverlayLoading" role="alertdialog" aria-busy="true" aria-live="assertive">
            <LoadingSpinner
                text={text}
            />
        </div>,
        document.body
    );
}

export default LoadingModal;
