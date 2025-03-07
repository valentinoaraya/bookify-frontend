import "./Title.css";

type TextAlign = "left" | "right" | "center" | "justify" | "initial" | "inherit";

interface Props {
    children: React.ReactNode;
    fontSize?: string;
    margin?: string;
    cursorPointer?: boolean;
    textAlign?: TextAlign;
}

const Title: React.FC<Props> = ({ children, fontSize, margin, cursorPointer, textAlign }) => {
    return (
        <h1 className="title"
            style={{
                fontSize: fontSize,
                margin: margin || 0,
                cursor: cursorPointer ? "pointer" : "default",
                textAlign: textAlign && textAlign
            }}
        >
            {children}
        </h1>
    );
}

export default Title;
