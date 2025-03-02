import Swal from "sweetalert2";

interface Alert {
    question: string;
    mesasge?: string;
    icon?: "warning" | "error" | "success" | "info";
    confirmButtonText: string;
    cancelButtonText?: string;
    cancelButton: boolean;
}

export const confirmDelete = async (alert: Alert) => {
    return await Swal.fire({
        allowOutsideClick: false,
        allowEscapeKey: false,
        title: alert.question,
        text: alert.mesasge,
        icon: alert.icon,
        showCancelButton: alert.cancelButton,
        confirmButtonColor: "#457B9D",
        cancelButtonColor: "grey",
        confirmButtonText: alert.confirmButtonText,
        cancelButtonText: alert.cancelButtonText
    }).then((result) => {
        if (result.isConfirmed) {
            return true
        }
        return false
    });
}