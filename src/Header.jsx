import './Header.css';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from "./ToastContext.jsx";
import Logo from "/logo.png";

function Header() {
    const navigate = useNavigate();
    const [isMenuOpen, openMenu] = useState(false);
    const menuRef = useRef(null);
    const toggleMenu = () => openMenu(prev => !prev);

    const showToast = useToast();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                openMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const session = JSON.parse(localStorage.getItem("session"));
    const user = session?.user;

    function logOut() {
        localStorage.clear();
        showToast("Logout successfull", "normal")
        navigate('/');
    }

    return (
        <header className='header position-fixed flex align-center padding-md width-full'>
            {/* <h1 className='header-title'>Interview Assist <span className='header-title-sub'>by Alumni</span></h1> */}
            <img src={Logo} name="Logo" className='main-logo' />
            <div className="profile-wrapper position-relative" ref={menuRef}>
                <button className='profile-icon outline-focus position-relative cursor-pointer' onClick={toggleMenu}>
                    <div className='profile-img-cover'>
                        <img src={`/avatars/${user.profile_pic}.png`} title='profile' className='profile-img' />
                    </div>
                </button>
                {isMenuOpen && (
                    <div className='profile-menu position-absolute shadow-soft flex flex-column justify-center'>
                        <button onClick={() => {
                            openMenu(false);
                            navigate('/profile');
                        }} className='profile-option menu-option outline-focus'>Profile</button>
                        {user.role != "admin" && (
                            <button onClick={() => {
                                openMenu(false);
                                navigate('/bookmarks');
                            }} className='bookmarks-option menu-option outline-focus'>Bookmarks</button>
                        )}
                        <button onClick={() => {
                            openMenu(false);
                            navigate('/settings');
                        }} className='settings-option menu-option outline-focus'>Settings</button>
                        <hr />
                        <button onClick={() => {
                            openMenu(false);
                            logOut();
                        }} className='logout-option menu-option outline-focus'>Logout</button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;