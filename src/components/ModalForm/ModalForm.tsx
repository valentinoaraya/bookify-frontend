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
import ModalShell from "@/shared/ui/ModalShell";

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
    const [isDisabled, setIsDisabled] = useState(true)

    useEffect(() => {
        const checkData = () => {
            if (JSON.stringify({
                ...initialData,
                days: selectedDays
            }) === JSON.stringify({
                ...dataForm,
                days: selectedDays
            })) {
                setIsDisabled(true)
                return
            }
            setIsDisabled(false)
        }

        checkData()
    }, [dataForm])

    const handleCloseForm = () => {
        deleteData()
        onClose()
    }

    return (
        <ModalShell isOpen={isOpen} overlayClassName="modalOverlay" bodyClass="settings-modal-open">
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
                        if (isDisabled) {
                            return
                        }
                        if (Object.keys(dataForm).includes("days")) {
                            if (!selectedDays || selectedDays.length === 0) {
                                notifyError("Selecciona los días en el calendario.")
                            } else if (!dataForm["hourStart"] || !dataForm["hourFinish"]) {
                                notifyError("Completa las horas de inicio y fin.")
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
                                    required
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
                            loading={disabledButtons}
                        >
                            Aceptar
                        </Button>
                        <Button
                            type="button"
                            variant="neutral"
                            onSubmit={handleCloseForm}
                            disabled={disabledButtons}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </ModalShell>
    );
}

export default ModalForm;
