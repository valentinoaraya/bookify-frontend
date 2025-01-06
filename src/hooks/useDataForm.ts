import { useState } from "react";

interface DataForm {
    [key: string]: string | number;
}

export const useDataForm = (initialState: DataForm) => {
    const [dataForm, setDataForm] = useState(initialState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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