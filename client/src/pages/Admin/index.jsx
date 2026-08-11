import { useEffect, useState } from "react";

import Card from "../../components/UI/Card";
import Badge from "../../components/UI/Badge";
import Button from "../../components/UI/Button";

import {
    getAdminUsers,
    getAdminReports,
    getFlaggedUsers,
    getAdminAnalytics,
    updateReportStatus,
    blockUser,
    unblockUser,
} from "../../api/admin";

function Admin() {
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [flaggedUsers, setFlaggedUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] =
        useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadAdminData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    usersResult,
                    reportsResult,
                    flaggedResult,
                    analyticsResult,
                ] = await Promise.all([
                    getAdminUsers(),
                    getAdminReports(),
                    getFlaggedUsers(),
                    getAdminAnalytics(),
                ]);

                if (cancelled) return;

                setUsers(usersResult.data || []);
                setReports(reportsResult.data || []);
                setFlaggedUsers(
                    flaggedResult.data || []
                );
                setAnalytics(
                    analyticsResult.data || null
                );
            } catch (error) {
                if (cancelled) return;

                setError(
                    error.response?.data?.message ||
                        "Unable to load admin dashboard."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadAdminData();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleBlockUser = async (userId) => {
        try {
            setActionLoading(true);
            setError("");

            const result =
                await blockUser(userId);

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user._id === userId
                        ? {
                              ...user,
                              isBlocked: true,
                          }
                        : user
                )
            );

            setFlaggedUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user._id === userId
                        ? {
                              ...user,
                              isBlocked: true,
                          }
                        : user
                )
            );

            return result;
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to block user."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            setActionLoading(true);
            setError("");

            const result =
                await unblockUser(userId);

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user._id === userId
                        ? {
                              ...user,
                              isBlocked: false,
                          }
                        : user
                )
            );

            setFlaggedUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user._id === userId
                        ? {
                              ...user,
                              isBlocked: false,
                          }
                        : user
                )
            );

            return result;
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to unblock user."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleReportAction = async (
        reportId,
        status
    ) => {
        try {
            setActionLoading(true);
            setError("");

            await updateReportStatus(
                reportId,
                status
            );

            setReports((currentReports) =>
                currentReports.map((report) =>
                    report._id === reportId
                        ? {
                              ...report,
                              status,
                          }
                        : report
                )
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to update report."
            );
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-slate-500">
                    Loading admin dashboard...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl space-y-6">

            {/* Header */}

            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Admin Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Monitor SkillSync users, sessions,
                    matches and reports.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Analytics */}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

                <Card>
                    <p className="text-sm text-slate-500">
                        Total Users
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                        {analytics?.totalUsers ?? 0}
                    </p>
                </Card>

                <Card>
                    <p className="text-sm text-slate-500">
                        Total Matches
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                        {analytics?.totalMatches ?? 0}
                    </p>
                </Card>

                <Card>
                    <p className="text-sm text-slate-500">
                        Completed Sessions
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                        {analytics?.completedSessions ??
                            0}
                    </p>
                </Card>

                <Card>
                    <p className="text-sm text-slate-500">
                        Pending Reports
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                        {analytics?.pendingReports ?? 0}
                    </p>
                </Card>

            </div>

            {/* Platform Overview */}

            <Card>

                <h2 className="text-lg font-semibold text-slate-900">
                    Platform Overview
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                            Active Matches
                        </p>

                        <p className="mt-2 text-xl font-semibold text-slate-900">
                            {analytics?.activeMatches ??
                                0}
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                            Skills
                        </p>

                        <p className="mt-2 text-xl font-semibold text-slate-900">
                            {analytics?.totalSkills ??
                                0}
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                            Flagged Users
                        </p>

                        <p className="mt-2 text-xl font-semibold text-slate-900">
                            {flaggedUsers.length}
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                            Users Blocked
                        </p>

                        <p className="mt-2 text-xl font-semibold text-slate-900">
                            {
                                users.filter(
                                    (user) =>
                                        user.isBlocked
                                ).length
                            }
                        </p>
                    </div>

                </div>

            </Card>

            {/* Top Skills */}

            {analytics?.topSkills?.length > 0 && (
                <Card>

                    <h2 className="text-lg font-semibold text-slate-900">
                        Popular Skills
                    </h2>

                    <div className="mt-5 space-y-3">

                        {analytics.topSkills.map(
                            (skill, index) => (
                                <div
                                    key={skill._id || index}
                                    className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">

                                        <span className="text-sm font-medium text-slate-400">
                                            #{index + 1}
                                        </span>

                                        <span className="font-medium text-slate-800">
                                        {skill._id}
                                        </span>

                                    </div>

                                    <Badge>
                                        {skill.count}
                                    </Badge>

                                </div>
                            )
                        )}

                    </div>

                </Card>
            )}

            {/* Users */}

            <Card>

                <div className="flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            User Management
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage registered SkillSync
                            users.
                        </p>
                    </div>

                    <Badge>
                        {users.length} Users
                    </Badge>

                </div>

                <div className="mt-5 overflow-x-auto">

                    {users.length === 0 ? (

                        <p className="py-6 text-sm text-slate-400">
                            No users found.
                        </p>

                    ) : (

                        <table className="w-full min-w-[700px] text-sm">

                            <thead>
                                <tr className="border-b border-slate-200 text-left">

                                    <th className="px-3 py-3 font-medium text-slate-500">
                                        User
                                    </th>

                                    <th className="px-3 py-3 font-medium text-slate-500">
                                        Email
                                    </th>

                                    <th className="px-3 py-3 font-medium text-slate-500">
                                        Role
                                    </th>

                                    <th className="px-3 py-3 font-medium text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-3 py-3 text-right font-medium text-slate-500">
                                        Action
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="border-b border-slate-100"
                                    >

                                        <td className="px-3 py-4 font-medium text-slate-900">
                                            {user.name}
                                        </td>

                                        <td className="px-3 py-4 text-slate-500">
                                            {user.email}
                                        </td>

                                        <td className="px-3 py-4">

                                            <Badge>
                                                {user.role ||
                                                    "user"}
                                            </Badge>

                                        </td>

                                        <td className="px-3 py-4">

                                            <Badge
                                                variant={
                                                    user.isBlocked
                                                        ? "danger"
                                                        : "success"
                                                }
                                            >
                                                {user.isBlocked
                                                    ? "Blocked"
                                                    : "Active"}
                                            </Badge>

                                        </td>

                                        <td className="px-3 py-4 text-right">

                                            {user.role ===
                                            "admin" ? (

                                                <span className="text-xs text-slate-400">
                                                    Admin
                                                </span>

                                            ) : user.isBlocked ? (

                                                <Button
                                                    variant="secondary"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handleUnblockUser(
                                                            user._id
                                                        )
                                                    }
                                                >
                                                    Unblock
                                                </Button>

                                            ) : (

                                                <Button
                                                    variant="secondary"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handleBlockUser(
                                                            user._id
                                                        )
                                                    }
                                                >
                                                    Block
                                                </Button>

                                            )}

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

            </Card>

            {/* Reports */}

            <Card>

                <div className="flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Reports
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Review and manage user reports.
                        </p>
                    </div>

                    <Badge>
                        {
                            reports.filter(
                                (report) =>
                                    report.status ===
                                    "pending"
                            ).length
                        }{" "}
                        Pending
                    </Badge>

                </div>

                <div className="mt-5 space-y-4">

                    {reports.length === 0 ? (

                        <p className="py-6 text-sm text-slate-400">
                            No reports found.
                        </p>

                    ) : (

                        reports.map((report) => (

                            <div
                                key={report._id}
                                className="rounded-xl border border-slate-200 p-4"
                            >

                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                                    <div>

                                        <div className="flex flex-wrap items-center gap-2">

                                            <h3 className="font-semibold text-slate-900">
                                                {report.reportedUser
                                                    ?.name ||
                                                    "Unknown user"}
                                            </h3>

                                            <Badge
                                                variant={
                                                    report.status ===
                                                    "pending"
                                                        ? "warning"
                                                        : report.status ===
                                                            "resolved"
                                                            ? "success"
                                                            : "danger"
                                                }
                                            >
                                                {report.status}
                                            </Badge>

                                        </div>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Reported by{" "}
                                            {report.reporter
                                                ?.name ||
                                                "Unknown user"}
                                        </p>

                                        <p className="mt-2 text-sm font-medium text-slate-700">
                                            {report.reason}
                                        </p>

                                        {report.description && (
                                            <p className="mt-1 text-sm text-slate-500">
                                                {
                                                    report.description
                                                }
                                            </p>
                                        )}

                                    </div>

                                    {report.status ===
                                        "pending" && (
                                        <div className="flex gap-2">

                                            <Button
                                                disabled={
                                                    actionLoading
                                                }
                                                onClick={() =>
                                                    handleReportAction(
                                                        report._id,
                                                        "resolved"
                                                    )
                                                }
                                            >
                                                Resolve
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                disabled={
                                                    actionLoading
                                                }
                                                onClick={() =>
                                                    handleReportAction(
                                                        report._id,
                                                        "dismissed"
                                                    )
                                                }
                                            >
                                                Dismiss
                                            </Button>

                                        </div>
                                    )}

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </Card>

        </div>
    );
}

export default Admin;