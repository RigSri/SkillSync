import { useEffect, useRef, useState } from "react";
import { FiSearch, FiX, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { searchSkillPartners } from "../../api/users";

function SearchBar() {
    const navigate = useNavigate();
    const wrapperRef = useRef(null);

    const [query, setQuery] = useState("");
    const [mode, setMode] = useState("learn");
    const [level, setLevel] = useState("");
    const [peerRated, setPeerRated] = useState(false);
    const [verifiedTeacher, setVerifiedTeacher] =
        useState(false);

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    useEffect(() => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            return undefined;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                setError("");
                setOpen(true);

                const response =
                    await searchSkillPartners({
                        q: trimmedQuery,
                        mode,
                        level,
                        peerRated,
                        verifiedTeacher,
                    });

                setResults(response.data || []);
            } catch (error) {
                console.error(
                    "Skill search failed:",
                    error
                );

                setResults([]);
                setError(
                    error.response?.data?.message ||
                        "Unable to search skills."
                );
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [
        query,
        mode,
        level,
        peerRated,
        verifiedTeacher,
    ]);

    const handleSearchChange = (event) => {
        const value = event.target.value;

        setQuery(value);

        if (!value.trim()) {
            setResults([]);
            setLoading(false);
            setError("");
            setOpen(false);
        } else {
            setOpen(true);
        }
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setError("");
        setLoading(false);
        setOpen(false);
    };

    const handleProfileClick = (userId) => {
        setOpen(false);
        navigate(`/profile/${userId}`);
    };

    const formatRating = (rating) => {
        if (!rating) {
            return "No ratings yet";
        }

        return `${rating} / 5`;
    };

    return (
        <div
            ref={wrapperRef}
            className="relative w-96"
        >
            <div className="relative">
                <FiSearch
                    className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                        pointer-events-none
                    "
                    size={18}
                />

                <input
                    type="text"
                    value={query}
                    onChange={handleSearchChange}
                    onFocus={() => {
                        if (query.trim()) {
                            setOpen(true);
                        }
                    }}
                    placeholder="Search skills..."
                    className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        pl-11
                        pr-10
                        py-2.5
                        text-sm
                        outline-none
                        transition
                        focus:border-violet-500
                        focus:ring-2
                        focus:ring-violet-200
                    "
                />

                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                            hover:text-slate-700
                        "
                    >
                        <FiX size={17} />
                    </button>
                )}
            </div>

            {open && (
                <div
                    className="
                        absolute
                        right-0
                        mt-2
                        w-[520px]
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-xl
                        z-50
                        overflow-hidden
                    "
                >
                    <div className="p-4 border-b border-slate-100">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                            Looking for
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setMode("learn")
                                }
                                className={`
                                    flex-1
                                    rounded-lg
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    transition
                                    ${
                                        mode === "learn"
                                            ? "bg-violet-600 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }
                                `}
                            >
                                Learn
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setMode("teach")
                                }
                                className={`
                                    flex-1
                                    rounded-lg
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    transition
                                    ${
                                        mode === "teach"
                                            ? "bg-violet-600 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }
                                `}
                            >
                                Teach
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border-b border-slate-100">
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                            Level
                        </label>

                        <select
                            value={level}
                            onChange={(event) =>
                                setLevel(
                                    event.target.value
                                )
                            }
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-200
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-violet-500
                            "
                        >
                            <option value="">
                                Any level
                            </option>

                            <option value="Beginner">
                                Beginner
                            </option>

                            <option value="Intermediate">
                                Intermediate
                            </option>

                            <option value="Advanced">
                                Advanced
                            </option>
                        </select>

                        <div className="flex gap-2 mt-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setPeerRated(
                                        (current) =>
                                            !current
                                    )
                                }
                                className={`
                                    rounded-lg
                                    px-3
                                    py-2
                                    text-xs
                                    font-medium
                                    border
                                    transition
                                    ${
                                        peerRated
                                            ? "border-violet-600 bg-violet-50 text-violet-700"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }
                                `}
                            >
                                Peer Rated
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setVerifiedTeacher(
                                        (current) =>
                                            !current
                                    )
                                }
                                className={`
                                    rounded-lg
                                    px-3
                                    py-2
                                    text-xs
                                    font-medium
                                    border
                                    transition
                                    ${
                                        verifiedTeacher
                                            ? "border-violet-600 bg-violet-50 text-violet-700"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }
                                `}
                            >
                                Verified Teacher
                            </button>
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {loading && (
                            <div className="px-5 py-8 text-center text-sm text-slate-500">
                                Searching...
                            </div>
                        )}

                        {!loading &&
                            error && (
                                <div className="px-5 py-8 text-center text-sm text-red-500">
                                    {error}
                                </div>
                            )}

                        {!loading &&
                            !error &&
                            query.trim() &&
                            results.length === 0 && (
                                <div className="px-5 py-8 text-center">
                                    <p className="text-sm font-medium text-slate-700">
                                        No matching skill
                                        partners found.
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Try another skill or
                                        adjust your filters.
                                    </p>
                                </div>
                            )}

                        {!loading &&
                            results.map((result) => (
                                <button
                                    key={`${result.skill._id}-${result.user._id}`}
                                    type="button"
                                    onClick={() =>
                                        handleProfileClick(
                                            result.user._id
                                        )
                                    }
                                    className="
                                        w-full
                                        text-left
                                        px-5
                                        py-4
                                        border-b
                                        border-slate-100
                                        hover:bg-slate-50
                                        transition
                                    "
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="
                                                w-10
                                                h-10
                                                shrink-0
                                                rounded-full
                                                bg-violet-100
                                                text-violet-700
                                                flex
                                                items-center
                                                justify-center
                                                font-semibold
                                            "
                                        >
                                            {result.user.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {
                                                            result
                                                                .user
                                                                .name
                                                        }
                                                    </p>

                                                    <p className="text-sm text-violet-600 font-medium">
                                                        {
                                                            result
                                                                .skill
                                                                .name
                                                        }
                                                    </p>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                    {
                                                        result
                                                            .skill
                                                            .level
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                <span>
                                                    {mode ===
                                                    "learn"
                                                        ? "Teaching"
                                                        : "Learning"}
                                                </span>

                                                <span>•</span>

                                                <span>
                                                    {formatRating(
                                                        result
                                                            .credibility
                                                            .averageRating
                                                    )}
                                                </span>

                                                {result.badges
                                                    .peerRated && (
                                                    <>
                                                        <span>
                                                            •
                                                        </span>

                                                        <span className="text-green-600 font-medium">
                                                            Peer
                                                            Rated
                                                        </span>
                                                    </>
                                                )}

                                                {result.badges
                                                    .verifiedTeacher && (
                                                    <>
                                                        <span>
                                                            •
                                                        </span>

                                                        <span className="text-blue-600 font-medium">
                                                            Verified
                                                            Teacher
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <FiUser
                                            size={16}
                                            className="text-slate-300 mt-1"
                                        />
                                    </div>
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchBar;