import './Bookmarks.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "./config";
import Loader from './assets/Loader.jsx';
import BackIcon from './assets/BackIcon.jsx';

function Bookmarks() {

    const navigate = useNavigate();

    const session = JSON.parse(localStorage.getItem("session"));
    const user = session?.user;

    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!user) return;

        fetch(`${API_URL}/get_bookmarks.php?user_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setBookmarks(data.bookmarks);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

    }, [user]);

    return (
        <div className='a-page bookmarks-page padding-md flex flex-column width-full '>
            <BackIcon fallback='/home' />
            <h1 className='bookmarks-title grad-text'>Your Bookmarks</h1>

            {loading && <Loader />}

            {!loading && bookmarks.length === 0 && (
                <p className='bookmarks-empty'>
                    You haven't bookmarked any interview experiences yet.
                </p>
            )}

            {!loading && bookmarks.length > 0 && (
                <div className='bookmarks-list'>
                    {bookmarks.map(exp => (
                        <div key={exp.id} className='bookmark-card' onClick={() => navigate(`/experience/${exp.id}`)}>
                            <div className='bookmark-experience-user-info'>
                                <img className='bookmark-experience-user-pic' src={`/avatars/${exp.profile_pic}.png`} alt="profile icon" />
                                <div className='bookmark-experience-user'>
                                    <h2 className="bookmark-experience-user-name">{exp.name}</h2>
                                    <div className='bookmark-experience-filters'>
                                        <span className='bookmark-experience-hired-role'>{exp.hired_role}</span>
                                        |
                                        <span className='bookmark-experience-role'>{exp.role}</span>
                                        |
                                        <span className={`bookmark-experience-difficulty ${exp.difficulty}`}>{exp.difficulty}</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className='experience-title'>{exp.title}..</h3>
                            <hr />
                            <p className='experience-company'>Applied for <span className='bookmark-experience-company' onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/company/${exp.company_id}`);
                            }}>
                                {exp.company_name}
                            </span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Bookmarks;