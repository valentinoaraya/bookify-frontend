import "./ModalForm.css"
import Button from "../../common/Button/Button";
import LabelInputComponent from "../LoginRegisterForms/LabelInputComponent/LabelInputComponent";
import Title from "../../common/Title/Title";
import { useDataForm } from "../../hooks/useDataForm";
import { Input } from "../../types";

interface Props {
    title: string;
    isOpen: boolean;
    inputs: Input[];
    disabledButtons: boolean;
    initialData: { [key: string]: any };
    onClose: () => void;
    onSubmitForm: (data: {
        [key: string]: any
    }) => void;
}

const ModalForm: React.FC<Props> = ({ title, inputs, isOpen, onClose, onSubmitForm, disabledButtons, initialData }) => {

    if (!isOpen) return null

    const { dataForm, handleChange, deleteData } = useDataForm(initialData)

    const handleCloseForm = () => {
        deleteData()
        onClose()
    }

    return (
        <div className="modalOverlay">
            <div className="modalContent">
                <Title fontSize="2.2rem">{title}</Title>
                <form
                    className="formModal"
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmitForm(dataForm)
                        deleteData()
                    }}
                >
                    {
                        inputs.map(input => {
                            return <LabelInputComponent
                                key={input.name}
                                label={input.placeholder}
                                type={input.type}
                                required={true}
                                name={input.name}
                                value={dataForm[input.name]}
                                onChange={handleChange}
                            />
                        })
                    }
                    <div className="divButtonsFormModal">
                        <Button
                            type="submit"
                            disabled={disabledButtons}
                        >
                            Aceptar
                        </Button>
                        <Button
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
