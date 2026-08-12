import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowRight,
    FiCheck,
    FiUsers,
    FiSend,
} from "react-icons/fi";

import { getMatches } from "../../api/matches";
import {
    sendLearningRequest,
} from "../../api/learningRequests";

function UserInitial({ name }) {
    return (
        <div className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold">
            {name?.charAt(0).toUpperCase()}
        </div>
    );
}

function SkillBadge({ skill }) {
    return (
        <span
            className="
                px-3
                py-1
                rounded-md
                bg-slate-100
                text-slate-700
                text-sm
            "
        >
            {skill.name}

            {skill.level && (
                <span className="ml-2 text-xs text-slate-400">
                    {skill.level}
                </span>
            )}
        </span>
    );
}

function MatchCard({ user, type, onRequestSent }) {
    const isPerfect = type === "perfect";
    const navigate = useNavigate();

    const [sendingSkillId, setSendingSkillId] =
        useState(null);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const handleSendRequest = async (
        skill,
        requestType
    ) => {
        try {
            setSendingSkillId(skill.id);
            setMessage("");
            setError("");

            await sendLearningRequest({
                receiverId: user.userId,
                skillId: skill.id,
                requestType,
            });

            setMessage(
                requestType === "learn"
                    ? `Learning request sent for ${skill.name}.`
                    : `Teaching request sent for ${skill.name}.`
            );

            if (onRequestSent) {
                onRequestSent();
            }
        } catch (error) {
            console.error(
                "Unable to send learning request:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to send request."
            );
        } finally {
            setSendingSkillId(null);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-6">

                {/* User */}

                <div className="flex items-center gap-4 min-w-0">
                    <UserInitial name={user.name} />

                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-900">
                            {user.name}
                        </h3>

                        <p className="text-sm text-slate-500 mt-0.5">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* View Profile */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/profile/${user.userId}`
                        )
                    }
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

            {/* Perfect Match */}

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* They can teach you */}

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                                They teach
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {user.matchedLearn.map(
                                    (skill) => (
                                        <SkillBadge
                                            key={skill.id}
                                            skill={skill}
                                        />
                                    )
                                )}
                            </div>

                            <div className="mt-3 space-y-2">
                                {user.matchedLearn.map(
                                    (skill) => (
                                        <button
                                            key={skill.id}
                                            type="button"
                                            disabled={
                                                sendingSkillId ===
                                                skill.id
                                            }
                                            onClick={() =>
                                                handleSendRequest(
                                                    skill,
                                                    "learn"
                                                )
                                            }
                                            className="
                                                w-full
                                                flex
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-lg
                                                bg-violet-600
                                                px-3
                                                py-2
                                                text-sm
                                                font-medium
                                                text-white
                                                hover:bg-violet-700
                                                disabled:opacity-50
                                                disabled:cursor-not-allowed
                                                transition
                                            "
                                        >
                                            <FiSend size={15} />

                                            {sendingSkillId ===
                                            skill.id
                                                ? "Sending..."
                                                : `Learn ${skill.name}`}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* They want to learn from you */}

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                                They want to learn
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {user.matchedTeach.map(
                                    (skill) => (
                                        <SkillBadge
                                            key={skill.id}
                                            skill={skill}
                                        />
                                    )
                                )}
                            </div>

                            <div className="mt-3 space-y-2">
                                {user.matchedTeach.map(
                                    (skill) => (
                                        <button
                                            key={skill.id}
                                            type="button"
                                            disabled={
                                                sendingSkillId ===
                                                skill.id
                                            }
                                            onClick={() =>
                                                handleSendRequest(
                                                    skill,
                                                    "teach"
                                                )
                                            }
                                            className="
                                                w-full
                                                flex
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-lg
                                                bg-slate-900
                                                px-3
                                                py-2
                                                text-sm
                                                font-medium
                                                text-white
                                                hover:bg-slate-800
                                                disabled:opacity-50
                                                disabled:cursor-not-allowed
                                                transition
                                            "
                                        >
                                            <FiSend size={15} />

                                            {sendingSkillId ===
                                            skill.id
                                                ? "Sending..."
                                                : `Teach ${skill.name}`}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-5 pt-5 border-t border-slate-100">

                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                        {type === "teach"
                            ? "Can teach you"
                            : "Wants to learn from you"}
                    </p>

                    <div className="space-y-3">
                        {user.skills.map((skill) => (
                            <div
                                key={skill.id}
                                className="
                                    flex
                                    flex-col
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                    gap-3
                                "
                            >
                                <SkillBadge skill={skill} />

                                <button
                                    type="button"
                                    disabled={
                                        sendingSkillId ===
                                        skill.id
                                    }
                                    onClick={() =>
                                        handleSendRequest(
                                            skill,
                                            type === "teach"
                                                ? "learn"
                                                : "teach"
                                        )
                                    }
                                    className="
                                        shrink-0
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        bg-violet-600
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        text-white
                                        hover:bg-violet-700
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                        transition
                                    "
                                >
                                    <FiSend size={15} />

                                    {sendingSkillId ===
                                    skill.id
                                        ? "Sending..."
                                        : type === "teach"
                                        ? `Learn ${skill.name}`
                                        : `Teach ${skill.name}`}
                                </button>
                            </div>
                        ))}
                    </div>

                    {message && (
                        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function Section({
    title,
    description,
    children,
}) {
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

                const result =
                    await getMatches();

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