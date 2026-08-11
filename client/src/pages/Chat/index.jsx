import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    getMyConversations,
    getMessages,
    sendMessage,
    uploadChatFile,
} from "../../api/chat";

import Button from "../../components/UI/Button";

function Chat() {
    const [conversations, setConversations] =
        useState([]);

    const [selectedConversation, setSelectedConversation] =
        useState(null);

    const [messages, setMessages] = useState([]);

    const [messageText, setMessageText] =
        useState("");

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [uploading, setUploading] =
        useState(false);

    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] =
        useState(false);

    const [sending, setSending] = useState(false);

    const [error, setError] = useState("");

    const fileInputRef = useRef(null);

    const currentUserId = useMemo(() => {
    try {
        const user = JSON.parse(
            localStorage.getItem("user") || "{}"
        );

        return String(user.id || user._id || "");
    } catch {
        return "";
    }
}, []);

    useEffect(() => {
        let cancelled = false;

        const loadConversations = async () => {
            try {
                setLoading(true);
                setError("");

                const result =
                    await getMyConversations();

                if (cancelled) return;

                setConversations(
                    result.data || []
                );
            } catch (error) {
                if (cancelled) return;

                setError(
                    error.response?.data?.message ||
                        "Unable to load conversations."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadConversations();

        return () => {
            cancelled = true;
        };
    }, []);

    const loadMessages = async (
        conversation
    ) => {
        try {
            setSelectedConversation(
                conversation
            );

            setMessagesLoading(true);
            setError("");

            const result = await getMessages(
                conversation._id
            );

            setMessages(result.data || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to load messages."
            );
        } finally {
            setMessagesLoading(false);
        }
    };

    const getOtherParticipant = (
    conversation
) => {
    if (!currentUserId) {
        return null;
    }

    return conversation.participants?.find(
        (participant) =>
            String(participant._id) !==
            String(currentUserId)
    );
};

    const handleSendMessage = async (
        event
    ) => {
        event.preventDefault();

        const cleanMessage =
            messageText.trim();

        if (
            (!cleanMessage && !selectedFile) ||
            !selectedConversation ||
            sending
        ) {
            return;
        }

        try {
            setSending(true);
            setError("");

            let attachments = [];

            if (selectedFile) {
                setUploading(true);

                try {
                    const uploadResult =
                        await uploadChatFile(selectedFile);

                    attachments = [uploadResult.data];
                } finally {
                    setUploading(false);
                }
            }

            const result = await sendMessage(
                selectedConversation._id,
                cleanMessage,
                attachments
            );

            const newMessage = result.data;

            setMessages((current) => [
                ...current,
                newMessage,
            ]);

            setMessageText("");
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setConversations((current) =>
                current.map((conversation) =>
                    conversation._id ===
                    selectedConversation._id
                        ? {
                              ...conversation,
                              lastMessage:
                                  newMessage,
                              updatedAt:
                                  newMessage.createdAt,
                          }
                        : conversation
                )
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to send message."
            );
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-slate-500">
                Loading conversations...
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)]">

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Chat
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Chat with your active SkillSync
                    matches.
                </p>
            </div>

            {error && (
                <div
                    className="
                        mb-4
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

            <div
                className="
                    grid
                    h-[calc(100%-4.5rem)]
                    grid-cols-1
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    md:grid-cols-[280px_1fr]
                "
            >

                {/* Conversations */}

                <div
                    className="
                        border-b
                        border-slate-200
                        md:border-b-0
                        md:border-r
                    "
                >

                    <div
                        className="
                            border-b
                            border-slate-200
                            px-5
                            py-4
                        "
                    >
                        <h2 className="font-semibold text-slate-900">
                            Conversations
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Your active matches
                        </p>
                    </div>

                    <div
                        className="
                            max-h-64
                            overflow-y-auto
                            md:max-h-full
                        "
                    >

                        {conversations.length ===
                        0 ? (

                            <div className="p-5">
                                <p className="text-sm text-slate-500">
                                    No conversations yet.
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Chat becomes available
                                    after a match is
                                    accepted.
                                </p>
                            </div>

                        ) : (

                            conversations.map(
                                (conversation) => {
                                    const otherUser =
                                        getOtherParticipant(
                                            conversation
                                        );

                                    const isSelected =
                                        selectedConversation?._id ===
                                        conversation._id;

                                    return (
                                        <button
                                            key={
                                                conversation._id
                                            }
                                            type="button"
                                            onClick={() =>
                                                loadMessages(
                                                    conversation
                                                )
                                            }
                                            className={`
                                                w-full
                                                border-b
                                                border-slate-100
                                                px-5
                                                py-4
                                                text-left
                                                transition
                                                ${
                                                    isSelected
                                                        ? "bg-violet-50"
                                                        : "hover:bg-slate-50"
                                                }
                                            `}
                                        >

                                            <div className="flex items-center gap-3">

                                                <div
                                                    className="
                                                        flex
                                                        h-10
                                                        w-10
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        bg-violet-100
                                                        font-semibold
                                                        text-violet-700
                                                    "
                                                >
                                                    {otherUser?.name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        ?.toUpperCase() ||
                                                        "?"}
                                                </div>

                                                <div className="min-w-0 flex-1">

                                                    <p className="truncate text-sm font-semibold text-slate-900">
                                                        {
                                                            otherUser?.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 truncate text-xs text-slate-400">
                                                        {conversation
                                                            .lastMessage
                                                            ?.text ||
                                                            "Start a conversation"}
                                                    </p>

                                                </div>

                                            </div>

                                        </button>
                                    );
                                }
                            )

                        )}

                    </div>

                </div>

                {/* Chat Area */}

                <div className="flex min-h-0 flex-col">

                    {!selectedConversation ? (

                        <div
                            className="
                                flex
                                flex-1
                                items-center
                                justify-center
                                p-8
                                text-center
                            "
                        >

                            <div>

                                <div
                                    className="
                                        mx-auto
                                        flex
                                        h-16
                                        w-16
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-violet-100
                                        text-2xl
                                    "
                                >
                                    💬
                                </div>

                                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                                    Select a conversation
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Choose an active match
                                    to start chatting.
                                </p>

                            </div>

                        </div>

                    ) : (

                        <>
                            {/* Chat Header */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    border-b
                                    border-slate-200
                                    px-5
                                    py-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-violet-100
                                        font-semibold
                                        text-violet-700
                                    "
                                >
                                    {getOtherParticipant(
                                        selectedConversation
                                    )
                                        ?.name?.charAt(
                                            0
                                        )
                                        ?.toUpperCase() ||
                                        "?"}
                                </div>

                                <div>

                                    <h2 className="font-semibold text-slate-900">
                                        {
                                            getOtherParticipant(
                                                selectedConversation
                                            )?.name
                                        }
                                    </h2>

                                    <p className="text-xs text-emerald-600">
                                        Active Match
                                    </p>

                                </div>

                            </div>

                            {/* Messages */}

                            <div
                                className="
                                    min-h-0
                                    flex-1
                                    space-y-3
                                    overflow-y-auto
                                    bg-slate-50
                                    p-5
                                "
                            >

                                {messagesLoading ? (

                                    <div className="text-center text-sm text-slate-400">
                                        Loading messages...
                                    </div>

                                ) : messages.length ===
                                  0 ? (

                                    <div className="flex h-full items-center justify-center text-center">

                                        <div>
                                            <p className="text-sm font-medium text-slate-600">
                                                No messages yet
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Say hello and start
                                                your learning
                                                conversation.
                                            </p>
                                        </div>

                                    </div>

                                ) : (

                                    messages.map(
                                        (message) => {
                                            const isMine =
                                                String(
                                                    message
                                                        .sender
                                                        ?._id
                                                ) ===
                                                String(
                                                    currentUserId
                                                );

                                            return (
                                                <div
                                                    key={
                                                        message._id
                                                    }
                                                    className={`
                                                        flex
                                                        ${
                                                            isMine
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        }
                                                    `}
                                                >

                                                    <div
                                                        className={`
                                                            max-w-[75%]
                                                            rounded-2xl
                                                            px-4
                                                            py-3
                                                            text-sm
                                                            ${
                                                                isMine
                                                                    ? "bg-violet-600 text-white"
                                                                    : "bg-white text-slate-700 shadow-sm"
                                                            }
                                                        `}
                                                    >

                                                        {message.text && (
                                                            <p className="whitespace-pre-wrap">
                                                                {
                                                                    message.text
                                                                }
                                                            </p>
                                                        )}

                                                        {message.attachments?.map(
                                                            (
                                                                attachment
                                                            ) => (
                                                                <a
                                                                    key={
                                                                        attachment._id ||
                                                                        attachment.url
                                                                    }
                                                                    href={
                                                                        attachment.url
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="
                                                                        mt-2
                                                                        block
                                                                        text-xs
                                                                        underline
                                                                    "
                                                                >
                                                                    📎{" "}
                                                                    {
                                                                        attachment.name
                                                                    }
                                                                </a>
                                                            )
                                                        )}

                                                        <p
                                                            className={`
                                                                mt-1
                                                                text-[10px]
                                                                ${
                                                                    isMine
                                                                        ? "text-violet-200"
                                                                        : "text-slate-400"
                                                                }
                                                            `}
                                                        >
                                                            {new Date(
                                                                message.createdAt
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )

                                )}

                            </div>

                            {/* Selected Attachment */}

                            {selectedFile && (
                                <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                                        <span className="truncate text-sm text-slate-600">
                                            📎 {selectedFile.name}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);

                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = "";
                                                }
                                            }}
                                            className="ml-3 text-slate-400 hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Message Input */}

                            <form
                                onSubmit={
                                    handleSendMessage
                                }
                                className="
                                    flex
                                    gap-3
                                    border-t
                                    border-slate-200
                                    bg-white
                                    p-4
                                "
                            >

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];

                                        if (!file) {
                                            return;
                                        }

                                        setSelectedFile(file);
                                        setError("");
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={sending || uploading}
                                    className="h-11 w-11 shrink-0 rounded-xl border border-slate-300 text-slate-500 transition hover:bg-slate-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Attach file"
                                >
                                    📎
                                </button>

                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(event) =>
                                        setMessageText(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Type a message..."
                                    className="
                                        h-11
                                        flex-1
                                        rounded-xl
                                        border
                                        border-slate-300
                                        px-4
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-violet-500
                                        focus:ring-1
                                        focus:ring-violet-500
                                    "
                                />

                                <Button
                                    type="submit"
                                    disabled={
                                        sending ||
                                        uploading ||
                                        (!messageText.trim() &&
                                            !selectedFile)
                                    }
                                >
                                    {uploading
                                        ? "Uploading..."
                                        : sending
                                            ? "Sending..."
                                            : "Send"}
                                </Button>

                            </form>

                        </>
                    )}

                </div>

            </div>

        </div>
    );
}

export default Chat;