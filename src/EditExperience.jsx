import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditExperience.css";
import { API_URL } from "./config.js";
import BackIcon from "./assets/BackIcon.jsx";
import { useToast } from "./ToastContext.jsx";

function EditExperience() {
    const { companyId, expId } = useParams();
    const navigate = useNavigate();
    const showToast = useToast();

    const isEditMode = !!expId;

    const session = JSON.parse(localStorage.getItem("session"));
    const user = session?.user;

    const [title, setTitle] = useState("");
    const [overview, setOverview] = useState("");
    const [questions, setQuestions] = useState([""]);
    const [tips, setTips] = useState([""]);
    const [advice, setAdvice] = useState([""]);
    const [role, setRole] = useState("");
    const [hiredRole, setHiredRole] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");

    const allExperiences = JSON.parse(localStorage.getItem("experiences") || "{}");
    const companies = JSON.parse(localStorage.getItem("companies") || "[]");

    const currentCompanyId = isEditMode
        ? allExperiences[expId]?.company_id
        : companyId;

    const company = companies.find(
        c => String(c.id) === String(currentCompanyId)
    );
    const exp = allExperiences[expId];

    useEffect(() => {
        if (isEditMode && exp) {
            if (exp) {
                setTitle(exp.title || "");
                setOverview(exp.overview || "");
                setQuestions(exp.questions_asked?.length ? exp.questions_asked : [""]);
                setTips(exp.preparation_tips?.length ? exp.preparation_tips : [""]);
                setAdvice(exp.advice?.length ? exp.advice : [""]);
                setRole(exp.role || "");
                setHiredRole(exp.hired_role || "");
                setDifficulty(exp.difficulty || "Medium");
            }
        }
    }, [expId]);

    const addField = (setter, arr) => setter([...arr, ""]);
    const removeField = (setter, arr) => {
        if (arr.length > 1) setter(arr.slice(0, -1));
    };

    const handleArrayChange = (index, value, arr, setter) => {
        const updated = [...arr];
        updated[index] = value;
        setter(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            id: expId || null,
            user_id: user.id,
            company_id: currentCompanyId,
            title,
            overview,
            questions_asked: questions,
            preparation_tips: tips,
            advice,
            role,
            hired_role: hiredRole,
            difficulty
        };

        const response = await fetch(`${API_URL}/save_experience.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === "success") {
            const existing = JSON.parse(localStorage.getItem("experiences") || "{}");
            const newId = expId || result.insert_id;

            const updatedExperience = {
                id: newId,
                user_id: user.id,
                company_id: currentCompanyId,
                title,
                overview,
                questions_asked: questions,
                preparation_tips: tips,
                advice,
                role,
                hired_role: hiredRole,
                difficulty
            };

            // If edit → overwrite
            if (isEditMode) {
                existing[expId] = {
                    ...existing[expId],
                    ...updatedExperience
                };
            } else {
                existing[newId] = updatedExperience;
            }

            localStorage.setItem("experiences", JSON.stringify(existing));
            navigate(-1);
        } else {
            showToast(result.message, "alert");
        }
    };

    return (
        <div className="a-page edit-experience-page flex-center flex-column padding-md">
            <BackIcon fallback="/home" />
            <h1>{isEditMode ? "Edit Experience" : "Add Experience"}</h1>
            <div className="edit-experience-box flex-center flex-column">
                <form className="experience-form flex-center flex-column width-full" onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="input-cover flex flex-column width-full">
                        <p className="experience-sub-headings">Title</p>
                        <input type="text" className="input-box outline-focus" value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required />
                    </div>
                    <hr className="hr-experience" />
                    {/* Roles and difficulty */}
                    <div className="input-cover flex flex-column width-full">
                        <p className="experience-sub-headings">Difficulty</p>
                        <select className="input-select outline-focus" name="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
                            <option value="" className="input-select-option">--Select--</option>
                            <option value="easy" className="input-select-option">Easy</option>
                            <option value="easy-medium" className="input-select-option">Easy-Medium</option>
                            <option value="medium" className="input-select-option">Medium</option>
                            <option value="medium-hard" className="input-select-option">Medium-Hard</option>
                            <option value="hard" className="input-select-option">Hard</option>
                        </select>
                    </div>
                    <hr className="hr-experience" />
                    <div className="input-cover flex flex-column width-full">
                        <p className="experience-sub-headings">Tech Role</p>
                        <select className="input-select outline-focus" name="role" value={role} onChange={(e) => setRole(e.target.value)} required>
                            <option value="" className="input-select-option">--Select--</option>
                            {company?.roles?.map((r, index) => (
                                <option key={index} value={r} className="input-select-option">{r}</option>
                            ))}
                        </select>
                    </div>
                    <hr className="hr-experience" />
                    <div className="input-cover flex flex-column width-full">
                        <p className="experience-sub-headings">Hiring Role</p>
                        <select className="input-select outline-focus" name="hiring_role" value={hiredRole} onChange={(e) => setHiredRole(e.target.value)} required>
                            <option value="" className="input-select-option">--Select--</option>
                            {company?.hiring_roles?.map((r, index) => (
                                <option key={index} value={r} className="input-select-option">{r}</option>
                            ))}
                        </select>
                    </div>
                    <hr className="hr-experience" />
                    {/* Overview */}
                    <div className="input-cover flex flex-column width-full">
                        <p className="experience-sub-headings">Overview</p>
                        <textarea rows="5" className="input-box outline-focus" value={overview}
                            onChange={(e) => setOverview(e.target.value)}
                            required />
                    </div>
                    <hr className="hr-experience" />
                    {/* Questions */}
                    <div className="input-cover flex flex-column width-full">
                        <div className="label-with-options flex align-center">
                            <p className="experience-sub-headings">Questions Asked</p>
                            <div className="add-remove-point-buttons flex">
                                <button
                                    type="button"
                                    onClick={() => addField(setQuestions, questions)}
                                    className="add-point-btn outline-focus">+</button>
                                <button
                                    type="button"
                                    onClick={() => removeField(setQuestions, questions)}
                                    className="remove-point-btn outline-focus">-</button>
                            </div>
                        </div>
                        <div className="interview-experience-points" >
                            {questions.map((q, index) => (
                                <input key={index} type="text" className="input-box outline-focus"
                                    value={q}
                                    onChange={(e) =>
                                        handleArrayChange(index, e.target.value, questions, setQuestions)
                                    }
                                    required
                                />
                            ))}
                        </div>
                    </div>
                    <hr className="hr-experience" />
                    {/* Tips */}
                    <div className="input-cover flex flex-column width-full">
                        <div className="label-with-options flex align-center">
                            <p className="experience-sub-headings">Preparation Tips</p>
                            <div className="add-remove-point-buttons flex">
                                <button
                                    type="button"
                                    onClick={() => addField(setTips, tips)}
                                    className="add-point-btn outline-focus">+</button>
                                <button
                                    type="button"
                                    onClick={() => removeField(setTips, tips)}
                                    className="remove-point-btn outline-focus">-</button>
                            </div>
                        </div>
                        <div className="interview-experience-points" >
                            {tips.map((t, index) => (
                                <input key={index} type="text" className="input-box outline-focus"
                                    value={t}
                                    onChange={(e) =>
                                        handleArrayChange(index, e.target.value, tips, setTips)
                                    }
                                    required
                                />
                            ))}
                        </div>
                    </div>
                    <hr className="hr-experience" />
                    {/* Advice */}
                    <div className="input-cover flex flex-column width-full">
                        <div className="label-with-options flex align-center">
                            <p className="experience-sub-headings">General Advice</p>
                            <div className="add-remove-point-buttons flex">
                                <button
                                    type="button"
                                    onClick={() => addField(setAdvice, advice)}
                                    className="add-point-btn outline-focus" >+</button>
                                <button
                                    type="button"
                                    onClick={() => removeField(setAdvice, advice)}
                                    className="remove-point-btn outline-focus">-</button>
                            </div>
                        </div>

                        <div className="interview-experience-points" >
                            {advice.map((a, index) => (
                                <input key={index} type="text" className="input-box outline-focus"
                                    value={a}
                                    onChange={(e) =>
                                        handleArrayChange(index, e.target.value, advice, setAdvice)
                                    }
                                    required
                                />
                            ))}
                        </div>
                    </div>
                    <div className="edit-save flex align-center width-full">
                        <button
                            type="button"
                            className="button-alt outline-focus"
                            onClick={() => navigate(-1)}>Cancel</button>

                        <button
                            type="submit"
                            className="button outline-focus">
                            {isEditMode ? "Save Changes" : "Add Experience"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditExperience;