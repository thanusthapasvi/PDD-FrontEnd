import './CompanyPage.css';
import BackIcon from './assets/BackIcon';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Loader from './assets/Loader.jsx';
import { API_URL } from "./config";
import EditIcon from './assets/EditIcon';
import DeleteIcon from './assets/DeleteIcon';
import CopyCode from './assets/CopyCode.jsx';

import hljs from "highlight.js/lib/core";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/github-dark.css";
import { useToast } from "./ToastContext.jsx";

hljs.registerLanguage("java", java);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("python", python);


function CompanyPage() {
    const { id } = useParams();
    const showToast = useToast();
    const navigate = useNavigate();

    const companies = JSON.parse(localStorage.getItem("companies") || "[]");
    const company = companies.find(c => String(c.id) === id);

    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);

    const session = JSON.parse(localStorage.getItem("session"));
    const user = session?.user;

    const allExperiences = JSON.parse(localStorage.getItem("experiences") || "{}");

    const hasUserPosted = Object.values(allExperiences).some(
        exp =>
            exp.company_id?.toString() === id.toString() &&
            exp.user_id?.toString() === user.id.toString()
    );

    if (!company) {
        return (
            <div className='company-page'>
                <BackIcon />
                <h1>Company not found</h1>
            </div>
        );
    }

    useEffect(() => {
        fetch(`${API_URL}/get_experiences.php?company_id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setExperiences(data.experiences);

                    const existing = JSON.parse(localStorage.getItem("experiences") || "{}");

                    data.experiences.forEach(exp => {
                        existing[exp.id] = exp;
                    });

                    localStorage.setItem("experiences", JSON.stringify(existing));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching experiences:", err);
                setLoading(false);
            });
    }, [id]);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const handleDelete = async () => {
        if (!selectedExperience) return;
        try {
            const res = await fetch(`${API_URL}/delete_experience.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedExperience.id, user_id: user.id })
            });

            const data = await res.json();

            if (data.status === "success") {
                setIsDeleteOpen(false);

                const updated = { ...allExperiences };
                delete updated[selectedExperience.id];
                localStorage.setItem("experiences", JSON.stringify(updated));

                navigate(-1);
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const [faqs, setFaqs] = useState([]);
    const [faqLoading, setFaqLoading] = useState(true);
    const [selectedLang, setSelectedLang] = useState({});

    useEffect(() => {
        setFaqLoading(true);

        fetch(`${API_URL}/get_faqs.php?company_id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setFaqs(data.faqs);
                } else {
                    setFaqs([]);
                }
                setFaqLoading(false);
            })
            .catch(err => {
                console.error("FAQ fetch error:", err);
                setFaqs([]);
                setFaqLoading(false);
            });

    }, [id]);

    useEffect(() => {
        const defaults = {};
        faqs.forEach(faq => {
            if (faq.java) defaults[faq.id] = "java";
            else if (faq.cpp) defaults[faq.id] = "cpp";
            else if (faq.python) defaults[faq.id] = "python";
        });
        setSelectedLang(defaults);
    }, [faqs]);

    useEffect(() => {
        const blocks = document.querySelectorAll("pre code");
        blocks.forEach(block => {
            block.removeAttribute("data-highlighted");
            hljs.highlightElement(block);
        });
    }, [selectedLang, faqs]);

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
    };

    const [openDeleteCompany, setOpenDeleteCompany] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    const handleDeleteCompany = async () => {
        if (!company?.id) return;
        if (deleteConfirmText !== company.name) {
            // This shouldn't happen because button is disabled, but extra safety
            return;
        }

        try {
            const res = await fetch(`${API_URL}/delete_company.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company_id: company.id,
                    user_id: user?.id
                })
            });

            const data = await res.json();

            if (data.status === "success") {
                // Clean localStorage
                let companies = JSON.parse(localStorage.getItem("companies") || "[]");
                companies = companies.filter(c => String(c.id) !== String(company.id));
                localStorage.setItem("companies", JSON.stringify(companies));

                // Optional: clean experiences cache if you want
                let experiences = JSON.parse(localStorage.getItem("experiences") || "{}");
                Object.keys(experiences).forEach(key => {
                    if (experiences[key].company_id?.toString() === company.id.toString()) {
                        delete experiences[key];
                    }
                });
                localStorage.setItem("experiences", JSON.stringify(experiences));

                setOpenDeleteCompany(false);
                setDeleteConfirmText("");
                navigate("/home");
            } else {
                showToast(data.message || "Failed to delete company", "alert");
            }
        } catch (err) {
            console.error("Delete company error:", err);
            showToast("Network or server error", "alert");
        }
    };

    const [selectedFaq, setSelectedFaq] = useState(null);
    const [isFaqDeleteOpen, setIsFaqDeleteOpen] = useState(false);

    const handleDeleteFaq = async () => {
        if (!selectedFaq?.id) return;

        try {
            const res = await fetch(`${API_URL}/delete_faq.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    faq_id: selectedFaq.id,
                    user_id: user?.id   // for admin check
                })
            });

            const data = await res.json();

            if (data.status === "success") {
                // Remove from local state
                setFaqs(prev => prev.filter(f => f.id !== selectedFaq.id));

                // Optional: clean localStorage if you cache FAQs there
                // (most likely not needed since you fetch fresh)

                setIsFaqDeleteOpen(false);
                setSelectedFaq(null);

                showToast("FAQ deleted successfully", "success");
            } else {
                showToast(data.message || "Failed to delete FAQ", "alert");
            }
        } catch (err) {
            console.error("FAQ delete error:", err);
            showToast("Network or server error", "alert");
        }
    };

    return (
        <div className='a-page company-page flex flex-column width-full padding-md'>
            <BackIcon fallback='/home' />
            <div className='company-page-head flex align-center' style={{ justifyContent: "space-between" }}>
                <h1 className='company-name grad-text'>{company.name}</h1>
                {
                    user.role === "admin" && (
                        <div className='flex' style={{ gap: "1rem" }}>
                            <button className='button outline-focus'
                                onClick={() => navigate(`/new-company/edit/${company.id}`)}>Edit</button>
                            <button className='button outline-focus delete-btn'
                                onClick={() => setOpenDeleteCompany(true)}>Delete</button>
                        </div>
                    )
                }
            </div>
            <div className='company-page-tile company-info flex flex-column'>
                <div className='company-page-tile-head flex align-center'>
                    <h2 className='company-page-headers'>About Company</h2>
                </div>
                <hr className='grad-hr' />
                <div className='company-info-cover flex align-center'>
                    <div className='company-info-box flex flex-column'>
                        <p className='company-info-title'>About: <span className='company-info'>{company.info?.about}</span></p>
                        <p className='company-info-title'>Hiring Roles: <span className='company-info'>{company.hiring_roles.join(", ")}</span></p>
                        <p className='company-info-title'>Technical Roles: <span className='company-info'>{company.roles.join(", ")}</span></p>
                        <p className='company-info-title'>Package: <span className='company-info'>{company.info?.min_package} - {company.info?.max_package} LPA</span></p>
                        <p className='company-info-title'>Locations: <span className='company-info'>{company.locations?.join(", ")}</span></p>
                        <p className='company-info-title'>CEO: <span className='company-info'>{company.info?.ceo}</span></p>
                        <p className='company-info-title'>Website: <a href={company.info?.website} target="_blank" rel="noopener noreferrer" className='company-info'>{company.name}</a></p>
                    </div>
                    <div className='company-image-box position-relative'>
                        <img src={`/logos/${company.name}.png`} title="company logo"
                            onError={(e) => {
                                e.currentTarget.src = "/logos/placeholder.png";
                                e.currentTarget.onerror = null;
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className='company-page-tile company-exam-pattern flex flex-column'>
                <div className='company-page-tile-head flex align-center'>
                    <h2 className='company-page-headers'>Exam Pattern</h2>
                </div>
                <hr className='grad-hr' />
                <table className='exam-pattern'>
                    <thead>
                        <tr>
                            <th>Round</th>
                            <th>No. of questions</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody className='exam-pattern-body'>
                        {company.exam_pattern.map((examRound, index) => (
                            <tr key={index}>
                                <td>{examRound.round}</td>
                                <td>{examRound.questions}</td>
                                <td>{examRound.duration} mins</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='company-page-tile company-interview-experinces'>
                <div className='company-page-tile-head flex align-center'>
                    <h2 className='company-page-headers'>Interview Experinces</h2>
                    {
                        user.role === "alumni" &&
                        <button className='button outline-focus'
                            onClick={() => navigate(`/edit-experience/new/${id}`)}
                            disabled={hasUserPosted}
                        >New</button>
                    }
                </div>
                <hr className='grad-hr' />
                <div className='experience-box'>
                    {loading && <Loader />}
                    {!loading && experiences.length === 0 && (
                        <p style={{ color: "var(--text-2)" }}>No interview experiences yet.</p>
                    )}
                    {!loading && experiences.map(exp => (
                        <div key={exp.id} className='experience-card'>
                            <div className='experience-header'>
                                <div className='experience-user-info'>
                                    <img className='experience-user-pic' src={`/avatars/${exp.profile_pic}.png`} alt="profile icon" />
                                    <div className='experience-user'>
                                        <span className="experience-user-name">{exp.name}</span>
                                        <div className='experience-filters'>
                                            <span className='experience-role'>{exp.hired_role}</span>
                                            |
                                            <span className='experience-role'>{exp.role}</span>
                                            |
                                            <span className={`difficulty ${exp.difficulty}`}>{exp.difficulty}</span>
                                        </div>
                                    </div>
                                </div>
                                {user && user.id === exp.user_id &&
                                    <div className='interview-experience-options flex'>
                                        <EditIcon onClick={() => navigate(`/edit-experience/${exp.id}`)} />
                                        <DeleteIcon onClick={() => {
                                            setSelectedExperience(exp);
                                            setIsDeleteOpen(true);
                                        }} />
                                    </div>
                                }
                            </div>
                            <h3 className='experience-title'>{exp.title}..</h3>
                            <button
                                className='view-full-btn outline-focus'
                                onClick={() => navigate(`/experience/${exp.id}`)}>
                                View Full
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className='company-page-tile company-faqs'>
                <div className='company-page-tile-head flex align-center'>
                    <h2 className='company-page-headers'>Frequently Asked Questions</h2>
                    {
                        user.role === "admin" &&
                        <button className='button outline-focus'
                            onClick={() => navigate(`/new-faq/${company.id}`)}>New Faq</button>
                    }
                </div>
                <hr className='grad-hr' />
                {faqLoading && <Loader />}

                {!faqLoading && faqs.length === 0 && (
                    <p style={{ color: "var(--text-2)" }}>No FAQs available.</p>
                )}

                {!faqLoading && (
                    <div className='faqs-cover flex flex-column'>
                        {faqs.map(faq => (
                            <div key={faq.id} className="faq-card">
                                {
                                    user.role === "admin" &&
                                    <div className='faq-edit-delete flex'>
                                        <EditIcon onClick={() => navigate(`/new-faq/edit/${faq.id}`)} />
                                        <DeleteIcon onClick={() => {
                                            setSelectedFaq(faq);
                                            setIsFaqDeleteOpen(true);
                                        }} />
                                    </div>
                                }
                                <h3 className="faq-question"><span className='faqs-symbol-marks grad-text'>{`Q) `}</span>{faq.question}</h3>
                                <p className="faq-answer"><span className='faqs-symbol-marks grad-text'>{`A) `}</span>{faq.answer}</p>

                                {faq.is_code == 1 && (
                                    <div className="faq-code-section flex flex-column align-center">
                                        <div className='faq-code-slider flex'>
                                            {faq.java && (
                                                <p className={`faq-slider-titles ${selectedLang[faq.id] === "java" ? "active" : ""}`}
                                                    onClick={() => setSelectedLang(prev => ({ ...prev, [faq.id]: "java" }))}>Java</p>
                                            )}

                                            {faq.cpp && (
                                                <p className={`faq-slider-titles ${selectedLang[faq.id] === "cpp" ? "active" : ""}`}
                                                    onClick={() => setSelectedLang(prev => ({ ...prev, [faq.id]: "cpp" }))}>C++</p>
                                            )}

                                            {faq.python && (
                                                <p className={`faq-slider-titles ${selectedLang[faq.id] === "python" ? "active" : ""}`}
                                                    onClick={() => setSelectedLang(prev => ({ ...prev, [faq.id]: "python" }))}>Python</p>
                                            )}
                                        </div>
                                        <div className='faq-code-content'>
                                            <div className='faq-code'>
                                                <div className='faq-code-head flex align-center'>
                                                    <p>{selectedLang[faq.id] === "java" ? "Java" : selectedLang[faq.id] === "cpp" ? "C++" : "Python"}</p>
                                                    <div className='faq-code-copy'>
                                                        <CopyCode
                                                            onClick={() =>
                                                                copyCode(
                                                                    selectedLang[faq.id] === "java" ? faq.java : selectedLang[faq.id] === "cpp" ? faq.cpp : faq.python
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <pre><code className={`language-${selectedLang[faq.id]}`}>
                                                    {
                                                        selectedLang[faq.id] === "java"
                                                            ? faq.java
                                                            : selectedLang[faq.id] === "cpp"
                                                                ? faq.cpp
                                                                : faq.python
                                                    }
                                                </code></pre>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
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

            {isFaqDeleteOpen && selectedFaq && (
                <div className="popup box-shadow-alert">
                    <div className='pop grad-border'>
                        <div className="delete-popup flex flex-column padding-sm">
                            <h1 className='popup-head color-alert'>Delete FAQ?</h1>
                            <div className='delete-box flex-center flex-column' style={{ gap: '1rem' }}>
                                <p>
                                    This will <span className='delete-text-high'>permanently delete</span> the question:
                                    <br />
                                    <span className='delete-text-high'>"{selectedFaq.question.substring(0, 80)}{selectedFaq.question.length > 80 ? '...' : ''}"</span>
                                </p>
                                <p>This action cannot be undone.</p>

                                <div className="flex-center" style={{ gap: "2rem", width: "100%", marginTop: '1rem' }}>
                                    <button
                                        className="button-alt outline-focus"
                                        onClick={() => {
                                            setIsFaqDeleteOpen(false);
                                            setSelectedFaq(null);
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="button delete-btn outline-focus"
                                        onClick={handleDeleteFaq}>
                                        Delete FAQ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {openDeleteCompany && (
                <div className="popup box-shadow-alert">
                    <div className='pop grad-border'>
                        <div className="delete-popup flex flex-column padding-md">
                            <h1 className='popup-head color-alert'>Delete Company?</h1>
                            <div className='delete-box flex flex-column'>
                                <p>
                                    This will <span className='delete-text-high'>permanently delete</span> the company
                                    <span className='delete-text-high'> {company.name}</span> and <span className='delete-text-high'>all related interview experiences</span>.
                                    This action cannot be undone.
                                </p>
                                <div className='input-cover'>
                                    <label className='input-label'>To confirm, type the company name:</label>
                                    <input type="text"
                                        placeholder={`Type "${company.name}" to confirm`}
                                        className="input-box outline-focus"
                                        value={deleteConfirmText || ""}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="flex-center" style={{ gap: "1.5rem", width: "100%" }}>
                                    <button
                                        className="button-alt outline-focus"
                                        onClick={() => {
                                            setOpenDeleteCompany(false);
                                            setDeleteConfirmText("");
                                        }}>Cancel
                                    </button>
                                    <button
                                        className="button outline-focus"
                                        disabled={deleteConfirmText !== company.name}
                                        onClick={handleDeleteCompany}>
                                        Delete Company
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompanyPage;
