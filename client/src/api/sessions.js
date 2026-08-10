import api from "./axios";

export const getMySessions = async () => {
    const response = await api.get(
        "/sessions/my-sessions"
    );

    return response.data;
};

export const getUpcomingSessions = async () => {
    const response = await api.get(
        "/sessions/upcoming"
    );

    return response.data;
};

export const createSession = async (sessionData) => {
    const response = await api.post(
        "/sessions",
        sessionData
    );

    return response.data;
};

export const getSessionById = async (sessionId) => {
    const response = await api.get(
        `/sessions/${sessionId}`
    );

    return response.data;
};

export const updateSession = async (
    sessionId,
    sessionData
) => {
    const response = await api.patch(
        `/sessions/${sessionId}`,
        sessionData
    );

    return response.data;
};

export const completeSession = async (sessionId) => {
    const response = await api.patch(
        `/sessions/${sessionId}/complete`
    );

    return response.data;
};

export const cancelSession = async (sessionId) => {
    const response = await api.patch(
        `/sessions/${sessionId}/cancel`
    );

    return response.data;
};

export const updateSessionProgress = async (
    sessionId,
    progressData
) => {
    const response = await api.patch(
        `/sessions/${sessionId}/progress`,
        progressData
    );

    return response.data;
};