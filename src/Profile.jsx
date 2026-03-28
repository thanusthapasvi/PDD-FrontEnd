import './Profile.css';
import BackIcon from './assets/BackIcon';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from "./config";
import { useToast } from "./ToastContext.jsx";

function Profile() {
    const session = JSON.parse(localStorage.getItem("session"));
    const user = session?.user;

    const showToast = useToast();

    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    const [isAvatarsOpen, openAvatars] = useState(false);

    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "fresher",
        current_year: Number(user?.current_year || 0),
        profile_pic: Number(user?.profile_pic || 0)
    });

    const [tempAvatar, setTempAvatar] = useState(profile.profile_pic);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const saveProfile = async () => {
        const res = await fetch(`${API_URL}/update_profile.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: user.id,
                ...profile
            })
        });

        const data = await res.json();

        if (data.status === "success") {
            showToast("Profile updated", "normal")

            const session = JSON.parse(localStorage.getItem("session"));
            session.user = { ...session.user, ...profile };
            localStorage.setItem("session", JSON.stringify(session));

            setIsEditing(false);
        } else {
            showToast("Profile update failed", "alert")
        }
    };

    return (
        <div className='profile-container flex justify-center flex-column width-full padding-md'>
            <BackIcon />
            <div className='page-box-cover flex flex-column align-center justify-center width-full'>
                <div className='page-box flex flex-column align-center position-relative padding-sm'>
                    <div className='profile-header flex align-center width-full'>
                        <h1 className='profile-heading grad-text'>{isEditing ? "Edit Profile" : "Profile"}</h1>
                        {
                            !isEditing && (<button className='edit-profile-button button' onClick={() => { setIsEditing(true) }}>Edit</button>)
                        }
                    </div>
                    <div className='profil-pic-box flex align-center justify-center width-full'>
                        <div className='profile-pic-cover flex-center'>
                            {
                                <img src={`/avatars/${profile.profile_pic}.png`} alt="profile" className="profile-pic"
                                    onClick={() => {
                                        if (isEditing) {
                                            setTempAvatar(profile.profile_pic);
                                            openAvatars(true);
                                        }
                                    }}
                                />
                            }
                        </div>
                    </div>
                    <div className='profile-details flex flex-column align-start width-full'>
                        <div className='profile-detail-item flex flex-column'>
                            <span className='detail-label'>Name</span>
                            {
                                !isEditing ? (<span className='detail-value'>{user.name ?? "John Doe"}</span>) :
                                    (<input type='text' className='detail-edit user-name-edit' name="name" value={profile.name} onChange={handleChange} />)
                            }
                        </div>
                        <div className='profile-detail-item flex flex-column'>
                            <span className='detail-label'>Email</span>
                            {
                                !isEditing ? (<span className='detail-value'>{user.email ?? "johndoe@gmail.com"}</span>) :
                                    (<input type='email' className='detail-edit user-email-edit' name="email" value={profile.email} onChange={handleChange} />)
                            }
                        </div>
                        <div className='profile-detail-item flex flex-column'>
                            <span className='detail-label'>Role</span>
                            {
                                !isEditing ? (<span className='detail-value'>{user.role ?? "fresher"}</span>) :
                                    (<select className='detail-edit user-role-edit' name="role" value={profile.role} onChange={handleChange}>
                                        <option value="fresher">Fresher</option>
                                        <option value="alumni">Alumni</option>
                                    </select>)
                            }
                        </div>
                        {
                            user.role === "fresher" && (
                                <div className='profile-detail-item flex flex-column'>
                                    <span className='detail-label'>Current year</span>
                                    {
                                        !isEditing ? (<span className='detail-value'>{user.current_year ?? "fresher"}</span>) :
                                            (<select className='detail-edit user-current-year-edit' name="current_year" value={profile.current_year} onChange={handleChange}>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                            </select>)
                                    }
                                </div>
                            )
                        }
                        {isEditing && (
                            <div className='edit-save flex align-center width-full'>
                                <button className='cancel-edit-button button-alt outline-focus' onClick={() => {
                                    setProfile({
                                        name: user.name,
                                        email: user.email,
                                        role: user.role,
                                        current_year: user.current_year,
                                        profile_pic: user.profile_pic
                                    }); setIsEditing(false);
                                }}>Cancel</button>
                                <button className='save-profile-button button outline-focus' onClick={saveProfile}>Save</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {
                isAvatarsOpen && (
                    <div className='popup' >
                        <div className='pop grad-border align-center'>
                            <h2 className='popup-head'>Select a picture</h2>
                            <p className='pop-close' onClick={() => openAvatars(false)}>X</p>
                            <div className='avatars-pics flex align-center justify-center'>
                                {[...Array(10)].map((_, index) => {
                                    let avatarNum = index + 1;
                                    return (
                                        <img
                                            key={avatarNum}
                                            src={`/avatars/${avatarNum}.png`}
                                            alt={`avatar-${avatarNum}`}
                                            className={`avatars-img ${tempAvatar == avatarNum ? "selected" : ""}`}
                                            onClick={() => setTempAvatar(avatarNum)}
                                        />
                                    );
                                })}
                            </div>
                            <button className='button' onClick={() => {
                                setProfile({ ...profile, profile_pic: tempAvatar });
                                openAvatars(false);
                            }}>Save</button>
                        </div>
                    </div>)
            }
        </div>
    );
}

export default Profile;