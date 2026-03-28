import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import LoginPage from './login.jsx'
import HomePage from './Home.jsx'
import HeaderBar from './Header.jsx'
import ProfilePage from './Profile.jsx'
import SettingsPage from './Settings.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import { ToastProvider } from "./ToastContext";
import Footer from "./Footer.jsx";
import CompanyPage from './CompanyPage.jsx';
import InterviewExperience from './InterviewExperience.jsx';
import EditExperience from './EditExperience.jsx';
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";
import ScrollToTop from "./ScrollToTop";
import NewCompany from './NewCompany.jsx';
import Bookmarks from './Bookmarks.jsx';
import NewFaq from './NewFaq.jsx';


function App() {
    let theme = localStorage.getItem("userTheme");
    if(!theme) {
        theme = "dark";
        localStorage.setItem("userTheme", theme);
    }

    document.body.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("light", theme !== "dark");


    return (
        <>
            <Router>
                <ScrollToTop />
                <ToastProvider>
                    <AppContent />
                </ToastProvider>
            </Router>
        </>
    )
}

function AppContent() {
    const location = useLocation();
    const isLoginPage = location.pathname === "/";
    const isLegalPage = location.pathname === "/privacy-policy" || location.pathname === "/terms-of-service"
    const showHeader = !isLoginPage && !isLegalPage;

    return (
        <>
            {showHeader && <HeaderBar />}
            <main className={`width-full ${showHeader ? "main-with-header" : ""} ${isLoginPage ? "main-login-page" : ""}`}>
                <Routes>
                    <Route path='/' element={<LoginPage />} />
                    <Route path='/home' element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    } />
                    <Route path='/profile' element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    } />
                    <Route path='/settings' element={
                        <ProtectedRoute>
                            <SettingsPage />
                        </ProtectedRoute>
                    } />
                    <Route path='/company/:id' element={
                        <ProtectedRoute>
                            <CompanyPage />
                        </ProtectedRoute>
                    } />
                    <Route path='/experience/:id' element={
                        <ProtectedRoute>
                            <InterviewExperience />
                        </ProtectedRoute>
                    } />
                    <Route path='/edit-experience/:expId' element={
                        <ProtectedRoute>
                            <EditExperience />
                        </ProtectedRoute>
                    } />
                    <Route path='/edit-experience/new/:companyId' element={
                        <ProtectedRoute>
                            <EditExperience />
                        </ProtectedRoute>
                    } />
                    <Route path='/new-company' element={
                        <ProtectedRoute>
                            <NewCompany />
                        </ProtectedRoute>
                    } />
                    <Route path='/new-company/edit/:id' element={
                        <ProtectedRoute>
                            <NewCompany />
                        </ProtectedRoute>
                    } />
                    <Route path='/new-faq/:companyId' element={
                        <ProtectedRoute>
                            <NewFaq />
                        </ProtectedRoute>
                    } />
                    <Route path='/new-faq/edit/:id' element={
                        <ProtectedRoute>
                            <NewFaq />
                        </ProtectedRoute>
                    } />
                    <Route path='/bookmarks' element={
                        <ProtectedRoute>
                            <Bookmarks />
                        </ProtectedRoute>
                    } />
                    <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                    <Route path='/terms-of-service' element={<TermsOfService />} />
                </Routes>
            </main>
            {!isLoginPage && <Footer />}
        </>
    )
}

export default App
