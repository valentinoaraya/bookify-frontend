import "./LoadingSpinner.css"

const LoadingSpinner: React.FC<{ text: string, shadow?: string }> = ({ text, shadow }) => {
    return (
        <div className="loading-container">
            <div className="loading-content"
                style={{
                    boxShadow: shadow ? shadow : ""
                }}
            >
                <div className="loading-spinner"></div>
                <h2>{text}</h2>
            </div>
        </div>
    );
}

export default LoadingSpinner;
