import "./Title.css";

interface Props {
    children: React.ReactNode;
    fontSize?: string;
    margin?: string;
    cursorPointer?: boolean;
}

const Title: React.FC<Props> = ({ children, fontSize, margin, cursorPointer }) => {
    return (
        <h1 className="title"
            style={{
                fontSize: fontSize,
                margin: margin || 0,
                cursor: cursorPointer ? "pointer" : "default"
            }}
        >
            {children}
        </h1>
    );
}

export default Title;
