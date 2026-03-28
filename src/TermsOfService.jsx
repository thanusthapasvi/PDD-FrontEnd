import BackIcon from "./assets/BackIcon";
import "./PP-TOS.css";

function TermsOfService() {
    return (
        <div className="legal-page">
            <BackIcon fallback="/" />
            <h1 className="legal-page-heading">Terms of Service</h1>
            <p className="legal-date">Last Updated: {new Date().toLocaleDateString()}</p>
            <hr />
            <div className="legal-page-content">
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using <strong>Interview Assist</strong>, you agree to be
                        bound by these <em>Terms of Service</em>. If you do not agree,
                        please discontinue use of the platform.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">2. Platform Purpose</h2>
                    <p>
                        <strong>Interview Assist</strong> is a community-driven platform that
                        allows alumni to share interview experiences for
                        informational and educational purposes only.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">3. User Responsibilities</h2>
                    <p>Users agree to:</p>
                    <ul className="legal-points">
                        <li>Provide accurate information</li>
                        <li>Not share false information</li>
                        <li>Not post confidential company data</li>
                        <li>Not engage in harassment or abusive behavior</li>
                        <li>Comply with applicable laws</li>
                    </ul>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">4. Intellectual Property</h2>
                    <p>
                        Users retain ownership of content they submit. However,
                        by submitting content, you grant Interview Assist a
                        non-exclusive right to display and distribute that
                        content on the platform.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">5. Account Suspension</h2>
                    <p>
                        We reserve the right to suspend or terminate accounts
                        that violate these terms without prior notice.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">6. Disclaimer</h2>
                    <p>
                        The platform does not guarantee job offers, interview
                        outcomes, or accuracy of user-submitted content.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">7. Limitation of Liability</h2>
                    <p>
                        <strong>Interview Assist</strong> shall not be liable for any direct,
                        indirect, incidental, or consequential damages arising
                        from the use of this platform.
                    </p>
                </div>
                <div className="legal-page-box">
                    <h2 className="legal-page-box-heading">8. Modifications</h2>
                    <p>
                        We may modify these Terms at any time. Continued use
                        of the platform indicates acceptance of updated terms.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TermsOfService;
