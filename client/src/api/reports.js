import api from "./axios";

export const createReport = async (
    reportedUserId,
    reason,
    description = ""
) => {
    const response = await api.post(
        "/reports",
        {
            reportedUserId,
            reason,
            description,
        }
    );

    return response.data;
};

export const getMyReports = async () => {
    const response = await api.get(
        "/reports/my-reports"
    );

    return response.data;
};