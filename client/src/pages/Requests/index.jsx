import { useEffect, useState } from "react";

import {
    getReceivedRequests,
    getSentRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
} from "../../api/learningRequests";

import Button from "../../components/UI/Button";

function Requests() {
    const [activeTab, setActiveTab] = useState("received");

    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const [receivedResult, sentResult] = await Promise.all([
                getReceivedRequests(),
                getSentRequests(),
            ]);

            setReceived(receivedResult.data || []);
            setSent(sentResult.data || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load requests."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    let cancelled = false;

    const fetchRequests = async () => {
        try {
            const [receivedResult, sentResult] = await Promise.all([
                getReceivedRequests(),
                getSentRequests(),
            ]);

            if (cancelled) return;

            setReceived(receivedResult.data || []);
            setSent(sentResult.data || []);
        } catch (error) {
            if (cancelled) return;

            setError(
                error.response?.data?.message ||
                "Unable to load requests."
            );
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    };

    fetchRequests();

    return () => {
        cancelled = true;
    };
}, []);

    const handleAccept = async (requestId) => {
        try {
            setActionLoading(requestId);
            await acceptRequest(requestId);
            await loadRequests();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to accept request."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (requestId) => {
        try {
            setActionLoading(requestId);
            await rejectRequest(requestId);
            await loadRequests();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to decline request."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (requestId) => {
        try {
            setActionLoading(requestId);
            await cancelRequest(requestId);
            await loadRequests();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to cancel request."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const requests =
        activeTab === "received"
            ? received
            : sent;

    return (
        <div className="max-w-6xl mx-auto">

            {/* Header */}

            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-slate-900">
                    Requests
                </h1>

                <p className="mt-2 text-base text-slate-500">
                    Manage your incoming and outgoing learning requests.
                </p>
            </div>

            {/* Tabs */}

            <div className="border-b border-slate-200">
                <div className="flex gap-8">

                    <button
                        onClick={() => setActiveTab("received")}
                        className={`
                            pb-4
                            text-base
                            font-medium
                            border-b-2
                            transition-colors
                            ${
                                activeTab === "received"
                                    ? "text-violet-600 border-violet-600"
                                    : "text-slate-500 border-transparent hover:text-slate-800"
                            }
                        `}
                    >
                        Received
                    </button>

                    <button
                        onClick={() => setActiveTab("sent")}
                        className={`
                            pb-4
                            text-base
                            font-medium
                            border-b-2
                            transition-colors
                            ${
                                activeTab === "sent"
                                    ? "text-violet-600 border-violet-600"
                                    : "text-slate-500 border-transparent hover:text-slate-800"
                            }
                        `}
                    >
                        Sent
                    </button>

                </div>
            </div>

            {/* Error */}

            {error && (
                <div className="mt-6 border border-red-200 bg-red-50 rounded-lg px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Content */}

            <div className="mt-6">

                {loading ? (
                    <div className="py-16 text-center text-slate-500">
                        Loading requests...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="py-16 text-center">
                        <h2 className="text-lg font-medium text-slate-800">
                            No requests yet
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            {activeTab === "received"
                                ? "Requests from other users will appear here."
                                : "Requests you send will appear here."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">

                        {requests.map((request) => {

                            const person =
                                activeTab === "received"
                                    ? request.sender
                                    : request.receiver;

                            const skill = request.skill;

                            return (
                                <div
                                    key={request._id}
                                    className="
                                        bg-white
                                        border
                                        border-slate-200
                                        rounded-2xl
                                        p-6
                                    "
                                >

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                        {/* Request information */}

                                        <div className="min-w-0">

                                            <div className="flex items-center gap-3">

                                                <div className="
                                                    w-11
                                                    h-11
                                                    rounded-full
                                                    bg-violet-100
                                                    text-violet-700
                                                    flex
                                                    items-center
                                                    justify-center
                                                    font-semibold
                                                ">
                                                    {person?.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
                                                </div>

                                                <div>
                                                    <h2 className="text-lg font-semibold text-slate-900">
                                                        {person?.name}
                                                    </h2>

                                                    <p className="text-sm text-slate-500">
                                                        {request.status}
                                                    </p>
                                                </div>

                                            </div>

                                            <div className="mt-5">

                                                <p className="text-sm text-slate-500">
    {request.requestType === "teach"
        ? activeTab === "received"
            ? "Wants to teach you"
            : "You want to teach"
        : activeTab === "received"
            ? "Wants to learn from you"
            : "You want to learn from them"}
</p>

                                                <p className="mt-1 text-xl font-medium text-slate-800">
                                                    {skill?.name}
                                                </p>

                                            </div>

                                            {request.message && (
                                                <p className="mt-4 text-sm text-slate-600">
                                                    "{request.message}"
                                                </p>
                                            )}

                                        </div>

                                        {/* Actions */}

                                        <div className="flex items-center gap-3 shrink-0">

                                            {activeTab === "received" &&
                                                request.status === "pending" && (
                                                    <>
                                                        <Button
                                                            onClick={() =>
                                                                handleAccept(
                                                                    request._id
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                request._id
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            request._id
                                                                ? "..."
                                                                : "Accept"}
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleReject(
                                                                    request._id
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                request._id
                                                            }
                                                            className="text-slate-700"
                                                        >
                                                            Decline
                                                        </Button>
                                                    </>
                                                )}

                                            {activeTab === "sent" &&
                                                request.status === "pending" && (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleCancel(
                                                                request._id
                                                            )
                                                        }
                                                        disabled={
                                                            actionLoading ===
                                                            request._id
                                                        }
                                                        className="text-slate-700"
                                                    >
                                                        {actionLoading ===
                                                        request._id
                                                            ? "..."
                                                            : "Cancel"}
                                                    </Button>
                                                )}

                                            {request.status !== "pending" && (
                                                <span
                                                    className={`
                                                        text-sm
                                                        font-medium
                                                        ${
                                                            request.status ===
                                                            "accepted"
                                                                ? "text-green-600"
                                                                : "text-slate-500"
                                                        }
                                                    `}
                                                >
                                                    {request.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        request.status.slice(
                                                            1
                                                        )}
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Requests;