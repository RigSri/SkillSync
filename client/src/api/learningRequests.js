import api from "./axios";
export const sendLearningRequest = async (
    requestData
) => {
    const response = await api.post(
        "/learning-requests",
        requestData
    );

    return response.data;
};
export const getReceivedRequests = async () => {
    const response = await api.get("/learning-requests/received");
    return response.data;
};

export const getSentRequests = async () => {
    const response = await api.get("/learning-requests/sent");
    return response.data;
};

export const acceptRequest = async (requestId) => {
    const response = await api.patch(
        `/learning-requests/${requestId}/accept`
    );
    return response.data;
};

export const rejectRequest = async (requestId) => {
    const response = await api.patch(
        `/learning-requests/${requestId}/reject`
    );
    return response.data;
};

export const cancelRequest = async (requestId) => {
    const response = await api.patch(
        `/learning-requests/${requestId}/cancel`
    );
    return response.data;
};