import { toast } from "react-toastify";

export const notifySuccess = (text: string, noClose?: boolean) => toast.success(text, {
    position: "top-right",
    autoClose: noClose ? false : 2000,
    pauseOnHover: false,
    theme: "colored"
})

export const notifyError = (text: string, noClose?: boolean) => toast.error(text, {
    position: "top-right",
    autoClose: noClose ? false : 2000,
    pauseOnHover: false,
    theme: "colored"
})

export const notifyWarn = (text: string, noClose?: boolean) => toast.warn(text, {
    position: "top-right",
    autoClose: noClose ? false : 6000,
    pauseOnHover: false,
    theme: "colored"
})