import { useEffect, useState } from "react";
import { FiArrowRight, FiCheck, FiUsers } from "react-icons/fi";

import { getMatches } from "../../api/matches";

function UserInitial({ name }) {
    return (
        <div className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold">
            {name?.charAt(0).toUpperCase()}
        </div>
    );
}

function MatchCard({ user, type }) {
    const isPerfect = type === "perfect";

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-6">

                <div className="flex items-center gap-4 min-w-0">
                    <UserInitial name={user.name} />

                    <div>
                        <h3 className="text-base font-semibold text-slate-900">
                            {user.name}
                        </h3>

                        <p className="text-sm text-slate-500 mt-0.5">
                            {user.email}
                        </p>
                    </div>
                </div>

                <button
                    className="
                        shrink-0
                        flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-violet-600
                        hover:text-violet-700
                        transition
                    "
                >
                    View profile
                    <FiArrowRight size={16} />
                </button>

            </div>

            {isPerfect ? (
                <div className="mt-5 pt-5 border-t border-slate-100">

                    <div className="flex items-center gap-2 mb-4">
                        <FiCheck
                            size={17}
                            className="text-green-600"
                        />

                        <span className="text-sm font-medium text-green-700">
                            Perfect skill exchange
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                                You teach
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {user.matchedTeach.map((skill) => (
                                    <span
                                        key={skill}
                                        className="
                                            px-3
                                            py-1
                                            rounded-md
                                            bg-violet-50
                                            text-violet-700
                                            text-sm
                                        "
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                                They teach
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {user.matchedLearn.map((skill) => (
                                    <span
                                        key={skill}
                                        className="
                                            px-3
                                            py-1
                                            rounded-md
                                            bg-slate-100
                                            text-slate-700
                                            text-sm
                                        "
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="mt-5 pt-5 border-t border-slate-100">

                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                        {type === "teach"
                            ? "Can teach you"
                            : "Wants to learn from you"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill) => (
                            <span
                                key={skill}
                                className="
                                    px-3
                                    py-1
                                    rounded-md
                                    bg-slate-100
                                    text-slate-700
                                    text-sm
                                "
                            >
                                {skill}
                            </span>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
}

function Section({ title, description, children }) {
    return (
        <section className="mb-10">

            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                    {title}
                </h2>

                {description && (
                    <p className="text-sm text-slate-500 mt-1">
                        {description}
                    </p>
                )}
            </div>

            <div className="space-y-3">
                {children}
            </div>

        </section>
    );
}

function Matches() {
    const [matches, setMatches] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getMatches();

                setMatches(result.data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load matches."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    if (loading) {
        return (
            <div className="max-w-5xl">
                <div className="mb-8">
                    <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-72 bg-slate-200 rounded mt-3 animate-pulse" />
                </div>

                <div className="space-y-3">
                    <div className="h-32 bg-white border border-slate-200 rounded-xl animate-pulse" />
                    <div className="h-32 bg-white border border-slate-200 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Matches
                </h1>

                <div className="mt-6 border border-red-200 bg-red-50 rounded-lg px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    const {
        perfectMatches = [],
        canTeachYou = [],
        wantToLearnFromYou = [],
    } = matches || {};

    const hasMatches =
        perfectMatches.length > 0 ||
        canTeachYou.length > 0 ||
        wantToLearnFromYou.length > 0;

    return (
        <div className="max-w-5xl">

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <FiUsers
                        size={25}
                        className="text-violet-600"
                    />

                    <h1 className="text-2xl font-semibold text-slate-900">
                        Matches
                    </h1>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                    Find people who can help you learn and who you can help.
                </p>
            </div>

            {!hasMatches && (
                <div className="py-20 text-center">
                    <h2 className="text-lg font-medium text-slate-800">
                        No matches yet
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Add some skills to start finding people.
                    </p>
                </div>
            )}

            {perfectMatches.length > 0 && (
                <Section
                    title="Perfect Matches"
                    description="You can teach each other something you want to learn."
                >
                    {perfectMatches.map((user) => (
                        <MatchCard
                            key={user.userId}
                            user={user}
                            type="perfect"
                        />
                    ))}
                </Section>
            )}

            {canTeachYou.length > 0 && (
                <Section
                    title="Can Teach You"
                    description="People who can teach you a skill you're looking for."
                >
                    {canTeachYou.map((user) => (
                        <MatchCard
                            key={user.userId}
                            user={user}
                            type="teach"
                        />
                    ))}
                </Section>
            )}

            {wantToLearnFromYou.length > 0 && (
                <Section
                    title="Want To Learn From You"
                    description="People looking to learn a skill you can teach."
                >
                    {wantToLearnFromYou.map((user) => (
                        <MatchCard
                            key={user.userId}
                            user={user}
                            type="learn"
                        />
                    ))}
                </Section>
            )}

        </div>
    );
}

export default Matches;