import { useState } from "react";
import { API_URL } from "./config";

export default function useForgotPassword(showToast) {
    const [forgotPassData, setForgotPassData] = useState({ email: "", password: "" });
    const [fpOtp, setFpOtp] = useState("");
    const [isFpOtpSent, setIsFpOtpSent] = useState(false);
    const [isFpOtpVerified, setIsFpOtpVerified] = useState(false);
    const [fpResendTimer, setResendTimer] = useState(false);

    const resetState = () => {
        setForgotPassData({ email: "", password: "" });
        setFpOtp("");
        setIsFpOtpSent(false);
        setIsFpOtpVerified(false);
        setResendTimer(false);
    };

    const sendForgotOtp = async () => {
        if (!forgotPassData.email) {
            showToast("Enter email first", "alert");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/send_otp.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotPassData.email })
            });

            const data = await res.json();

            if (data.status === "success") {
                showToast("OTP sent", "success");
                setIsFpOtpSent(true);
                setResendTimer(true);
                setTimeout(() => setResendTimer(false), 20000);
            } else {
                showToast(data.message || "OTP failed", "alert");
            }
        } catch {
            showToast("Cannot connect to server", "alert");
        }
    };

    const verifyForgotOtp = async () => {
        if (!fpOtp) {
            showToast("Enter OTP", "alert");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/verify_otp.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: forgotPassData.email,
                    otp: fpOtp
                })
            });

            const data = await res.json();

            if (data.status === "success") {
                showToast("OTP verified", "success");
                setIsFpOtpVerified(true);
            } else {
                showToast(data.message || "Invalid OTP", "alert");
            }
        } catch {
            showToast("Cannot connect to server", "alert");
        }
    };

    return {
        forgotPassData,
        setForgotPassData,
        fpOtp,
        setFpOtp,
        isFpOtpSent,
        isFpOtpVerified,
        fpResendTimer,
        sendForgotOtp,
        verifyForgotOtp,
        resetState
    };
}
