import api from "./axios";

export const getMyConversations = async () => {
    const response = await api.get(
        "/chat/my-conversations"
    );

    return response.data;
};

export const getMessages = async (conversationId) => {
    const response = await api.get(
        `/chat/conversations/${conversationId}/messages`
    );

    return response.data;
};

export const sendMessage = async (
    conversationId,
    text,
    attachments = []
) => {
    const response = await api.post(
        "/chat/messages",
        {
            conversationId,
            text,
            attachments,
        }
    );

    return response.data;
};


// Upload chat file
export const uploadChatFile = async (file) => {
    const formData = new FormData();

    // IMPORTANT: must be "file"
    formData.append("file", file);

    const response = await api.post(
        "/chat/upload",
        formData
    );

    return response.data;
};