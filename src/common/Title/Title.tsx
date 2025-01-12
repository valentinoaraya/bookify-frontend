import "./Title.css";

interface Props {
    children: React.ReactNode;
    fontSize?: string;
    margin?: string
}

const Title: React.FC<Props> = ({ children, fontSize, margin }) => {
    return (
        <h1 className="title"
            style={{
                fontSize: fontSize,
                margin: margin || 0
            }}
        >
            {children}
        </h1>
    );
}

export default Title;
