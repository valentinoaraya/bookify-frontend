import "./Title.css";

interface Props {
    children: React.ReactNode;
    fontSize?: string;
}

const Title: React.FC<Props> = ({ children, fontSize }) => {
    return (
        <h1 className="title" style={{ fontSize: fontSize }}>
            {children}
        </h1>
    );
}

export default Title;
