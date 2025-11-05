import { useEffect, useState } from "react";

interface DataForm {
    [key: string]: string | number;
}

export const useDataForm = (initialState: DataForm) => {
    const [dataForm, setDataForm] = useState(initialState);

    useEffect(() => {
        setDataForm(initialState)
    }, [JSON.stringify(initialState)])

    const deleteData = () => {
        setDataForm(initialState)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.target.type === "number") {
            setDataForm({
                ...dataForm,
                [e.target.name]: parseFloat(e.target.value)
            })
        } else {
            setDataForm({
                ...dataForm,
                [e.target.name]: e.target.value
            });
        }
    }

    const updateField = (name: string, value: string | number) => {
        setDataForm({
            ...dataForm,
            [name]: value
        });
    }

    return {
        dataForm,
        handleChange,
        deleteData,
        updateField
    }
}