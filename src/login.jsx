import { useState, useEffect, useRef } from 'react';
import './Login.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from "./ToastContext.jsx";
import { API_URL } from "./config";
import useForgotPassword from './useForgotPassword.jsx'


function Login() {
    const navigate = useNavigate();
    const [isSignupOpen, openSignup] = useState(false);
    const toggleSignup = () => openSignup(!isSignupOpen);

    const showToast = useToast();

    useEffect(() => {
        const session = JSON.parse(localStorage.getItem("session"));
        if (session && Date.now() < session.expiresAt) {
            navigate("/home");
        }
    }, []);


    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const fetchWithTimeout = (url, options = {}, timeout = 5000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        return fetch(url, {
            ...options,
            signal: controller.signal
        }).finally(() => clearTimeout(id));
    };


    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetchWithTimeout(
                `${API_URL}/login.php`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(loginData)
                },
                5000 // 5 seconds
            );


            if (!res.ok) {
                showToast("Server Error. Please try again.", "alert");
                setLoading(false);
                return;
            }

            const data = await res.json();
            if (data.status === "success") {
                const sessionData = {
                    user: data.user,
                    expiresAt: Date.now() + 0.5 * 60 * 60 * 1000 // half hour
                };

                localStorage.setItem("session", JSON.stringify(sessionData));
                showToast("Login Success", "success");
                navigate("/home");
            } else {
                showToast("Invalid Login details", "alert");
            }
            setLoading(false);
        } catch (err) {
            if (err.name === "AbortError") {
                showToast("Server not responding. Try again later.", "alert");
            } else {
                showToast("Cannot connect to server", "alert");
            }
            setLoading(false);
        }
    };

    const [currentPass, setCurrentPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [isAgreed, setIsAgreed] = useState(false);
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

    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    const [resendTimer, setResendTimer] = useState(false);

    const sendOtp = async () => {
        if (!signupData.email) {
            showToast("Enter email first", "alert");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/signup.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "send_otp",
                    email: signupData.email
                })
            });

            if (!res.ok) {
                showToast("Server error while sending OTP", "alert");
                return;
            }
            const data = await res.json();

            if (data.status === "success") {
                showToast("OTP sent", "success");
                setIsOtpSent(true);
            } else {
                showToast(data.message || "OTP failed", "alert");
            }
        } catch (err) {
            console.error(err);
            showToast("Cannot connect to server", "alert");
        }
        setResendTimer(true);
        setTimeout(() => setResendTimer(false), 20000);
    };


    const verifyOtp = async () => {
        if (!otp) {
            showToast("Enter OTP", "alert");
            return;
        }
        const res = await fetch(`${API_URL}/signup.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "verify_otp",
                email: signupData.email,
                otp
            })
        });

        const data = await res.json();
        if (data.status === "success") {
            showToast("OTP verified", "success");
            setIsOtpVerified(true);
        } else {
            showToast(data.message, "alert");
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!isOtpVerified) {
            showToast("Verify OTP first", "alert");
            return;
        }

        if (!validatePassword(currentPass)) {
            setLoading(false);
            return;
        }

        if (signupData.password !== confirmPass) {
            showToast("Passwords does not match", "alert");
            setLoading(false);
            return;
        }

        if (!isAgreed) {
            showToast("You must agree to Privacy Policy & Terms of Service", "alert");
            setLoading(false);
            return;
        }


        try {
            const res = await fetch(`${API_URL}/signup.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "signup",
                    ...signupData
                })
            });

            if (!res.ok) {
                showToast("Server Error. Please try again.", "alert");
                setLoading(false);
                return;
            }

            const data = await res.json();

            if (data.status === "success") {
                const sessionData = {
                    user: data.user,
                    expiresAt: Date.now() + 0.5 * 60 * 60 * 1000
                };
                localStorage.setItem("session", JSON.stringify(sessionData));
                showToast("Welcome to Interview Assist", "success");
                navigate("/home");
            } else {
                showToast(data.message || "Signup failed", "alert");
            }
        } catch (err) {
            showToast("Cannot connect to server", "alert");
        }

        setLoading(false);
    };

    const [isForgotPassOpen, openForgotPassPop] = useState(false);
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

        if (!validatePassword(forgotPassData.password)) return;

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
                showToast("Password reset successful! Login now.", "success");
                openForgotPassPop(false);
                resetState();
            } else {
                showToast(data.message || "Reset failed", "alert");
            }
        } catch (err) {
            showToast("Cannot connect to server", "alert");
        }
    };

    return (
        <div className='login-page flex align-center justify-center width-full height-full position-relative padding-md'>
            <div className="login-container flex-center flex-column padding-md shadow-soft">
                <div className='login-intro width-full'>
                    <h1 className='site-heading'>Interview Assist</h1>
                    <h2 className='site-sub-heading'>by Alumni</h2>
                </div>
                {!isSignupOpen ? (
                    <div key="login" className='login-box width-full flex flex-column align-center justify-center'>
                        <form className='login-form flex-center flex-column' onSubmit={handleLogin}>
                            <div className='input-cover'>
                                <label className="input-label" htmlFor="email">Email</label>
                                <input type="email" name="email" id="email" className='input-box outline-focus' placeholder='Enter your email' required onChange={e => setLoginData({ ...loginData, email: e.target.value })} />
                            </div>
                            <div className='input-cover'>
                                <label className="input-label" htmlFor="password">Password</label>
                                <input type="password" name="password" id="password" className='input-box outline-focus' placeholder='Enter your password' required onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
                            </div>
                            <div className='width-full flex align-center'>
                                <p className='forgot-pass cursor-pointer' onClick={() => openForgotPassPop(true)}>Forgot password?</p>
                            </div>
                            <button type="submit" className='login-button width-full button outline-focus' disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
                        </form>
                        <div className='sign-up-text flex align-center justify-center'>
                            <p>Don't have an account? </p>
                            <button className='sign-up-text-button cursor-pointer outline-focus' onClick={toggleSignup}>sign up</button>
                        </div>
                        {/* forgot password email */}
                        {isForgotPassOpen && (
                            <div key="forgot-password" className='popup'>
                                <div className='pop grad-border' style={{ boxShadow: "inset 0 0 2rem var(--primary)" }}>
                                    <h1 className='popup-head' style={{ color: "var(--primary)" }}>Forgot password?</h1>
                                    <p className='pop-close' onClick={() => openForgotPassPop(false)}>X</p>
                                    <form className='flex-center flex-column' onSubmit={handleForgotPasswordReset}>
                                        <h2>Verify its you</h2>
                                        <div className='input-cover'>
                                            <div className='input-cover'>
                                                <label className="input-label" htmlFor="forgot-pass-email">Email</label>
                                                <input type="email" name="forgot-pass-email" id='forgot-pass-email' className='input-box outline-focus' placeholder='Enter your email'
                                                    disabled={isFpOtpVerified} required
                                                    onChange={e => setForgotPassData({ ...forgotPassData, email: e.target.value })}
                                                />
                                            </div>
                                            <label className="input-label" htmlFor="forgot-pass-otp">Enter OTP</label>
                                            <div className='otp-box flex-center'>
                                                <input type="password" name="otp" id='forgot-pass-otp' className='input-box outline-focus otp-box' required placeholder="Enter OTP"
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
                                        <div className='input-cover'>
                                            <label className="input-label" htmlFor="new-password">Create new Password</label>
                                            <input type="password" name="password" id='new-password' className='input-box outline-focus' placeholder='Create a password' required
                                                onChange={(e) => {
                                                    const pass = e.target.value;
                                                    setForgotPassData({ ...forgotPassData, password: pass });
                                                }}
                                            />
                                        </div>
                                        <div className='input-cover'>
                                            <label className="input-label" htmlFor="forgot-confirm-password">Confirm Password</label>
                                            <input type="password" name="confirm-password" id='forgot-confirm-password' className='input-box outline-focus' placeholder='Confrom password' required onChange={e => setConfirmPass(e.target.value)} />
                                        </div>
                                        <button className='button' type='submit'>Save and Login</button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div key="signup" className='signup-box width-full flex-center flex-column'>
                        <form className='signup-form flex-center flex-column' onSubmit={handleSignup}>
                            <div className='input-cover'>
                                <label className="input-label" htmlFor="username">Username</label>
                                <input type="text" name="username" id='username' className='input-box outline-focus' placeholder='Enter your name' required onChange={e => setSignupData({ ...signupData, name: e.target.value })} />
                            </div>
                            <div className='input-cover'>
                                <label className="input-label" htmlFor="signup-email">Email</label>
                                <input type="email" name="email" id='signup-email' className='input-box outline-focus' placeholder='Enter your email' disabled={isOtpVerified} required onChange={e => setSignupData({ ...signupData, email: e.target.value })} />
                            </div>
                            <div className='input-cover'>
                                <label className="input-label" htmlFor="signup-otp">Enter OTP</label>
                                <div className='otp-box flex-center'>
                                    <input type="password" name="otp" id='signup-otp' className='input-box outline-focus otp-box' required placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        disabled={!isOtpSent || isOtpVerified}
                                    />
                                    {
                                        isOtpSent && (
                                            <button type="button" className='otp-verify outline-focus' disabled={isFpOtpVerified} onClick={verifyOtp} style={{
                                                backgroundColor: isOtpVerified ? "var(--message-success)" : "var(--primary)"
                                            }}>{isOtpVerified ? "Verified" : "Verify"}</button>
                                        )}
                                    <button type='button' className='otp-send outline-focus' disabled={isOtpVerified || resendTimer}
                                        onClick={(e) => {
                                            if (!resendTimer) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                sendOtp();
                                            } else {
                                                showToast("Please try after sometime", "normal")
                                            }
                                        }}
                                    >{!isOtpSent ? "Send OTP" : "Resend"}</button>
                                </div>

                            </div>
                            <div className='input-cover'>
                                <label className="input-label" htmlFor="signup-pass">Password</label>
                                <input type="password" name="password" id='signup-pass' className='input-box outline-focus' placeholder='Create a password' required
                                    onChange={(e) => {
                                        const pass = e.target.value;
                                        setCurrentPass(pass);
                                        setSignupData({ ...signupData, password: pass });
                                    }}
                                />
                            </div>
                            <div className='input-cover'>
                                <label className="input-label" htmlFor="signup-confirm-pass">Confirm Password</label>
                                <input type="password" name="confirm-password" id='signup-confirm-pass' className='input-box outline-focus' placeholder='Confrom password' required onChange={e => setConfirmPass(e.target.value)} />
                            </div>
                            <div className='input-cover flex width-full'>
                                <label className="agree-label" htmlFor="agree-to-terms">
                                    <input type='checkbox' id="agree-to-terms" name="agree-to-terms" onChange={(e) => setIsAgreed(e.target.checked)}/>
                                    Agree to our{" "}
                                    <a
                                        href="/privacy-policy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="terms-agree-pages">
                                        Privacy Policy
                                    </a>
                                    {" "}and{" "}
                                    <a
                                        href="/terms-of-service"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="terms-agree-pages">
                                        Terms of Service
                                    </a>
                                </label>
                            </div>
                            <button type="submit" className='signup-button width-full button outline-focus' disabled={loading || !isOtpVerified}>{loading ? "Signing you up..." : "Signup"}</button>
                        </form>
                        <div className='sign-up-text flex align-center justify-center'>
                            <p>Already have a account? </p>
                            <button className='sign-up-text-button cursor-pointer outline-focus' onClick={toggleSignup}>log in</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default Login;