import "./LabelInputComponent.css";

interface LabelInputComponentProps {
    label: string;
    type: string;
    name: string;
    required: boolean;
    value?: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LabelInputComponent: React.FC<LabelInputComponentProps> = ({ label, type, name, required, value, onChange }) => {
    return (
        <div className="divInput">
            <label>{label}</label>
            <input
                type={type}
                name={name}
                required={required}
                onChange={onChange}
                value={value}
            />
        </div>
    );
}

export default LabelInputComponent;