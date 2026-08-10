import api from "./axios";

export const getMatches = async () => {
    const response = await api.get("/matches");

    return response.data;
};

export const getMyMatches = async () => {
    const response = await api.get(
        "/matches/my-matches"
    );

    return response.data;
};