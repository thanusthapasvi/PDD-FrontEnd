import { use, useEffect } from "react";

function Message({ message, importance="normal", show, onClose}) {
    useEffect(() => {
        if (!show) return;

        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [show, message]);

    if (!show) return null;
    
    return (
        <div className={`message-box position-fixed flex-center ${importance} padding-sm`}>
            {`${message}`}
        </div>
    );
}

export default Message;