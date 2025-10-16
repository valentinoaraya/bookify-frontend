import "react-day-picker/style.css";
import "./ModalForm.css"
import Button from "../../common/Button/Button";
import LabelInputComponent from "../LoginRegisterForms/LabelInputComponent/LabelInputComponent";
import Title from "../../common/Title/Title";
import { useDataForm } from "../../hooks/useDataForm";
import { Input } from "../../types";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { useEffect, useState } from "react";
import { notifyError } from "../../utils/notifications";

interface Props {
    title: string;
    isOpen: boolean;
    inputs: Input[];
    disabledButtons: boolean;
    initialData: { [key: string]: any };
    dayPicker?: boolean;
    horizontalForm?: boolean;
    onClose: () => void;
    onSubmitForm: (data: {
        [key: string]: any
    }) => void;
}

const ModalForm: React.FC<Props> = ({ title, inputs, isOpen, onClose, onSubmitForm, disabledButtons, initialData, dayPicker, horizontalForm }) => {

    const { dataForm, handleChange, deleteData } = useDataForm(initialData)
    const [selectedDays, setSelectedDays] = useState<Date[] | undefined>()
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setClosing(false);
            document.body.classList.add("settings-modal-open");
        } else {
            setClosing(true);
            document.body.classList.remove("settings-modal-open");

            const timeout = setTimeout(() => {
                setShouldRender(false);
                setClosing(false);
            }, 300);

            return () => clearTimeout(timeout);
        }
    }, [isOpen])

    const handleCloseForm = () => {
        deleteData()
        onClose()
    }

    if (!shouldRender) return null

    return (
        <div className={`modalOverlay ${closing ? "closing" : "opening"}`}>
            <div className="modalContent">
                <Title
                    textAlign="center"
                >
                    {title}
                </Title>
                <form
                    className="formModal"
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (Object.keys(dataForm).includes("days")) {
                            if (!selectedDays) {
                                notifyError("Selecciona los días en el calendario.")
                            } else {
                                const newDataForm = { ...dataForm, days: selectedDays }
                                onSubmitForm(newDataForm)
                                deleteData()
                                setSelectedDays(undefined)
                            }
                        } else {
                            onSubmitForm(dataForm)
                            deleteData()
                        }
                    }}
                >
                    <div className={horizontalForm ? "divInputsFormModal" : ""}>
                        {
                            dayPicker &&
                            <div className="dayPickerContainer">
                                <DayPicker
                                    disabled={{ before: new Date() }}
                                    mode="multiple"
                                    selected={selectedDays}
                                    onSelect={setSelectedDays}
                                    locale={es}
                                />
                            </div>
                        }
                        <div className="divInputsContainer">
                            {
                                inputs.map(input => {
                                    return <LabelInputComponent
                                        key={input.name}
                                        label={input.label}
                                        placeholder={input.placeholder}
                                        type={input.type}
                                        required={true}
                                        name={input.name}
                                        value={dataForm[input.name]}
                                        selectOptions={input.selectOptions}
                                        mainSelectOption={input.mainSelectOption}
                                        onChange={handleChange}
                                    />
                                })
                            }
                        </div>
                    </div>
                    <div className="divButtonsFormModal">
                        <Button
                            type="submit"
                            disabled={disabledButtons}
                        >
                            Aceptar
                        </Button>
                        <Button
                            type="button"
                            backgroundColor="#f44336"
                            onSubmit={handleCloseForm}
                            disabled={disabledButtons}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalForm;
