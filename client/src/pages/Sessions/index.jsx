import { useEffect, useState } from "react";

import {
    getMySessions,
    createSession,
    getSessionById,
    completeSession,
    cancelSession,
    updateSession,
    updateSessionProgress,
} from "../../api/sessions";

import { getMyMatches } from "../../api/matches";
import { createReview, getMyReviews } from "../../api/reviews";

import Card from "../../components/UI/Card";
import Badge from "../../components/UI/Badge";
import Button from "../../components/UI/Button";

function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [myMatches, setMyMatches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedMatch, setSelectedMatch] =
        useState(null);
    const [selectedSkillId, setSelectedSkillId] =
    useState("");
    const [scheduleForm, setScheduleForm] = useState({
        scheduledAt: "",
        duration: "60",
        meetingLink: "",
    });
    
    const [scheduleLoading, setScheduleLoading] =
        useState(false);

    const [scheduleError, setScheduleError] =
        useState("");
    const [selectedSession, setSelectedSession] = useState(null);
const [detailsLoading, setDetailsLoading] = useState(false);
const [detailsError, setDetailsError] = useState("");
const [myReviews, setMyReviews] = useState([]);

const [reviewRating, setReviewRating] = useState(0);
const [reviewComment, setReviewComment] = useState("");
const [reviewLoading, setReviewLoading] = useState(false);
const [reviewError, setReviewError] = useState("");
const [reviewSuccess, setReviewSuccess] = useState("");
const [sessionActionLoading, setSessionActionLoading] =
    useState(false);

const [notes, setNotes] = useState("");
const [progressPercentage, setProgressPercentage] =
    useState(0);
const [milestones, setMilestones] = useState([]);
const [newMilestone, setNewMilestone] = useState("");
    const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
);

