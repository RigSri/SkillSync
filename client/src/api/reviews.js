import api from "./axios";

export const createReview = async (reviewData) => {
    const response = await api.post(
        "/reviews",
        reviewData
    );

    return response.data;
};

export const getUserReviews = async (userId) => {
    const response = await api.get(
        `/reviews/user/${userId}`
    );

    return response.data;
};

export const getMyReviews = async () => {
    const response = await api.get(
        "/reviews/my-reviews"
    );

    return response.data;
};