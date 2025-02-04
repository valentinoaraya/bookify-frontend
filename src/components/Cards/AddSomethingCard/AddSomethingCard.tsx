import "./AddSomethingCard.css"
import { PlusIcon } from "../../../common/Icons/Icons"

interface Props {
    label: string
    onClick: () => void
}

const AddSomethingCard: React.FC<Props> = ({ label, onClick }) => {

    return (

        <div
            className="divAddSomethingCard"
            onClick={onClick}

        >
            <PlusIcon
                width="50"
                height="50"
                fill="#457B9D"
            />
            <p>{label}</p>
        </div>
    );
}

export default AddSomethingCard;
