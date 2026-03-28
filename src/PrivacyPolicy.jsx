import BackIcon from "./assets/BackIcon";
import "./PP-TOS.css";

function PrivacyPolicy() {
    return (
        <div className="legal-page">
            <BackIcon fallback="/settings" />
            <h1 className="legal-page-heading">Privacy Policy</h1>
            <p className="legal-date">Last Updated: {new Date().toLocaleDateString()}</p>
            <hr />
            <div className="legal-page-content">
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">1. Introduction</h2>
                    <p>
                        <strong>Interview Assist</strong> ("we", "our", "us") values your privacy.
                        This Privacy Policy explains how we collect, use, and
                        protect your information when you use our platform.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">2. Information We Collect</h2>
                    <p>
                        We collect information you provide during registration,
                        which includees your name and email address.
                        We also collect interview experiences and related content
                        that aree voluntarily submitted by Alumni.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">3. How We Use Your Information</h2>
                    <p>
                        Your information is used to:
                    </p>
                    <ul className="legal-points">
                        <li>Provide and maintain your account</li>
                        <li>Display interview experiences publicly</li>
                        <li>Improve platform functionality</li>
                        <li>Ensure platform security</li>
                    </ul>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">4. Public Content</h2>
                    <p>
                        Interview experiences submitted by users are publicly
                        visible to other users. Username and profile picture will also be visible publicly. 
                        Please do not share sensitive information, confidential
                        or proprietary company information.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">5. Data Storage & Security</h2>
                    <p>
                        We implement reasonable security measures to protect
                        your data. However, no system is 100% secure, and we
                        cannot guarantee absolute protection.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">6. Account Deletion</h2>
                    <p>
                        You may delete your account at any time from the Settings
                        page. Once deleted, your personal information will be
                        permanently removed from our system.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">7. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy periodically. Continued
                        use of the platform after updates constitutes acceptance
                        of the revised policy.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">8. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy,
                        please contact us through the platform.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
