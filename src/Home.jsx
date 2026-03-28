import './Home.css';
import FilterIcon from './assets/FilterIcon.jsx';
import SearchIcon from './assets/SearchIcon.jsx';
import { API_URL } from "./config";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from './assets/Loader.jsx';

function Home() {
    const session = JSON.parse(localStorage.getItem("session"));
    const user = session?.user;

    const navigate = useNavigate();

    const [isFiltersOpen, openFilterPop] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // TEMP filters (inside popup)
    const [tempSelectedRoles, setTempSelectedRoles] = useState([]);
    const [tempPackageRange, setTempPackageRange] = useState({
        min: null,
        max: null
    });

    // APPLIED filters (used for actual filtering)
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [packageRange, setPackageRange] = useState({
        min: null,
        max: null
    });

    // Fetch companies
    useEffect(() => {
        const savedCompanies = localStorage.getItem("companies");

        if (savedCompanies) {
            const parsed = JSON.parse(savedCompanies);
            setCompanies(parsed);
            setLoading(false);
            return;
        }

        setLoading(true);

        fetch(`${API_URL}/get_companies.php`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    localStorage.setItem("companies", JSON.stringify(data.companies));
                    setCompanies(data.companies);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching companies:", err);
                setLoading(false);
            });

    }, []);

    // When companies load, derive unique min/max packages
    useEffect(() => {
        if (companies.length === 0) return;

        const mins = [...new Set(
            companies.map(c => c.info?.min_package).filter(Boolean)
        )].sort((a, b) => a - b);

        const maxs = [...new Set(
            companies.map(c => c.info?.max_package).filter(Boolean)
        )].sort((a, b) => a - b);

        const initialMin = mins[0];
        const initialMax = maxs[maxs.length - 1];

        setTempPackageRange({ min: initialMin, max: initialMax });
        setPackageRange({ min: initialMin, max: initialMax });

    }, [companies]);

    // Unique roles
    const allRoles = [...new Set(
        companies.flatMap(company => company.roles || [])
    )];

    // Unique package steps
    const uniqueMinPackages = [...new Set(
        companies.map(c => c.info?.min_package).filter(Boolean)
    )].sort((a, b) => a - b);

    const uniqueMaxPackages = [...new Set(
        companies.map(c => c.info?.max_package).filter(Boolean)
    )].sort((a, b) => a - b);

    // Toggle role in TEMP state
    const toggleTempRole = (role) => {
        setTempSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    // Apply filters
    const applyFilters = () => {
        setSelectedRoles(tempSelectedRoles);
        setPackageRange(tempPackageRange);
        openFilterPop(false);
    };

    // Clear filters
    const clearFilters = () => {
        setTempSelectedRoles([]);
        setTempPackageRange({ min: null, max: null });

        setSelectedRoles([]);
        setPackageRange({ min: null, max: null });

        openFilterPop(false);
    };

    // Final filtered companies
    const filteredCompanies = companies.filter(company => {
        const matchesSearch =
            company.name.toLowerCase().includes(search.toLowerCase());

        const matchesRole =
            selectedRoles.length === 0 ||
            company.roles.some(role => selectedRoles.includes(role));

        const matchesPackage =
            (!packageRange.min || company.info?.min_package >= packageRange.min) ||
            (!packageRange.max || company.info?.max_package <= packageRange.max);

        return matchesSearch && matchesRole && matchesPackage;
    });

    return (
        <div className='home-container flex flex-column width-full'>
            {loading && <Loader />}
            <div className='home-page-welcome width-full padding-md flex-center flex-column'>
                <h1 className='home-page-welcome-heading'>Welcome, <span className='user-name'>{user.name}</span></h1>
                {
                    user.role != "admin" &&
                    <h3 className='home-page-welcome-sub'>Select a company to view all resources</h3>
                }
                <div className='search-bar position-relative flex-center'>
                    <div className='search-covers flex-center shadow-soft'>
                        <button
                            className='filter-button flex-center cursor-pointer outline-focus'
                            onClick={() => openFilterPop(true)}
                        >
                            <FilterIcon />
                        </button>
                    </div>

                    <div className='search-covers flex-center shadow-soft'>
                        <input
                            type='search'
                            className='input-box search-input width-full outline-focus'
                            placeholder='Search by companies...'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className='search-covers flex-center shadow-soft search-icon'>
                        <button className='search-button flex-center outline-focus cursor-pointer'>
                            <SearchIcon />
                        </button>
                    </div>
                </div>
            </div>

            <div className='company-container width-full flex flex-column'>
                <div className='companies-header flex align-center'>
                    {
                        user.role != "admin" &&
                        <h2 className='company-container-heading'>Browse by Company</h2>
                    }
                    {
                        user.role === "admin" &&
                        <button className='button outline-focus'
                            onClick={() => navigate(`/new-company`)}>New Company</button>
                    }
                </div>

                <div className='company-tiles width-full flex'>
                    {filteredCompanies.length === 0 ? (
                        <p className="no-results">
                            No results found for "{search}"
                        </p>
                    ) : (
                        filteredCompanies.map(company => (
                            <div className='company-tile' key={company.id} onClick={() => navigate(`/company/${company.id}`)}>
                                <div className='company-image-cover'>
                                    <img
                                        src={`/logos/${company.name}.png`}
                                        alt={`${company.name} logo`}
                                        className='company-image'
                                        onError={(e) => {
                                            e.currentTarget.src = "/logos/placeholder.png";
                                            e.currentTarget.onerror = null; 
                                        }}
                                    />
                                </div>

                                <h2 className='company-names'>{company.name}</h2>

                                <div className='company-roles'>
                                    {company.roles.map((role, index) => (
                                        <p className='company-role-name' key={index}>
                                            {role}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isFiltersOpen && (
                <div className='popup position-fixed width-full height-full padding-md flex-center'>
                    <div className='pop position-relative flex flex-column padding-sm grad-border'>

                        <div className='popup-head flex align-center padding-sm'>
                            <h2>Filters</h2>
                            <p className='pop-close cursor-pointer'
                                onClick={() => openFilterPop(false)}>X</p>
                        </div>

                        <div className='filters-cover flex flex-column'>

                            <label className='filter-heading'>Roles:</label>
                            <div className='filters-roles flex padding-sm'>
                                {allRoles.map((role, index) => (
                                    <p
                                        key={index}
                                        className={`company-role-name ${tempSelectedRoles.includes(role) ? "selected-role" : ""}`}
                                        onClick={() => toggleTempRole(role)}
                                    >
                                        {role}
                                    </p>
                                ))}
                            </div>

                            <label className='filter-heading'>Package:</label>
                            <div className='filters-package flex-center flex-column'>
                                <div className='package-range flex-center'>
                                    <input
                                        className='filter-package-slider'
                                        type="range"
                                        min={0}
                                        max={uniqueMinPackages.length - 1}
                                        value={
                                            tempPackageRange.min !== null
                                                ? uniqueMinPackages.indexOf(tempPackageRange.min)
                                                : 0
                                        }
                                        onChange={(e) =>
                                            setTempPackageRange(prev => ({
                                                ...prev,
                                                min: uniqueMinPackages[e.target.value]
                                            }))
                                        }
                                    />
                                    <input
                                        className='filter-package-slider'
                                        type="range"
                                        min={0}
                                        max={uniqueMaxPackages.length - 1}
                                        value={
                                            tempPackageRange.max !== null
                                                ? uniqueMaxPackages.indexOf(tempPackageRange.max)
                                                : uniqueMaxPackages.length - 1
                                        }
                                        onChange={(e) =>
                                            setTempPackageRange(prev => ({
                                                ...prev,
                                                max: uniqueMaxPackages[e.target.value]
                                            }))
                                        }
                                    />
                                </div>

                                <p className="range-label">
                                    {tempPackageRange.min} LPA — {tempPackageRange.max} LPA
                                </p>
                            </div>
                        </div>

                        <div className='filter-buttons flex align-center width-full'>
                            <button className='button-alt outline-focus'
                                    onClick={clearFilters}>
                                Clear Filters
                            </button>

                            <button className='button outline-focus'
                                    onClick={applyFilters}>
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