const currentUserId =
    storedUser._id || storedUser.id;

    useEffect(() => {
        let cancelled = false;

        const loadSessions = async () => {
            try {
                setError("");

                const [
                    sessionsResult,
                    matchesResult,
                    reviewsResult,
                ] = await Promise.all([
                    getMySessions(),
                    getMyMatches(),
                    getMyReviews(),
                ]);

                if (cancelled) return;

                setSessions(
                    sessionsResult.data || []
                );

                setMyMatches(
                    matchesResult.data || []
                );

                setMyReviews(
                    reviewsResult.data || []
                );
            } catch (error) {
                if (cancelled) return;

                setError(
                    error.response?.data?.message ||
                        "Unable to load your sessions."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadSessions();

        return () => {
            cancelled = true;
        };
    }, []);

    const upcomingSessions = sessions.filter(
        (session) =>
            session.status === "scheduled" &&
            new Date(session.scheduledAt) >=
                new Date()
    );

    const pastSessions = sessions.filter(
        (session) =>
            session.status !== "scheduled" ||
            new Date(session.scheduledAt) <
                new Date()
    );

    const handleScheduleChange = (event) => {
        const { name, value } = event.target;

        setScheduleForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const openScheduleForm = (match) => {
    setSelectedMatch(match);

    const firstSkill =
        (match.skills || []).find(
            (skill) =>
                skill &&
                skill._id
        );

    setSelectedSkillId(
        firstSkill?._id || ""
    );

    setScheduleForm({
        scheduledAt: "",
        duration: "60",
        meetingLink: "",
    });

    setScheduleError("");
    setError("");
};

    const closeScheduleForm = () => {
        setSelectedMatch(null);

        setScheduleForm({
            scheduledAt: "",
            duration: "60",
            meetingLink: "",
        });

        setScheduleError("");
    };

    const handleSchedule = async (event) => {
        event.preventDefault();

        if (!selectedMatch) {
            return;
        }

        try {
            setScheduleLoading(true);
            setScheduleError("");

            if (!scheduleForm.scheduledAt) {
                setScheduleError(
                    "Please select a date and time."
                );
                return;
            }

            const scheduledDate = new Date(
                scheduleForm.scheduledAt
            );

            if (
                Number.isNaN(
                    scheduledDate.getTime()
                )
            ) {
                setScheduleError(
                    "Please select a valid date and time."
                );
                return;
            }

            if (scheduledDate <= new Date()) {
                setScheduleError(
                    "Please select a future date and time."
                );
                return;
            }

            const skill = (
    selectedMatch.skills || []
).find(
    (item) =>
        String(item._id) ===
        String(selectedSkillId)
);

            if (!skill) {
    setScheduleError(
        "Please select a valid skill."
    );
    return;
}

            const result = await createSession({
                matchId: selectedMatch._id,
                skillId: skill._id,
                scheduledAt:
                    scheduledDate.toISOString(),
                duration: Number(
                    scheduleForm.duration
                ),
                meetingLink:
                    scheduleForm.meetingLink.trim(),
            });

            setSessions((current) => [
                ...current,
                result.data,
            ]);

            closeScheduleForm();
        } catch (error) {
            setScheduleError(
                error.response?.data?.message ||
                    "Unable to schedule the session."
            );
        } finally {
            setScheduleLoading(false);
        }
    };
    const openSessionDetails = async (sessionId) => {
    try {
        setDetailsLoading(true);
        setDetailsError("");

        const result = await getSessionById(sessionId);

        const session = result.data;

        setSelectedSession(session);

        setNotes(session.notes || "");
        setProgressPercentage(
            session.progress?.percentage || 0
        );
        setMilestones(
            session.progress?.milestones || []
        );
    } catch (error) {
        setDetailsError(
            error.response?.data?.message ||
                "Unable to load session details."
        );
    } finally {
        setDetailsLoading(false);
    }
};

const closeSessionDetails = () => {
    setSelectedSession(null);
    setDetailsError("");
    setNotes("");
    setProgressPercentage(0);
    setMilestones([]);
    setNewMilestone("");

    setReviewRating(0);
    setReviewComment("");
    setReviewError("");
    setReviewSuccess("");
};

const handleSubmitReview = async () => {
    if (!selectedSession) return;

    if (reviewRating < 1 || reviewRating > 5) {
        setReviewError("Please select a rating from 1 to 5.");
        return;
    }

    try {
        setReviewLoading(true);
        setReviewError("");
        setReviewSuccess("");

        const result = await createReview({
            sessionId: selectedSession._id,
            rating: Number(reviewRating),
            comment: reviewComment.trim(),
        });

        setMyReviews((current) => [
            result.data,
            ...current,
        ]);

        setReviewRating(0);
        setReviewComment("");
        setReviewSuccess("Review submitted successfully.");
    } catch (error) {
        setReviewError(
            error.response?.data?.message ||
                "Unable to submit review."
        );
    } finally {
        setReviewLoading(false);
    }
};

const handleCompleteSession = async () => {
    if (!selectedSession) return;

    try {
        setSessionActionLoading(true);
        setDetailsError("");

        const result = await completeSession(
            selectedSession._id
        );

        setSelectedSession(result.data);

        setSessions((current) =>
            current.map((session) =>
                session._id === result.data._id
                    ? result.data
                    : session
            )
        );
    } catch (error) {
        setDetailsError(
            error.response?.data?.message ||
                "Unable to complete the session."
        );
    } finally {
        setSessionActionLoading(false);
    }
};

const handleCancelSession = async () => {
    if (!selectedSession) return;

    const confirmed = window.confirm(
        "Are you sure you want to cancel this session?"
    );

    if (!confirmed) return;

    try {
        setSessionActionLoading(true);
        setDetailsError("");

        const result = await cancelSession(
            selectedSession._id
        );

        setSelectedSession(result.data);

        setSessions((current) =>
            current.map((session) =>
                session._id === result.data._id
                    ? result.data
                    : session
            )
        );
    } catch (error) {
        setDetailsError(
            error.response?.data?.message ||
                "Unable to cancel the session."
        );
    } finally {
        setSessionActionLoading(false);
    }
};

const handleSaveNotes = async () => {
    if (!selectedSession) return;

    try {
        setSessionActionLoading(true);
        setDetailsError("");

        const result = await updateSession(
            selectedSession._id,
            {
                notes,
            }
        );

        setSelectedSession(result.data);

        setSessions((current) =>
            current.map((session) =>
                session._id === result.data._id
                    ? {
                          ...session,
                          notes: result.data.notes,
                      }
                    : session
            )
        );
    } catch (error) {
        setDetailsError(
            error.response?.data?.message ||
                "Unable to save notes."
        );
    } finally {
        setSessionActionLoading(false);
    }
};

const handleSaveProgress = async () => {
    if (!selectedSession) return;

    try {
        setSessionActionLoading(true);
        setDetailsError("");

        const result = await updateSessionProgress(
            selectedSession._id,
            {
                percentage: Number(progressPercentage),
                milestones,
            }
        );

        setSelectedSession(result.data);

        setSessions((current) =>
            current.map((session) =>
                session._id === result.data._id
                    ? result.data
                    : session
            )
        );

        setMilestones(
            result.data.progress?.milestones || []
        );
        setProgressPercentage(
            result.data.progress?.percentage || 0
        );
    } catch (error) {
        setDetailsError(
            error.response?.data?.message ||
                "Unable to save progress."
        );
    } finally {
        setSessionActionLoading(false);
    }
};

const addMilestone = () => {
    const title = newMilestone.trim();

    if (!title) return;

    setMilestones((current) => [
        ...current,
        {
            title,
            completed: false,
        },
    ]);

    setNewMilestone("");
};

const toggleMilestone = (index) => {
    setMilestones((current) =>
        current.map((milestone, milestoneIndex) =>
            milestoneIndex === index
                ? {
                      ...milestone,
                      completed: !milestone.completed,
                  }
                : milestone
        )
    );
};

const removeMilestone = (index) => {
    setMilestones((current) =>
        current.filter(
            (_, milestoneIndex) =>
                milestoneIndex !== index
        )
    );
};
    if (loading) {
        return (
            <div className="text-sm text-slate-500">
                Loading sessions...
            </div>
        );
    }

    return (
        <>
            <div className="max-w-6xl space-y-6">

                {/* Page Header */}

                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Sessions
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your learning sessions and
                        track your progress.
                    </p>
                </div>

                {/* Global Error */}

                {error && (
                    <div
                        className="
                            rounded-lg
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-700
                        "
                    >
                        {error}
                    </div>
                )}

                {/* Active Matches */}

                <Card>

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            My Active Matches
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Schedule a learning session with
                            someone you have matched with.
                        </p>
                    </div>

                    <div className="mt-5 space-y-4">

                        {myMatches.length === 0 ? (

                            <div
                                className="
                                    rounded-xl
                                    border
                                    border-dashed
                                    border-slate-300
                                    p-8
                                    text-center
                                "
                            >
                                <p className="text-sm text-slate-500">
                                    You don't have any active
                                    matches yet.
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Accept a match request to
                                    start scheduling sessions.
                                </p>
                            </div>

                        ) : (

                            myMatches.map((match) => {

                                const matchedUser =
    match.users.find(
        (user) =>
            String(user._id) !==
            String(currentUserId)
    );

                                return (
                                    <div
                                        key={match._id}
                                        className="
                                            rounded-xl
                                            border
                                            border-slate-200
                                            p-5
                                            transition
                                            hover:border-violet-200
                                            hover:shadow-sm
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-start
                                                justify-between
                                                gap-4
                                            "
                                        >

                                            <div className="flex-1">

                                                {Array.from(
    new Map(
        (match.skills || [])
            .filter(
                (skill) =>
                    skill &&
                    skill.name
            )
            .map((skill) => [
                skill.name
                    .trim()
                    .toLowerCase(),
                skill,
            ])
    ).values()
).map((skill) => (
    <div
        key={skill._id}
        className="mb-3"
    >
        <div
            className="
                flex
                items-center
                gap-3
            "
        >
            <h3 className="text-lg font-semibold text-slate-900">
                {skill.name}
            </h3>

            <Badge variant="success">
                Active
            </Badge>
        </div>

        <p className="mt-1 text-xs text-slate-400">
            {skill.level}{" "}
            ·{" "}
            {skill.category}
        </p>
    </div>
))}

                                                {matchedUser && (
                                                    <p className="mt-4 text-sm text-slate-600">
                                                        Matched with{" "}
                                                        <span className="font-semibold text-slate-900">
                                                            {
                                                                matchedUser.name
                                                            }
                                                        </span>
                                                    </p>
                                                )}

                                            </div>

                                        </div>

                                        <div className="mt-5">

                                            <Button
                                                onClick={() =>
                                                    openScheduleForm(
                                                        match
                                                    )
                                                }
                                            >
                                                Schedule Session
                                            </Button>

                                        </div>

                                    </div>
                                );
                            })

                        )}

                    </div>

                </Card>

                {/* Upcoming Sessions */}

                <Card>

                    <h2 className="text-lg font-semibold text-slate-900">
                        Upcoming Sessions
                    </h2>

                    <div className="mt-5 space-y-4">

                        {upcomingSessions.length === 0 ? (

                            <p className="text-sm text-slate-400">
                                No upcoming sessions.
                            </p>

                        ) : (

                            upcomingSessions.map(
                                (session) => {

                                    const isTeacher =
                                        session.teacher?._id ===
                                        currentUserId;

                                    return (
                                        <div
                                            key={
                                                session._id
                                            }
                                            className="
                                                rounded-xl
                                                border
                                                border-slate-200
                                                p-5
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-4
                                                "
                                            >

                                                <div>

                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                        {
                                                            session
                                                                .skill
                                                                ?.name
                                                        }
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {isTeacher
                                                            ? `Teaching ${session.learner?.name}`
                                                            : `Learning from ${session.teacher?.name}`}
                                                    </p>

                                                    <p className="mt-2 text-sm text-slate-600">
                                                        {new Date(
                                                            session.scheduledAt
                                                        ).toLocaleString()}
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {
                                                            session.duration
                                                        }{" "}
                                                        minutes
                                                    </p>

                                                </div>

                                                <Badge variant="success">
                                                    Scheduled
                                                </Badge>

                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-3">

    {session.meetingLink && (
        <Button
            onClick={() =>
                window.open(
                    session.meetingLink,
                    "_blank",
                    "noopener,noreferrer"
                )
            }
        >
            Join Meeting
        </Button>
    )}

    <Button
        variant="secondary"
        onClick={() =>
            openSessionDetails(session._id)
        }
    >
        View Details
    </Button>

</div>

                                        </div>
                                    );
                                }
                            )

                        )}

                    </div>

                </Card>

                {/* Session History */}

                <Card>

                    <h2 className="text-lg font-semibold text-slate-900">
                        Session History
                    </h2>

                    <div className="mt-5 space-y-4">

                        {pastSessions.length === 0 ? (

                            <p className="text-sm text-slate-400">
                                No previous sessions.
                            </p>

                        ) : (

                            pastSessions.map(
                                (session) => (
                                    <div
    key={session._id}
    className="
        flex
        items-center
        justify-between
        gap-4
        border-b
        border-slate-100
        pb-4
    "
>

                                        <div>

                                            <h3 className="font-medium text-slate-900">
                                                {
                                                    session
                                                        .skill
                                                        ?.name
                                                }
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {new Date(
                                                    session.scheduledAt
                                                ).toLocaleString()}
                                            </p>

                                        </div>

                                        <div className="flex items-center gap-3">

    <Badge
        variant={
            session.status === "completed"
                ? "success"
                : "danger"
        }
    >
        {session.status}
    </Badge>

    <Button
        variant="secondary"
        onClick={() =>
            openSessionDetails(session._id)
        }
    >
        View Details
    </Button>

</div>

                                    </div>
                                )
                            )

                        )}

                    </div>

                </Card>

            </div>

            {/* Schedule Session Modal */}

            {selectedMatch && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-slate-900/60
                        p-4
                    "
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeScheduleForm();
                        }
                    }}
                >

                    <div
                        className="
                            w-full
                            max-w-lg
                            max-h-[90vh]
                            overflow-y-auto
                            rounded-2xl
                            bg-white
                            shadow-2xl
                        "
                    >

                        {/* Modal Header */}

                        <div
                            className="
                                flex
                                items-start
                                justify-between
                                gap-4
                                border-b
                                border-slate-200
                                px-6
                                py-5
                            "
                        >

                            <div>

                                <h2 className="text-xl font-semibold text-slate-900">
                                    Schedule Session
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Schedule a learning session
                                    with your match.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeScheduleForm}
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-xl
                                    text-slate-400
                                    transition
                                    hover:bg-slate-100
                                    hover:text-slate-700
                                "
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>

                        {/* Match Summary */}

                        <div
                            className="
                                border-b
                                border-slate-200
                                bg-slate-50
                                px-6
                                py-4
                            "
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Skill
                                    </p>

                                    <p className="mt-1 text-base font-semibold text-slate-900">
                                        {
                                            selectedMatch
                                                .skills?.[0]
                                                ?.name
                                        }
                                    </p>

                                </div>

                                <Badge variant="success">
                                    Active Match
                                </Badge>

                            </div>

                            {selectedMatch.users?.length > 0 && (
    <p className="mt-2 text-sm text-slate-500">
        Matched with{" "}
        <span className="font-medium text-slate-700">
            {
                selectedMatch.users.find(
                    (user) =>
                        String(user._id) !==
                        String(currentUserId)
                )?.name || "your match"
            }
        </span>
    </p>
)}

                        </div>

                        {/* Schedule Form */}

                        <form
                            onSubmit={handleSchedule}
                            className="space-y-5 px-6 py-6"
                        >

                            {scheduleError && (
                                <div
                                    className="
                                        rounded-lg
                                        border
                                        border-red-200
                                        bg-red-50
                                        px-4
                                        py-3
                                        text-sm
                                        text-red-700
                                    "
                                >
                                    {scheduleError}
                                </div>
                            )}
                            {/* Skill */}

<div>
    <label
        htmlFor="selectedSkillId"
        className="
            mb-2
            block
            text-sm
            font-medium
            text-slate-700
        "
    >
        Skill
    </label>

    <select
        id="selectedSkillId"
        value={selectedSkillId}
        onChange={(event) =>
            setSelectedSkillId(event.target.value)
        }
        required
        className="
            h-11
            w-full
            rounded-lg
            border
            border-slate-300
            bg-white
            px-3
            outline-none
            transition
            focus:border-violet-500
            focus:ring-1
            focus:ring-violet-500
        "
    >
        {Array.from(
            new Map(
                (selectedMatch.skills || [])
                    .filter(
                        (skill) =>
                            skill &&
                            skill.name
                    )
                    .map((skill) => [
                        skill.name
                            .trim()
                            .toLowerCase(),
                        skill,
                    ])
            ).values()
        ).map((skill) => (
            <option
                key={skill._id}
                value={skill._id}
            >
                {skill.name}
            </option>
        ))}
    </select>
</div>
                            {/* Date & Time */}

                            <div>

                                <label
                                    htmlFor="scheduledAt"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-slate-700
                                    "
                                >
                                    Date & Time
                                </label>

                                <input
                                    id="scheduledAt"
                                    name="scheduledAt"
                                    type="datetime-local"
                                    value={
                                        scheduleForm.scheduledAt
                                    }
                                    onChange={
                                        handleScheduleChange
                                    }
                                    min={new Date()
                                        .toISOString()
                                        .slice(0, 16)}
                                    required
                                    className="
                                        h-11
                                        w-full
                                        rounded-lg
                                        border
                                        border-slate-300
                                        bg-white
                                        px-3
                                        outline-none
                                        transition
                                        focus:border-violet-500
                                        focus:ring-1
                                        focus:ring-violet-500
                                    "
                                />

                                <p className="mt-2 text-xs text-slate-400">
                                    The selected time must fall
                                    within both participants'
                                    availability.
                                </p>

                            </div>

                            {/* Duration */}

                            <div>

                                <label
                                    htmlFor="duration"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-slate-700
                                    "
                                >
                                    Duration
                                </label>

                                <select
                                    id="duration"
                                    name="duration"
                                    value={
                                        scheduleForm.duration
                                    }
                                    onChange={
                                        handleScheduleChange
                                    }
                                    className="
                                        h-11
                                        w-full
                                        rounded-lg
                                        border
                                        border-slate-300
                                        bg-white
                                        px-3
                                        outline-none
                                        transition
                                        focus:border-violet-500
                                        focus:ring-1
                                        focus:ring-violet-500
                                    "
                                >
                                    <option value="30">
                                        30 minutes
                                    </option>

                                    <option value="60">
                                        60 minutes
                                    </option>

                                    <option value="90">
                                        90 minutes
                                    </option>
                                </select>

                            </div>

                            {/* Meeting Link */}

                            <div>

                                <label
                                    htmlFor="meetingLink"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-slate-700
                                    "
                                >
                                    Meeting Link{" "}
                                    <span className="font-normal text-slate-400">
                                        (optional)
                                    </span>
                                </label>

                                <input
                                    id="meetingLink"
                                    name="meetingLink"
                                    type="url"
                                    placeholder="https://meet.google.com/..."
                                    value={
                                        scheduleForm.meetingLink
                                    }
                                    onChange={
                                        handleScheduleChange
                                    }
                                    className="
                                        h-11
                                        w-full
                                        rounded-lg
                                        border
                                        border-slate-300
                                        bg-white
                                        px-3
                                        outline-none
                                        transition
                                        focus:border-violet-500
                                        focus:ring-1
                                        focus:ring-violet-500
                                    "
                                />

                            </div>

                            {/* Actions */}

                            <div
                                className="
                                    flex
                                    justify-end
                                    gap-3
                                    border-t
                                    border-slate-100
                                    pt-5
                                "
                            >

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={
                                        closeScheduleForm
                                    }
                                    disabled={
                                        scheduleLoading
                                    }
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        scheduleLoading
                                    }
                                >
                                    {scheduleLoading
                                        ? "Scheduling..."
                                        : "Schedule Session"}
                                </Button>

                            </div>

                        </form>

                    </div>

                </div>
            )}
                        {/* Session Details Modal */}

            {selectedSession && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-slate-900/60
                        p-4
                    "
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeSessionDetails();
                        }
                    }}
                >
                    <div
                        className="
                            w-full
                            max-w-2xl
                            max-h-[90vh]
                            overflow-y-auto
                            rounded-2xl
                            bg-white
                            shadow-2xl
                        "
                    >

                        {/* Header */}

                        <div
                            className="
                                flex
                                items-start
                                justify-between
                                border-b
                                border-slate-200
                                px-6
                                py-5
                            "
                        >
                            <div>
                                <h2
                                    className="
                                        text-xl
                                        font-semibold
                                        text-slate-900
                                    "
                                >
                                    Session Details
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    View and manage this
                                    learning session.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeSessionDetails}
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-xl
                                    text-slate-400
                                    hover:bg-slate-100
                                    hover:text-slate-700
                                "
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Content */}

                        <div className="space-y-6 px-6 py-6">

                            {detailsLoading ? (

                                <div
                                    className="
                                        py-10
                                        text-center
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    Loading session details...
                                </div>

                            ) : (

                                <>
                                    {detailsError && (
                                        <div
                                            className="
                                                rounded-lg
                                                border
                                                border-red-200
                                                bg-red-50
                                                px-4
                                                py-3
                                                text-sm
                                                text-red-700
                                            "
                                        >
                                            {detailsError}
                                        </div>
                                    )}

                                    {/* Session Overview */}

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-slate-200
                                            p-5
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                items-start
                                                justify-between
                                                gap-4
                                            "
                                        >
                                            <div>
                                                <p
                                                    className="
                                                        text-xs
                                                        font-medium
                                                        uppercase
                                                        tracking-wide
                                                        text-slate-400
                                                    "
                                                >
                                                    Skill
                                                </p>

                                                <h3
                                                    className="
                                                        mt-1
                                                        text-xl
                                                        font-semibold
                                                        text-slate-900
                                                    "
                                                >
                                                    {
                                                        selectedSession
                                                            .skill
                                                            ?.name
                                                    }
                                                </h3>
                                            </div>

                                            <Badge
                                                variant={
                                                    selectedSession.status ===
                                                    "completed"
                                                        ? "success"
                                                        : selectedSession.status ===
                                                          "cancelled"
                                                        ? "danger"
                                                        : "success"
                                                }
                                            >
                                                {
                                                    selectedSession.status
                                                }
                                            </Badge>
                                        </div>

                                        <div
                                            className="
                                                mt-5
                                                grid
                                                gap-4
                                                sm:grid-cols-2
                                            "
                                        >
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                    Teacher
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-800">
                                                    {
                                                        selectedSession
                                                            .teacher
                                                            ?.name
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                    Learner
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-800">
                                                    {
                                                        selectedSession
                                                            .learner
                                                            ?.name
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                    Date & Time
                                                </p>

                                                <p className="mt-1 text-sm text-slate-700">
                                                    {new Date(
                                                        selectedSession.scheduledAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                    Duration
                                                </p>

                                                <p className="mt-1 text-sm text-slate-700">
                                                    {
                                                        selectedSession.duration
                                                    }{" "}
                                                    minutes
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meeting */}

                                    {selectedSession.meetingLink && (
                                        <div
                                            className="
                                                rounded-xl
                                                border
                                                border-violet-100
                                                bg-violet-50
                                                p-5
                                            "
                                        >
                                            <p
                                                className="
                                                    text-sm
                                                    font-semibold
                                                    text-slate-900
                                                "
                                            >
                                                Meeting
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    break-all
                                                    text-sm
                                                    text-slate-500
                                                "
                                            >
                                                {
                                                    selectedSession
                                                        .meetingLink
                                                }
                                            </p>

                                            <div className="mt-4">
                                                <Button
                                                    onClick={() =>
                                                        window.open(
                                                            selectedSession.meetingLink,
                                                            "_blank",
                                                            "noopener,noreferrer"
                                                        )
                                                    }
                                                >
                                                    Join Meeting
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes */}

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-base font-semibold text-slate-900">
                                                    Session Notes
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Keep track of what
                                                    you learned or
                                                    discussed.
                                                </p>
                                            </div>
                                        </div>

                                        <textarea
                                            value={notes}
                                            onChange={(event) =>
                                                setNotes(
                                                    event.target.value
                                                )
                                            }
                                            disabled={
                                                selectedSession.status ===
                                                "cancelled"
                                            }
                                            rows={4}
                                            placeholder="Write notes about this session..."
                                            className="
                                                mt-3
                                                w-full
                                                rounded-xl
                                                border
                                                border-slate-300
                                                px-4
                                                py-3
                                                text-sm
                                                outline-none
                                                focus:border-violet-500
                                                focus:ring-1
                                                focus:ring-violet-500
                                            "
                                        />

                                        {selectedSession.status !==
                                            "cancelled" && (
                                            <div className="mt-3">
                                                <Button
                                                    variant="secondary"
                                                    onClick={
                                                        handleSaveNotes
                                                    }
                                                    disabled={
                                                        sessionActionLoading
                                                    }
                                                >
                                                    {sessionActionLoading
                                                        ? "Saving..."
                                                        : "Save Notes"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress */}

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-slate-200
                                            p-5
                                        "
                                    >
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-900">
                                                Learning Progress
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Track your progress
                                                through this
                                                learning session.
                                            </p>
                                        </div>

                                        <div className="mt-5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-700">
                                                    Progress
                                                </span>

                                                <span className="text-sm font-semibold text-violet-600">
                                                    {
                                                        progressPercentage
                                                    }
                                                    %
                                                </span>
                                            </div>

                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={
                                                    progressPercentage
                                                }
                                                onChange={(event) =>
                                                    setProgressPercentage(
                                                        Number(
                                                            event.target
                                                                .value
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    selectedSession.status ===
                                                    "cancelled"
                                                }
                                                className="mt-3 w-full accent-violet-600"
                                            />

                                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="
                                                        h-full
                                                        rounded-full
                                                        bg-violet-600
                                                        transition-all
                                                    "
                                                    style={{
                                                        width: `${progressPercentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Milestones */}

                                        <div className="mt-6">
                                            <h4 className="text-sm font-semibold text-slate-800">
                                                Milestones
                                            </h4>

                                            <div className="mt-3 space-y-2">

                                                {milestones.length ===
                                                0 ? (
                                                    <p className="text-sm text-slate-400">
                                                        No milestones
                                                        added yet.
                                                    </p>
                                                ) : (
                                                    milestones.map(
                                                        (
                                                            milestone,
                                                            index
                                                        ) => (
                                                            <div
                                                                key={
                                                                    milestone._id ||
                                                                    index
                                                                }
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-3
                                                                    rounded-lg
                                                                    border
                                                                    border-slate-200
                                                                    px-3
                                                                    py-2
                                                                "
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        milestone.completed
                                                                    }
                                                                    onChange={() =>
                                                                        toggleMilestone(
                                                                            index
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        selectedSession.status ===
                                                                        "cancelled"
                                                                    }
                                                                    className="h-4 w-4 accent-violet-600"
                                                                />

                                                                <span
                                                                    className={`
                                                                        flex-1
                                                                        text-sm
                                                                        ${
                                                                            milestone.completed
                                                                                ? "text-slate-400 line-through"
                                                                                : "text-slate-700"
                                                                        }
                                                                    `}
                                                                >
                                                                    {
                                                                        milestone.title
                                                                    }
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeMilestone(
                                                                            index
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        selectedSession.status ===
                                                                        "cancelled"
                                                                    }
                                                                    className="
                                                                        text-xs
                                                                        font-medium
                                                                        text-red-500
                                                                        hover:text-red-700
                                                                    "
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        )
                                                    )
                                                )}

                                            </div>

                                            {selectedSession.status !==
                                                "cancelled" && (
                                                <div className="mt-3 flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={
                                                            newMilestone
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setNewMilestone(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        onKeyDown={(
                                                            event
                                                        ) => {
                                                            if (
                                                                event.key ===
                                                                "Enter"
                                                            ) {
                                                                event.preventDefault();
                                                                addMilestone();
                                                            }
                                                        }}
                                                        placeholder="Add a milestone..."
                                                        className="
                                                            h-10
                                                            flex-1
                                                            rounded-lg
                                                            border
                                                            border-slate-300
                                                            px-3
                                                            text-sm
                                                            outline-none
                                                            focus:border-violet-500
                                                            focus:ring-1
                                                            focus:ring-violet-500
                                                        "
                                                    />

                                                    <Button
                                                        variant="secondary"
                                                        onClick={
                                                            addMilestone
                                                        }
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {selectedSession.status !==
                                            "cancelled" && (
                                            <div className="mt-4">
                                                <Button
                                                    variant="secondary"
                                                    onClick={
                                                        handleSaveProgress
                                                    }
                                                    disabled={
                                                        sessionActionLoading
                                                    }
                                                >
                                                    {sessionActionLoading
                                                        ? "Saving..."
                                                        : "Save Progress"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Review */}

                                    {selectedSession.status === "completed" && (
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                            <h3 className="text-base font-semibold text-slate-900">
                                                Session Review
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Rate your experience and share your feedback.
                                            </p>

                                            {myReviews.some(
                                                (review) =>
                                                    String(review.session?._id || review.sessionId) ===
                                                    String(selectedSession._id)
                                            ) ? (
                                                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                                                    <p className="text-sm font-medium text-green-700">
                                                        You have already reviewed this session.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="mt-4">
                                                        <p className="text-sm font-medium text-slate-700">
                                                            Rating
                                                        </p>
                                                        <div className="mt-2 flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setReviewRating(star)}
                                                                    className={`text-2xl leading-none ${
                                                                        star <= reviewRating
                                                                            ? "text-yellow-400"
                                                                            : "text-slate-300"
                                                                    } hover:text-yellow-400`}
                                                                    aria-label={`Rate ${star} out of 5`}
                                                                >
                                                                    ★
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <label
                                                            htmlFor="session-review-comment"
                                                            className="text-sm font-medium text-slate-700"
                                                        >
                                                            Comment
                                                        </label>
                                                        <textarea
                                                            id="session-review-comment"
                                                            value={reviewComment}
                                                            onChange={(event) =>
                                                                setReviewComment(event.target.value)
                                                            }
                                                            rows={4}
                                                            maxLength={500}
                                                            placeholder="Share your experience..."
                                                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                                        />
                                                        <p className="mt-1 text-right text-xs text-slate-400">
                                                            {reviewComment.length}/500
                                                        </p>
                                                    </div>

                                                    {reviewError && (
                                                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                                            <p className="text-sm text-red-700">
                                                                {reviewError}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {reviewSuccess && (
                                                        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                                                            <p className="text-sm text-green-700">
                                                                {reviewSuccess}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="mt-4">
                                                        <Button
                                                            onClick={handleSubmitReview}
                                                            disabled={reviewLoading || reviewRating === 0}
                                                        >
                                                            {reviewLoading
                                                                ? "Submitting..."
                                                                : "Submit Review"}
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}

                                    {selectedSession.status ===
                                        "scheduled" && (
                                        <div
                                            className="
                                                flex
                                                flex-wrap
                                                justify-end
                                                gap-3
                                                border-t
                                                border-slate-200
                                                pt-5
                                            "
                                        >
                                            <Button
                                                variant="secondary"
                                                onClick={
                                                    handleCancelSession
                                                }
                                                disabled={
                                                    sessionActionLoading
                                                }
                                            >
                                                {sessionActionLoading
                                                    ? "Please wait..."
                                                    : "Cancel Session"}
                                            </Button>

                                            <Button
                                                onClick={
                                                    handleCompleteSession
                                                }
                                                disabled={
                                                    sessionActionLoading
                                                }
                                            >
                                                {sessionActionLoading
                                                    ? "Please wait..."
                                                    : "Mark Completed"}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Sessions;