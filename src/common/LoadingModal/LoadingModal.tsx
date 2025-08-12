import "./LoadingModal.css"
import { useEffect } from "react"
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

    return (
        <div className="modalOverlayLoading">
            <LoadingSpinner
                text={text}
            />
        </div>
    );
}

export default LoadingModal;
