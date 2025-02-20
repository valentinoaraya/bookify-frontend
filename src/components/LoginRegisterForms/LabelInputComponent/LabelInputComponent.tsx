import "./LabelInputComponent.css";
import { TimePicker, ConfigProvider } from "antd";

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
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#457B9D",
                    colorBorder: "grey",
                    colorTextPlaceholder: "grey",
                    colorIcon: "grey",
                    borderRadius: 10,
                },
            }}

        >
            <div className="divInput">
                <label>{label}</label>
                {
                    type === "selectHour" ?
                        <div className="timePickerContainer">
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