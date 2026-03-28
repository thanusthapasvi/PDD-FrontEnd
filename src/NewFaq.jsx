import './NewFaq.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "./ToastContext";
import BackIcon from './assets/BackIcon';
import { API_URL } from "./config";

function NewFaq() {
    const { companyId, id } = useParams();
    const navigate = useNavigate();
    const showToast = useToast();

    const isEdit = Boolean(id);
    const isCreateForCompany = Boolean(companyId && !id);

    // ─── Single FAQ fields (used in edit mode) ───
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [isCode, setIsCode] = useState(false);
    const [java, setJava] = useState("");
    const [cpp, setCpp] = useState("");
    const [python, setPython] = useState("");

    // ─── Multiple FAQs (used only in create mode) ───
    const [faqs, setFaqs] = useState([]);

    // Initialize one empty FAQ when creating new
    useEffect(() => {
        if (isCreateForCompany && faqs.length === 0) {
            setFaqs([{
                question: "",
                answer: "",
                is_code: false,
                java: "",
                cpp: "",
                python: ""
            }]);
        }
    }, [isCreateForCompany]);

    // Load existing FAQ when editing
    useEffect(() => {
        if (!isEdit) return;

        const fetchFaq = async () => {
            try {
                const res = await fetch(`${API_URL}/get_faq.php?id=${id}`);
                const data = await res.json();

                if (data.status === "success" && data.faq) {
                    const f = data.faq;
                    setQuestion(f.question || "");
                    setAnswer(f.answer || "");
                    setIsCode(!!f.is_code);
                    setJava(f.java || "");
                    setCpp(f.cpp || "");
                    setPython(f.python || "");
                } else {
                    showToast("FAQ not found", "alert");
                    navigate(-1);
                }
            } catch (err) {
                console.error(err);
                showToast("Error loading FAQ", "alert");
            }
        };

        fetchFaq();
    }, [id, isEdit, navigate, showToast]);

    // ─── Create mode handlers ───
    const addFaq = () => {
        setFaqs(prev => [
            ...prev,
            { question: "", answer: "", is_code: false, java: "", cpp: "", python: "" }
        ]);
    };

    const removeFaq = (index) => {
        // Prevent removing the last one
        if (faqs.length <= 1) {
            showToast("You must keep at least one FAQ", "alert");
            return;
        }
        setFaqs(prev => prev.filter((_, i) => i !== index));
    };

    const updateFaq = (index, field, value) => {
        setFaqs(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const toggleFaqCode = (index) => {
        setFaqs(prev => {
            const updated = [...prev];
            const faq = updated[index];
            updated[index] = {
                ...faq,
                is_code: !faq.is_code,
                java: !faq.is_code ? faq.java : "",
                cpp: !faq.is_code ? faq.cpp : "",
                python: !faq.is_code ? faq.python : ""
            };

            return updated;

        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEdit) {
            // ─── EDIT SINGLE FAQ ───
            if (!question.trim() || !answer.trim()) {
                showToast("Question and answer are required", "alert");
                return;
            }
            if (isCode && (!java.trim() || !cpp.trim() || !python.trim())) {
                showToast("All code fields are required when code is enabled", "alert");
                return;
            }

            const payload = {
                id,
                question,
                answer,
                is_code: isCode ? 1 : 0,
                java: isCode ? java : null,
                cpp: isCode ? cpp : null,
                python: isCode ? python : null
            };

            try {
                const res = await fetch(`${API_URL}/save_faq.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.status === "success") {
                    showToast("FAQ updated successfully", "success");
                    navigate(-1);
                } else {
                    showToast(data.message || "Failed to update FAQ", "alert");
                }
            } catch (err) {
                showToast("Network error", "alert");
            }
        } else if (isCreateForCompany) {
            // ─── CREATE MULTIPLE FAQs ───
            if (faqs.length === 0) {
                showToast("Add at least one FAQ", "alert");
                return;
            }

            const hasInvalid = faqs.some(f =>
                !f.question?.trim() || !f.answer?.trim() ||
                (f.is_code && (!f.java?.trim() || !f.cpp?.trim() || !f.python?.trim()))
            );

            if (hasInvalid) {
                showToast("All questions, answers, and code fields (when enabled) are required", "alert");
                return;
            }

            const payload = {
                company_id: companyId,
                faqs: faqs.map(f => ({
                    question: f.question,
                    answer: f.answer,
                    is_code: f.is_code ? 1 : 0,
                    java: f.is_code ? f.java : null,
                    cpp: f.is_code ? f.cpp : null,
                    python: f.is_code ? f.python : null
                }))
            };

            try {
                const res = await fetch(`${API_URL}/save_faq.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.status === "success") {
                    showToast(`Added ${faqs.length} FAQ(s) successfully`, "success");
                    navigate(`/company/${companyId}`);
                } else {
                    showToast(data.message || "Failed to save FAQs", "alert");
                }
            } catch (err) {
                showToast("Network error", "alert");
            }
        }
    };

    return (
        <div className='a-page new-faq-page padding-md'>
            <BackIcon fallback='/home' />

            <div className='page-box-cover new-faq-section-cover flex-center flex-column width-full padding-md'>
                <div className='page-box new-faq-box flex flex-column align-center position-relative padding-md'>
                    <h1 className='new-faq-page-title grad-text'>{isEdit ? "Edit FAQ" : "Add New FAQ(s)"}</h1>

                    <form className='new-faq-form flex flex-column gap-md width-full' onSubmit={handleSubmit}>
                        {isEdit ? (
                            // ─── EDIT MODE ───
                            <div className='faq-block padding-md border-radius-md'>
                                <h3 className='faq-title'>Edit FAQ</h3>
                                <div className='input-cover'>
                                    <label className='input-label'>Question</label>
                                    <input
                                        type="text"
                                        placeholder="Eg: How to reverse a string?"
                                        className='input-box outline-focus'
                                        value={question}
                                        onChange={e => setQuestion(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='input-cover'>
                                    <label className='input-label'>Answer</label>
                                    <textarea
                                        placeholder="Explain here..."
                                        className='input-box outline-focus'
                                        rows={3}
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className='input-cover flex align-center'>
                                    <label htmlFor="is-code-edit" className='input-label is-code-label'>
                                        <input type="checkbox" id="is-code-edit"
                                            checked={isCode}
                                            className='faq-is-codes'
                                            onChange={() => {
                                                setIsCode(prev => {
                                                    if (prev) {
                                                        setJava("");
                                                        setCpp("");
                                                        setPython("");
                                                    }
                                                    return !prev;
                                                });
                                            }}
                                        />
                                        Is Code available?
                                    </label>
                                </div>

                                {isCode && (
                                    <>
                                        <div className='input-cover'>
                                            <label className='input-label'>Java Code</label>
                                            <textarea
                                                placeholder="Java solution..."
                                                className='input-box outline-focus font-mono'
                                                rows={8}
                                                value={java}
                                                onChange={e => setJava(e.target.value)}
                                                required={isCode}
                                            />
                                        </div>
                                        <div className='input-cover'>
                                            <label className='input-label'>C++ Code</label>
                                            <textarea
                                                placeholder="C++ solution..."
                                                className='input-box outline-focus font-mono'
                                                rows={8}
                                                value={cpp}
                                                onChange={e => setCpp(e.target.value)}
                                                required={isCode}
                                            />
                                        </div>
                                        <div className='input-cover'>
                                            <label className='input-label'>Python Code</label>
                                            <textarea
                                                placeholder="Python solution..."
                                                className='input-box outline-focus font-mono'
                                                rows={8}
                                                value={python}
                                                onChange={e => setPython(e.target.value)}
                                                required={isCode}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            // ─── CREATE MODE ─── (starts with 1 FAQ)
                            <>
                                <div className='new-faq-section-head flex align-center justify-between'>
                                    <h2 className='new-company-section-title'>FAQs for Company</h2>
                                    <div className="add-remove-point-buttons flex gap-xs">
                                        <button type="button" onClick={addFaq} className="add-point-btn outline-focus">+</button>
                                        <button
                                            type="button"
                                            onClick={() => removeFaq(faqs.length - 1)}
                                            disabled={faqs.length <= 1}
                                            className="remove-point-btn outline-focus">−</button>
                                    </div>
                                </div>
                                {faqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className='faq-block border-radius-md padding-md margin-bottom-md'>
                                        <div className='flex align-center margin-bottom-sm' style={{ justifyContent: "space-between" }}>
                                            <h3 className='faq-title'>FAQ #{index + 1}</h3>
                                            {faqs.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="remove-row-btn"
                                                    onClick={() => removeFaq(index)}>
                                                    ×
                                                </button>
                                            )}
                                        </div>

                                        <div className='input-cover'>
                                            <label className='input-label'>Question</label>
                                            <input
                                                type="text"
                                                placeholder="Eg: How to reverse a string?"
                                                className='input-box outline-focus'
                                                value={faq.question}
                                                onChange={e => updateFaq(index, "question", e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className='input-cover'>
                                            <label className='input-label'>Answer</label>
                                            <textarea
                                                placeholder="Explain here..."
                                                className='input-box outline-focus'
                                                rows={4}
                                                value={faq.answer}
                                                onChange={e => updateFaq(index, "answer", e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className='input-cover flex align-center gap-md'>
                                            <label className="input-label is-code-label">
                                                <input
                                                    type="checkbox"
                                                    className="faq-is-codes"
                                                    checked={faq.is_code}
                                                    onChange={() => toggleFaqCode(index)}
                                                />
                                                Is Code available?
                                            </label>
                                        </div>

                                        {faq.is_code && (
                                            <>
                                                <div className='input-cover'>
                                                    <label className='input-label'>Java Code</label>
                                                    <textarea
                                                        placeholder="Java solution..."
                                                        className='input-box outline-focus font-mono'
                                                        rows={8}
                                                        value={faq.java}
                                                        onChange={e => updateFaq(index, "java", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className='input-cover'>
                                                    <label className='input-label'>C++ Code</label>
                                                    <textarea
                                                        placeholder="C++ solution..."
                                                        className='input-box outline-focus font-mono'
                                                        rows={8}
                                                        value={faq.cpp}
                                                        onChange={e => updateFaq(index, "cpp", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className='input-cover'>
                                                    <label className='input-label'>Python Code</label>
                                                    <textarea
                                                        placeholder="Python solution..."
                                                        className='input-box outline-focus font-mono'
                                                        rows={8}
                                                        value={faq.python}
                                                        onChange={e => updateFaq(index, "python", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                        <button type="submit" className='button primary margin-top-lg'>
                            {isEdit ? "Update FAQ" : `Save ${faqs.length} FAQ${faqs.length !== 1 ? 's' : ''}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default NewFaq;