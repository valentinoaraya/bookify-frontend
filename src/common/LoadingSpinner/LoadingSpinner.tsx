import "./LoadingSpinner.css"

const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="loading-container">
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <h2>{text}</h2>
            </div>
        </div>
    );
}

export default LoadingSpinner;
