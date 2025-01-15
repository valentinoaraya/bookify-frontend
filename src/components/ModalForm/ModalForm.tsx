import "./ModalForm.css"
import Button from "../../common/Button/Button";
import LabelInputComponent from "../LoginRegisterForms/LabelInputComponent/LabelInputComponent";
import Title from "../../common/Title/Title";
import { commonLabels } from "../../utils/commonLabels";
import { useDataForm } from "../../hooks/useDataForm";

interface Props {
    title: string;
    isOpen: boolean;
    labels: string[];
    disabledButtons: boolean;
    onClose: () => void;
    onSubmitForm: (data: {
        [key: string]: any
    }) => void;
}

const ModalForm: React.FC<Props> = ({ title, labels, isOpen, onClose, onSubmitForm, disabledButtons }) => {

    const { dataForm, handleChange, deleteData } = useDataForm({
        title: "",
        description: "",
        price: 0,
        duration: 0,
    })

    const handleCloseForm = () => {
        deleteData()
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="modalOverlay">
            <div className="modalContent">
                <Title fontSize="2.2rem">{title}</Title>
                <form
                    className="formModal"
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmitForm(dataForm)
                    }}
                >
                    {
                        labels.map(label => {
                            return <LabelInputComponent
                                key={label}
                                label={commonLabels[label]}
                                type={label === "price" || label === "duration" ? "number" : "text"}
                                required={true}
                                name={label}
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
