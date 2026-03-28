import { Navigate } from "react-router-dom";
import { useToast } from "./ToastContext.jsx";

export default function ProtectedRoute({ children }) {
    const session = JSON.parse(localStorage.getItem("session"));

    if (!session) return <Navigate to="/" />;

    const showToast = useToast();

    if (Date.now() > session.expiresAt) {
        localStorage.removeItem("session");
        showToast("Session expired, login again", "alert");
        return <Navigate to="/" />;
    }

    return children;
}
