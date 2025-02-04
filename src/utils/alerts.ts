import Swal from "sweetalert2";

interface Alert {
    question: string;
    mesasge: string;
    icon: "warning" | "error" | "success" | "info";
    confirmButtonText: string;
    cancelButtonText: string;
}

export const confirmDelete = async (alert: Alert) => {
    return await Swal.fire({
        title: alert.question,
        text: alert.mesasge,
        icon: alert.icon,
        showCancelButton: true,
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