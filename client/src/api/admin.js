import api from "./axios";

export const getAdminUsers = async () => {
    const response = await api.get("/admin/users");
    return response.data;
};

export const getAdminReports = async () => {
    const response = await api.get("/admin/reports");
    return response.data;
};

export const getFlaggedUsers = async () => {
    const response = await api.get(
        "/admin/flagged-users"
    );
    return response.data;
};

export const getAdminAnalytics = async () => {
    const response = await api.get(
        "/admin/analytics"
    );
    return response.data;
};

export const updateReportStatus = async (
    reportId,
    status,
    adminNote = ""
) => {
    const response = await api.patch(
        `/admin/reports/${reportId}`,
        {
            status,
            adminNote,
        }
    );

    return response.data;
};

export const blockUser = async (userId) => {
    const response = await api.patch(
        `/admin/users/${userId}/block`
    );

    return response.data;
};

export const unblockUser = async (userId) => {
    const response = await api.patch(
        `/admin/users/${userId}/unblock`
    );

    return response.data;
};