import { useNavigate, useLocation } from "react-router-dom";

function BackIcon({ fallback = "/home" }) {
    const navigate = useNavigate();
    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(fallback);
        }
    };

    return (
        <div className="back-to-home width-full">
            <button className='back-to-home-button flex align-center cursor-pointer padding-sm' onClick={handleBack}>
                <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="var(--text)">
                    <path d="m287-446.67 240 240L480-160 160-480l320-320 47 46.67-240 240h513v66.66H287Z"/>
                </svg>
                Back
            </button>
        </div>
    );
}

export default BackIcon;