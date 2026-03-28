import { createContext, useContext, useState } from "react";
import Message from "./Message";

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [msg, setMsg] = useState("");
    const [type, setType] = useState("normal");
    const [show, setShow] = useState(false);

    const showToast = (text, t = "normal") => {
        setMsg(text);
        setType(t);
        setShow(true);
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <Message key={msg} message={msg} importance={type} show={show} onClose={() => setShow(false)} />
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
