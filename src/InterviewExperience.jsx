import { useParams } from 'react-router-dom';
import BackIcon from './assets/BackIcon';
import './InterviewExperience.css';
import EditIcon from './assets/EditIcon';
import DeleteIcon from './assets/DeleteIcon';
import Bookmark from './assets/Bookmark';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "./config";

function InterviewExperience() {
    const navigate = useNavigate();
    const { id } = useParams();

    const allExperiences = JSON.parse(localStorage.getItem("experiences") || "{}");
    const experience = allExperiences[id];

    const session = JSON.parse(localStorage.getItem("session"));
    const user = session?.user;

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_URL}/delete_experience.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: experience.id, user_id: user.id })
            });

            const data = await res.json();

            if (data.status === "success") {
                setIsDeleteOpen(false);

                const updated = { ...allExperiences };
                delete updated[experience.id];
                localStorage.setItem("experiences", JSON.stringify(updated));

                navigate(-1);
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const [bookmarks, setBookmarks] = useState({});

    useEffect(() => {
        if (!user) return;

        fetch(`${API_URL}/check_bookmark.php?user_id=${user.id}&experience_id=${experience.id}`)
            .then(res => res.json())
            .then(data => {
                setBookmarks({
                    [experience.id]: data.bookmarked
                });
            })
            .catch(err => console.error(err));

    }, [experience.id, user]);

    const toggleBookmark = async (experienceId) => {

        const res = await fetch(`${API_URL}/toggle_bookmark.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id,
                experience_id: experienceId
            })
        });

        const data = await res.json();

        setBookmarks(prev => ({
            ...prev,
            [experienceId]: data.status === "added"
        }));
    };

    if (!experience) {
        return <p>Experience not found.</p>;
    }

    return (
        <div className="a-page interview-experience-page width-full flex-center flex-column">
            <BackIcon fallback='/home' />
            <div className='interview-experience-cover flex flex-column'>
                <div className='interview-experience-options flex align-center'>
                    <h1 className='interview-experience-title'>{experience.title}</h1>
                    {user && user.id === experience.user_id &&
                        <div className='option-buttons flex'>
                            <EditIcon onClick={() => navigate(`/edit-experience/${experience.id}`)} />
                            <DeleteIcon onClick={() => setIsDeleteOpen(true)} />
                        </div>
                    }
                    {user && user.id != experience.user_id && user.role != "admin" &&
                        <div className='option-buttons flex'>
                            <Bookmark
                                marked={bookmarks[experience.id]}
                                onClick={() => toggleBookmark(experience.id)}
                            />
                        </div>
                    }
                </div>
                <div className='interview-experience-head flex align-center'>
                    <img src={`/avatars/${experience.profile_pic}.png`} className="interview-experince-user-pic" alt="user profile" />
                    <div className='interview-experience-user flex flex-column'>
                        <span className='interview-experience-user-name'>{experience.name}</span>
                        <div className='interview-experience-meta flex align-center'>
                            <span className='interview-experience-hired-role'>{experience.hired_role}</span>
                            <span className='interview-experience-role'>{experience.role}</span>
                            <span className={`interview-experience-difficulty ${experience.difficulty}`}>{experience.difficulty}</span>
                        </div>
                        <div >
                            <span className='interview-experience-year'>{experience.created_at}</span>
                        </div>
                    </div>
                </div>
                <hr />
                <section className='interview-experince-section'>
                    <h3 className='interview-experince-section-heading'>Overview</h3>
                    <p>{experience.overview}</p>
                </section>

                <section className='interview-experince-section'>
                    <h3 className='interview-experince-section-heading'>Questions Asked</h3>
                    <ul>
                        {experience.questions_asked?.map((q, i) => (
                            <li key={i}>{q}</li>
                        ))}
                    </ul>
                </section>

                <section className='interview-experince-section'>
                    <h3 className='interview-experince-section-heading'>Preparation Tips</h3>
                    <ul>
                        {experience.preparation_tips?.map((tip, i) => (
                            <li key={i}>{tip}</li>
                        ))}
                    </ul>
                </section>

                <section className='interview-experince-section'>
                    <h3 className='interview-experince-section-heading'>Advice</h3>
                    <ul>
                        {experience.advice?.map((adv, i) => (
                            <li key={i}>{adv}</li>
                        ))}
                    </ul>
                </section>
            </div>

            {isDeleteOpen && (
                <div className="popup">
                    <div className='pop grad-border box-shadow-alert'>
                        <div className="delete-popup flex flex-column padding-md">
                            <h1 className='popup-head color-alert'>Delete Experience?</h1>
                            <div className='delete-box flex-center flex-column'>
                                <p>This action cannot be undone.</p>
                                <div className="flex-center" style={{ gap: "1.5rem", width: "100%" }}>
                                    <button
                                        className="button-alt outline-focus"
                                        onClick={() => setIsDeleteOpen(false)}>Cancel</button>

                                    <button
                                        className="button outline-focus"
                                        onClick={handleDelete}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InterviewExperience;