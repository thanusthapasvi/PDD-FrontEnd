import './Settings.css';
import { useState, useEffect } from 'react';
import { useToast } from "./ToastContext.jsx";
import { API_URL } from "./config";
import BackIcon from './assets/BackIcon';
import useForgotPassword from './useForgotPassword';
import { useNavigate } from 'react-router-dom';

function Settings() {
    const navigate = useNavigate();
    const showToast = useToast();

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("userTheme") === "dark";
    });
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
            document.body.classList.remove("light");
            localStorage.setItem("userTheme", "dark");
        } else {
            document.body.classList.add("light");
            document.body.classList.remove("dark");
            localStorage.setItem("userTheme", "light");
        }
    }, [darkMode]);

    const [isChangePassOpen, openChangePassPop] = useState(false);
    const [confirmPass, setConfirmPass] = useState("");
    const validatePassword = (pass) => {
        if (pass.length < 8) {
            showToast("Password must be at least 8 characters", "alert");
            return false;
        }
        if (!/[a-z]/.test(pass)) {
            showToast("Password must contain a lowercase letter", "alert");
            return false;
        }
        if (!/[A-Z]/.test(pass)) {
            showToast("Password must contain an uppercase letter", "alert");
            return false;
        }
        if (!/[0-9]/.test(pass)) {
            showToast("Password must contain a number", "alert");
            return false;
        }
        if (!/[^A-Za-z0-9]/.test(pass)) {
            showToast("Password must contain a special character", "alert");
            return false;
        }
        return true;
    };
    const {
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
    } = useForgotPassword(showToast);

    const handleForgotPasswordReset = async (e) => {
        e.preventDefault();

        if (!isFpOtpVerified) {
            showToast("Verify OTP first", "alert");
            return;
        }

        if (!forgotPassData.password || !validatePassword(forgotPassData.password)) return;

        if (forgotPassData.password !== confirmPass) {
            showToast("Passwords do not match", "alert");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/reset_password.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: forgotPassData.email,
                    password: forgotPassData.password
                })
            });

            const data = await res.json();

            if (data.status === "success") {
                showToast("Password change successful! Login now.", "success");
                openChangePassPop(false);
                resetState();
                localStorage.clear();
                navigate("/");
            } else {
                showToast(data.message || "Reset failed", "alert");
            }
        } catch (err) {
            showToast("Cannot connect to server", "alert");
        }
    };

    const [isDeleteAccountOpen, openDeleteAccount] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    const handleDeleteAccount = async (e) => {
        e.preventDefault();

        if (!isFpOtpVerified) {
            showToast("Verify OTP first", "alert");
            return;
        }

        if (deleteConfirmText !== "I want to delete my account.") {
            showToast("Please type the exact confirmation text", "alert");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/delete_account.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: forgotPassData.email
                })
            });

            const data = await res.json();

            if (data.status === "success") {
                showToast("Account deleted successfully", "success");
                openDeleteAccount(false);
                resetState();
                localStorage.clear();
                navigate("/");
            } else {
                showToast(data.message || "Delete failed", "alert");
            }
        } catch (err) {
            showToast("Cannot connect to server", "alert");
        }
    };

    return (
        <div className='settings-container padding-md'>
            <BackIcon />
            <div className='page-box-cover flex-center flex-column width-full'>
                <div className='settings-box page-box flex flex-column align-center position-relative padding-md'>
                    <div className='settings-header'>
                        <h1 className='settings-heading grad-text'>Settings</h1>
                    </div>
                    <hr />
                    <div className='settings-section flex flex-column justify-center padding-sm'>
                        <span className='section-heading'>General</span>
                        <div className='section-content flex flex-column'>
                            <div className='settings-element cursor-pointer theme-switch flex align-center' onClick={() => setDarkMode(prev => !prev)}>
                                <div className='setting-content-left flex flex-column' >
                                    <p className='setting-text-1'>Dark Mode</p>
                                    <p className='setting-text-2'>Toggle dark mode</p>
                                </div>
                                <div className='toggle-box position-relative'>
                                    <input type='checkbox' name="theme-toggle" className='theme-toggle cursor-pointer'
                                        checked={darkMode} readOnly
                                        onChange={(e) => setDarkMode(e.target.checked)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className='slider position-relative'>
                                        <div className='slider-head position-absolute'>
                                            <div className='dot-1 position-absolute'></div>
                                            <div className='dot-2 position-absolute'></div>
                                            <div className='dot-3 position-absolute'></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='settings-section flex flex-column justify-center padding-sm'>
                        <span className='section-heading'>Account Settings</span>
                        <div className='section-content flex flex-column cursor-pointer'>
                            <div className='settings-element cursor-pointer change-pass flex align-center' onClick={() => openChangePassPop(true)}>
                                <div className='setting-content-left flex flex-column' >
                                    <p className='setting-text-1 danger-1'>Change Password</p>
                                    <p className='setting-text-2 danger-2'>Update your account password</p>
                                </div>
                            </div>
                            <div className='settings-element cursor-pointer delete-account flex align-center' onClick={() => openDeleteAccount(true)}>
                                <div className='setting-content-left flex flex-column' >
                                    <p className='setting-text-1 alert-1'>Delete Account</p>
                                    <p className='setting-text-2 alert-2'>Delete your account password</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='settings-section flex flex-column justify-center padding-sm' >
                        <span className='section-heading'>Service</span>
                        <div className='section-content flex flex-column'>
                            <div className='settings-element cursor-pointer privacy-policy flex align-center' onClick={() => navigate("/privacy-policy")}>
                                <div className='setting-content-left flex flex-column' >
                                    <p className='setting-text-1'>Privacy Policy</p>
                                    <p className='setting-text-2'>Review our privacy policy</p>
                                </div>
                            </div>
                            <div className='settings-element cursor-pointer terms-conditions flex align-center' onClick={() => navigate("/terms-of-service")}>
                                <div className='setting-content-left flex flex-column' >
                                    <p className='setting-text-1'>Terms of Service</p>
                                    <p className='setting-text-2'>Read our terms and conditions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isChangePassOpen && (
                <div key="change-password" className='popup box-shadow-danger'>
                    <div className='pop grad-border'>
                        <h1 className='popup-head color-danger'>Change Password</h1>
                        <p className='pop-close' onClick={() => openChangePassPop(false)}>X</p>
                        <form className='flex-center flex-column' onSubmit={handleForgotPasswordReset}>
                            <h2>Verify its you</h2>
                            <div className='input-cover flex flex-column width-full'>
                                <div className='input-cover flex flex-column width-full'>
                                    <label className="input-label" htmlFor="forgot-pass-email">Email</label>
                                    <input type="email" name="forgot-pass-email" className='input-box outline-focus' placeholder='Enter your email'
                                        disabled={isFpOtpVerified} required
                                        onChange={e => setForgotPassData({ ...forgotPassData, email: e.target.value })}
                                    />
                                </div>
                                <label className="input-label" htmlFor="otp">Enter OTP</label>
                                <div className='otp-box flex-center'>
                                    <input type="password" name="otp" className='input-box outline-focus otp-box' required placeholder="Enter OTP"
                                        value={fpOtp}
                                        onChange={(e) => setFpOtp(e.target.value)}
                                        disabled={!isFpOtpSent || isFpOtpVerified}
                                    />
                                    {
                                        isFpOtpSent && (
                                            <button type="button" className='otp-verify outline-focus' disabled={isFpOtpVerified} onClick={verifyForgotOtp} style={{
                                                backgroundColor: isFpOtpVerified ? "var(--message-success)" : "var(--primary)"
                                            }}>{isFpOtpVerified ? "Verified" : "Verify"}</button>
                                        )}
                                    <button type='button' className='otp-send outline-focus' disabled={isFpOtpVerified || fpResendTimer}
                                        onClick={(e) => {
                                            if (!fpResendTimer) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                sendForgotOtp();
                                            } else {
                                                showToast("Please for try after sometime", "normal")
                                            }
                                        }}
                                    >{!isFpOtpSent ? "Send OTP" : "Resend"}</button>
                                </div>
                            </div>
                            <div className='input-cover flex flex-column width-full'>
                                <label className="input-label" htmlFor="password">Create new Password</label>
                                <input type="password" name="password" className='input-box outline-focus' placeholder='Create a password' required
                                    onChange={(e) => {
                                        const pass = e.target.value;
                                        setForgotPassData({ ...forgotPassData, password: pass });
                                    }}
                                />
                            </div>
                            <div className='input-cover flex flex-column width-full'>
                                <label className="input-label" htmlFor="confirm-password">Confirm Password</label>
                                <input type="password" name="confirm-password" className='input-box outline-focus' placeholder='Confrom password' required onChange={e => setConfirmPass(e.target.value)} />
                            </div>
                            <button className='button outline-focus' type='submit'>Save and Login</button>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteAccountOpen && (
                <div key="delete-password" className='popup box-shadow-alert'>
                    <div className='pop grad-border'>
                        <h1 className='popup-head color-alert'>Delete Account</h1>
                        <p className='pop-close' onClick={() => {
                            openDeleteAccount(false);
                            resetState();
                        }}>X</p>
                        <form className='flex-center flex-column' onSubmit={handleDeleteAccount}>
                            <h2>Verify its you</h2>
                            <div className='input-cover flex flex-column width-full'>
                                <div className='input-cover flex flex-column width-full'>
                                    <label className="input-label" htmlFor="forgot-pass-email">Email</label>
                                    <input type="email" name="forgot-pass-email" className='input-box outline-focus' placeholder='Enter your email'
                                        disabled={isFpOtpVerified} required
                                        onChange={e => setForgotPassData({ ...forgotPassData, email: e.target.value })}
                                    />
                                </div>
                                <label className="input-label" htmlFor="otp">Enter OTP</label>
                                <div className='otp-box flex-center'>
                                    <input type="password" name="otp" className='input-box outline-focus otp-box' required placeholder="Enter OTP"
                                        value={fpOtp}
                                        onChange={(e) => setFpOtp(e.target.value)}
                                        disabled={!isFpOtpSent || isFpOtpVerified}
                                    />
                                    {
                                        isFpOtpSent && (
                                            <button type="button" className='otp-verify outline-focus' disabled={isFpOtpVerified} onClick={verifyForgotOtp} style={{
                                                backgroundColor: isFpOtpVerified ? "var(--message-success)" : "var(--primary)"
                                            }}>{isFpOtpVerified ? "Verified" : "Verify"}</button>
                                        )}
                                    <button type='button' className='otp-send outline-focus' disabled={isFpOtpVerified || fpResendTimer}
                                        onClick={(e) => {
                                            if (!fpResendTimer) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                sendForgotOtp();
                                            } else {
                                                showToast("Please for try after sometime", "normal")
                                            }
                                        }}
                                    >{!isFpOtpSent ? "Send OTP" : "Resend"}</button>
                                </div>
                            </div>
                            <div className='input-cover flex flex-column width-full'>
                                <label className="input-label" htmlFor="confrom-delete">Enter "I want to delete my account."</label>
                                <input type="text" name="confrom-delete" className='input-box outline-focus' required
                                    onChange={(e) => {
                                        setDeleteConfirmText(e.target.value)
                                    }}
                                />
                            </div>
                            <button className='button' type='submit'>Delete Account</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;