import BackIcon from './assets/BackIcon';
import './NewCompany.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from "./config";
import { useToast } from "./ToastContext.jsx";

function NewCompany() {
    const { id } = useParams();
    const navigate = useNavigate();
    const showToast = useToast();

    const isEdit = Boolean(id);

    const [name, setName] = useState("");
    const [about, setAbout] = useState("");
    const [hiringRoles, setHiringRoles] = useState("");
    const [technicalRoles, setTechnicalRoles] = useState("");
    const [min_package, setMinPackage] = useState("");
    const [max_package, setMaxPackage] = useState("");
    const [locations, setLocations] = useState("");
    const [website, setWebsite] = useState("");
    const [ceo, setCEO] = useState("");
    const [important, setImportant] = useState("");

    const [examPattern, setExamPattern] = useState([
        { round: "", questions: "", duration: "" }
    ]);

    useEffect(() => {
        if (!isEdit) return;

        const companies = JSON.parse(localStorage.getItem("companies") || "[]");
        const company = companies.find(c => String(c.id) === id);

        if (!company) return;

        setName(company.name || "");
        setAbout(company.info?.about || "");
        setHiringRoles(company.hiring_roles?.join(", ") || "");
        setTechnicalRoles(company.roles?.join(", ") || "");
        setMinPackage(company.info?.min_package ?? "");
        setMaxPackage(company.info?.max_package ?? "");
        setLocations(company.locations?.join(", ") || "");
        setWebsite(company.info?.website || "");
        setCEO(company.info?.ceo || "");
        setImportant(company.info?.important || "");
        setExamPattern(
            company.exam_pattern?.length > 0
                ? company.exam_pattern
                : [{ round: "", questions: "", duration: "" }]
        );

    }, [id, isEdit]);

    // Exam Pattern Handlers
    const addExamRow = () => {
        setExamPattern(prev => [...prev, { round: "", questions: "", duration: "" }]);
    };

    const removeExamRow = (index) => {
        if (examPattern.length === 1) return;
        setExamPattern(prev => prev.filter((_, i) => i !== index));
    };

    const updateExamRow = (index, field, value) => {
        setExamPattern(prev => {
            const newRows = [...prev];
            newRows[index] = { ...newRows[index], [field]: value };
            return newRows;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            id: isEdit ? id : null,
            name,
            hiring_roles: hiringRoles.split(",").map(r => r.trim()).filter(Boolean),
            roles: technicalRoles.split(",").map(r => r.trim()).filter(Boolean),
            locations: locations.split(",").map(l => l.trim()).filter(Boolean),
            exam_pattern: examPattern,
            info: {
                about,
                min_package: min_package ? Number(min_package) : null,
                max_package: max_package ? Number(max_package) : null,
                website,
                ceo,
                important
            }
        };

        try {
            const res = await fetch(`${API_URL}/save_company.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.status === "success") {
                const companies = JSON.parse(localStorage.getItem("companies") || "[]");

                const companyData = {
                    id: isEdit ? id : data.company_id,
                    name,
                    hiring_roles: payload.hiring_roles,
                    roles: payload.roles,
                    locations: payload.locations,
                    exam_pattern: payload.exam_pattern,
                    info: payload.info
                };

                if (isEdit) {
                    const index = companies.findIndex(c => String(c.id) === id);
                    if (index !== -1) {
                        companies[index] = companyData;
                    }
                } else {
                    companies.push(companyData);
                }

                localStorage.setItem("companies", JSON.stringify(companies));

                showToast("Company saved successfully", "success");
                navigate(-1);
            } else {
                showToast(
                    data.message || "Failed to save company",
                    "alert"
                );
            }
        } catch (err) {
            console.error("Save error:", err);
            showToast("Network or server error", "alert");
        }
    };

    return (
        <div className='a-page new-company-page padding-md'>
            <BackIcon fallback='/home' />

            <div className='page-box-cover new-company-section-cover flex-center flex-column width-full padding-md'>
                <div className='page-box new-company-box flex flex-column align-center position-relative padding-md'>
                    <div className='new-company-header'>
                        <h1 className='new-company-page-title grad-text'>
                            {isEdit ? "Edit Company" : "Add a New Company"}
                        </h1>
                    </div>

                    <form className='new-company-form flex flex-column gap-sm width-full' onSubmit={handleSubmit}>
                        {/* About Company */}
                        <div className='new-company-section flex flex-column width-full'>
                            <h2 className='new-company-section-title'>About Company</h2>

                            <div className='input-cover'>
                                <label className='input-label' htmlFor="company-name">Company Name</label>
                                <input
                                    type="text"
                                    id="company-name"
                                    placeholder="Eg: TCS"
                                    className='input-box outline-focus'
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='input-cover'>
                                <label className='input-label' htmlFor="about">About</label>
                                <input
                                    type="text"
                                    id="about"
                                    placeholder="Eg: A leading technology company..."
                                    className='input-box outline-focus'
                                    value={about}
                                    onChange={e => setAbout(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='input-cover'>
                                <label className='input-label' htmlFor="hiring-roles">Hiring roles</label>
                                <input
                                    type="text"
                                    id="hiring-roles"
                                    placeholder="Eg: GenC, GenC Elevate, GenC Next"
                                    className='input-box outline-focus'
                                    value={hiringRoles}
                                    onChange={e => setHiringRoles(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='input-cover'>
                                <label className='input-label' htmlFor="technical-roles">Technical roles</label>
                                <input
                                    type="text"
                                    id="technical-roles"
                                    placeholder="Eg: SDE, System Engineer"
                                    className='input-box outline-focus'
                                    value={technicalRoles}
                                    onChange={e => setTechnicalRoles(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='input-cover'>
                                <label className='input-label' htmlFor="locations">Locations</label>
                                <input
                                    type="text"
                                    id="locations"
                                    placeholder="Eg: Chennai, Hyderabad"
                                    className='input-box outline-focus'
                                    value={locations}
                                    onChange={e => setLocations(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='flex align-center' style={{ justifyContent: 'space-between', gap: '1rem' }}>
                                <div className='flex flex-column flex-1'>
                                    <label className='input-label' htmlFor="min-package">Min Package (LPA)</label>
                                    <input
                                        type="number"
                                        id="min-package"
                                        placeholder="Eg: 4"
                                        className='input-box outline-focus'
                                        value={min_package}
                                        onChange={e => setMinPackage(e.target.value)}
                                        required
                                        min="2"
                                        step="0.1"
                                    />
                                </div>
                                <div className='flex flex-column flex-1'>
                                    <label className='input-label' htmlFor="max-package">Max Package (LPA)</label>
                                    <input
                                        type="number"
                                        id="max-package"
                                        placeholder="Eg: 9"
                                        className='input-box outline-focus'
                                        value={max_package}
                                        onChange={e => setMaxPackage(e.target.value)}
                                        required
                                        min="3"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div className='input-cover'>
                                <label className='input-label' htmlFor="website">Website</label>
                                <input
                                    type="url"
                                    id="website"
                                    placeholder="Eg: https://www.example.com"
                                    className='input-box outline-focus'
                                    value={website}
                                    onChange={e => setWebsite(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='input-cover'>
                                <label className='input-label' htmlFor="ceo">CEO</label>
                                <input
                                    type="text"
                                    id="ceo"
                                    placeholder="Eg: Ravi Kumar"
                                    className='input-box outline-focus'
                                    value={ceo}
                                    onChange={e => setCEO(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='input-cover'>
                                <label className='input-label' htmlFor="important">Important</label>
                                <input
                                    type="text"
                                    id="important"
                                    placeholder="Eg: Known for digital transformation..."
                                    className='input-box outline-focus'
                                    value={important}
                                    onChange={e => setImportant(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Exam Pattern */}
                        <div className='new-company-section flex flex-column width-full'>
                            <div className='new-company-section-head flex align-center justify-between'>
                                <h2 className='new-company-section-title'>Exam Pattern</h2>
                                <div className="add-remove-point-buttons flex gap-xs">
                                    <button
                                        type="button"
                                        onClick={addExamRow}
                                        className="add-point-btn outline-focus">
                                        +
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeExamRow(examPattern.length - 1)}
                                        disabled={examPattern.length <= 1}
                                        className="remove-point-btn outline-focus">
                                        −
                                    </button>
                                </div>
                            </div>

                            <table className='exam-pattern width-full'>
                                <thead>
                                    <tr>
                                        <th>Round</th>
                                        <th>No. of questions</th>
                                        <th>Duration (min)</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {examPattern.map((row, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="text"
                                                    placeholder="Eg: Communication Round"
                                                    className='input-box outline-focus'
                                                    value={row.round}
                                                    onChange={e => updateExamRow(index, "round", e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    placeholder="Eg: 20"
                                                    className='input-box outline-focus'
                                                    value={row.questions}
                                                    onChange={e => updateExamRow(index, "questions", e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    placeholder="Eg: 60"
                                                    className='input-box outline-focus'
                                                    value={row.duration}
                                                    onChange={e => updateExamRow(index, "duration", Number(e.target.value))}
                                                    required
                                                    min="1"
                                                />
                                            </td>
                                            <td>
                                                {examPattern.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="remove-row-btn"
                                                        onClick={() => removeExamRow(index)}>
                                                        ×
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className='new-company-image'>Add a image in /logos with name like <code>{`${name || 'company'}.png`}</code></p>
                        <button type='submit' className='button primary margin-top-md'>
                            {isEdit ? "Save Changes" : "Add Company"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default NewCompany;