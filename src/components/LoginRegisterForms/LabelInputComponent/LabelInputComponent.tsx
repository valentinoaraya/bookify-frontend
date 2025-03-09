import "./LabelInputComponent.css";
import { TimePicker, ConfigProvider } from "antd";
import { Picker, Button } from "antd-mobile";
import { useState } from "react";
import { columns } from "../../../utils/columsPicker";

interface LabelInputComponentProps {
    label: string;
    type: string;
    name: string;
    placeholder?: string;
    required: boolean;
    value?: string | number;
    mainSelectOption?: string;
    selectOptions?: string[];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const LabelInputComponent: React.FC<LabelInputComponentProps> = ({ label, type, name, required, value, selectOptions, mainSelectOption, placeholder, onChange }) => {


    const [visible, setVisible] = useState(false)
    const [valueButtonPicker, setValueButtonPicker] = useState<string>("Selecciona hora...")

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#457B9D",
                    colorBorder: "grey",
                    colorTextPlaceholder: "grey",
                    colorIcon: "grey",
                    borderRadius: 10,
                    fontSize: 16,
                },
            }}

        >
            <div className="divInput">
                <label>{label}</label>
                {
                    type === "selectHour" ?
                        <div className="timePickerContainer">
                            {
                                window.innerWidth <= 930 ?
                                    <>
                                        <Button onClick={() => setVisible(true)}>{valueButtonPicker}</Button>
                                        <Picker
                                            columns={columns}
                                            visible={visible}
                                            onClose={() => setVisible(false)}
                                            onConfirm={(v) => {
                                                const hora = `${v[0]}:${v[1]}`
                                                setValueButtonPicker(hora)
                                                onChange({
                                                    target: {
                                                        name,
                                                        value: hora
                                                    }
                                                } as any)
                                            }}
                                            cancelText="Cancelar"
                                            confirmText="Confirmar"
                                        />
                                    </>
                                    :
                                    <TimePicker
                                        format={"HH:mm"}
                                        placeholder="Selecciona una hora"
                                        showNow={false}
                                        onChange={(_time, timeString) => {
                                            onChange({
                                                target: {
                                                    name,
                                                    value: timeString
                                                }
                                            } as any)
                                        }}
                                    />
                            }
                        </div>
                        :
                        <>
                            {
                                type === "select" ?
                                    <select
                                        name={name}
                                        required={required}
                                        onChange={onChange}
                                    >
                                        <option value="">{mainSelectOption}</option>
                                        {
                                            selectOptions?.map(option => {
                                                return <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>
                                            })
                                        }

                                    </select>
                                    :
                                    <input
                                        type={type}
                                        name={name}
                                        required={required}
                                        onChange={onChange}
                                        value={value}
                                        placeholder={placeholder}
                                    />
                            }
                        </>
                }

            </div>
        </ConfigProvider>
    );
}

export default LabelInputComponent;