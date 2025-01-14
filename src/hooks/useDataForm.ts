import { useState } from "react";

interface DataForm {
    [key: string]: string | number;
}

export const useDataForm = (initialState: DataForm) => {
    const [dataForm, setDataForm] = useState(initialState);
    console.log(dataForm)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDataForm({
            ...dataForm,
            [e.target.name]: e.target.value
        });
    }

    return {
        dataForm,
        handleChange
    }
}