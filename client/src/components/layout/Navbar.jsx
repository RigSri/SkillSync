import { useEffect, useRef, useState } from "react";
import {
    FiBell,
    FiMenu,
    FiCheck,
} from "react-icons/fi";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import SearchBar from "../common/SearchBar";
import UserAvatar from "../common/UserAvatar";

import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../../api/notifications";

function Navbar({ onMenuClick }) {
    const location = useLocation();
    const navigate = useNavigate();

    const notificationRef = useRef(null);

    const [notifications, setNotifications] =
        useState([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [showNotifications, setShowNotifications] =
        useState(false);

    const pageTitle =
        location.pathname
            .split("/")[1]
            ?.charAt(0)
            .toUpperCase() +
        location.pathname
            .split("/")[1]
            ?.slice(1);

    // Load notifications when Navbar mounts
    useEffect(() => {
        let cancelled = false;

        const fetchNotifications = async () => {
            try {
                const response =
                    await getMyNotifications();

                if (cancelled) {
                    return;
                }

                setNotifications(
                    response.data || []
                );

                setUnreadCount(
                    response.unreadCount || 0
                );
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "Unable to load notifications:",
                        error
                    );
                }
            }
        };

        fetchNotifications();

        return () => {
            cancelled = true;
        };
    }, []);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const handleNotificationClick = async (
        notification
    ) => {
        try {
            if (!notification.isRead) {
                await markNotificationAsRead(
                    notification._id
                );

                setNotifications((current) =>
                    current.map((item) =>
                        item._id === notification._id
                            ? {
                                  ...item,
                                  isRead: true,
                              }
                            : item
                    )
                );

                setUnreadCount((current) =>
                    Math.max(current - 1, 0)
                );
            }

            setShowNotifications(false);

            if (notification.link) {
                navigate(notification.link);
            }
        } catch (error) {
            console.error(
                "Unable to mark notification as read:",
                error
            );
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    isRead: true,
                }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error(
                "Unable to mark all notifications:",
                error
            );
        }
    };

    const formatNotificationTime = (date) => {
        const notificationDate =
            new Date(date);

        const now = new Date();

        const difference =
            now.getTime() -
            notificationDate.getTime();

        const minutes = Math.floor(
            difference / 60000
        );

        if (minutes < 1) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes}m ago`;
        }

        const hours = Math.floor(
            minutes / 60
        );

        if (hours < 24) {
            return `${hours}h ago`;
        }

        const days = Math.floor(
            hours / 24
        );

        if (days < 7) {
            return `${days}d ago`;
        }

        return notificationDate.toLocaleDateString();
    };

    return (
        <header
            className="
                h-16
                shrink-0
                bg-white
                border-b
                border-slate-200
                flex
                items-center
                justify-between
                px-6
                lg:px-8
            "
        >
            {/* Left */}

            <div className="flex items-center gap-4 min-w-0">

                <button
                    type="button"
                    onClick={onMenuClick}
                    className="
                        p-2
                        rounded-lg
                        text-slate-600
                        hover:bg-slate-100
                        transition
                    "
                    title="Toggle sidebar"
                >
                    <FiMenu size={21} />
                </button>

                <h1
                    className="
                        text-xl
                        font-semibold
                        text-slate-800
                        truncate
                    "
                >
                    {pageTitle}
                </h1>

            </div>

            {/* Right */}

            <div className="flex items-center gap-4">

                <div className="hidden md:block">
                    <SearchBar />
                </div>

                {/* Notifications */}

                <div
                    ref={notificationRef}
                    className="relative"
                >
                    <button
                        type="button"
                        onClick={() =>
                            setShowNotifications(
                                (current) =>
                                    !current
                            )
                        }
                        className="
                            relative
                            p-2
                            rounded-lg
                            text-slate-600
                            hover:bg-slate-100
                            transition
                        "
                        title="Notifications"
                    >
                        <FiBell size={21} />

                        {unreadCount > 0 && (
                            <span
                                className="
                                    absolute
                                    -top-1
                                    -right-1
                                    min-w-5
                                    h-5
                                    px-1
                                    rounded-full
                                    bg-red-500
                                    text-white
                                    text-[10px]
                                    font-bold
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                {unreadCount > 9
                                    ? "9+"
                                    : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div
                            className="
                                absolute
                                right-0
                                mt-2
                                w-96
                                max-w-[90vw]
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                shadow-xl
                                z-50
                                overflow-hidden
                            "
                        >
                            {/* Header */}

                            <div
                                className="
                                    px-4
                                    py-3
                                    border-b
                                    border-slate-100
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <h3
                                        className="
                                            font-semibold
                                            text-slate-800
                                        "
                                    >
                                        Notifications
                                    </h3>

                                    {unreadCount > 0 && (
                                        <p
                                            className="
                                                text-xs
                                                text-slate-400
                                                mt-0.5
                                            "
                                        >
                                            {unreadCount} unread
                                        </p>
                                    )}
                                </div>

                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleMarkAllAsRead
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-1
                                            text-xs
                                            font-medium
                                            text-violet-600
                                            hover:text-violet-800
                                        "
                                    >
                                        <FiCheck
                                            size={14}
                                        />

                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* Notification list */}

                            <div
                                className="
                                    max-h-96
                                    overflow-y-auto
                                "
                            >
                                {notifications.length ===
                                    0 && (
                                    <div
                                        className="
                                            px-5
                                            py-10
                                            text-center
                                        "
                                    >
                                        <FiBell
                                            size={28}
                                            className="
                                                mx-auto
                                                text-slate-300
                                            "
                                        />

                                        <p
                                            className="
                                                mt-3
                                                text-sm
                                                font-medium
                                                text-slate-700
                                            "
                                        >
                                            No notifications
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-xs
                                                text-slate-400
                                            "
                                        >
                                            You're all caught
                                            up.
                                        </p>
                                    </div>
                                )}

                                {notifications.map(
                                    (notification) => (
                                        <button
                                            key={
                                                notification._id
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification
                                                )
                                            }
                                            className={`
                                                w-full
                                                text-left
                                                px-4
                                                py-3
                                                border-b
                                                border-slate-100
                                                transition
                                                hover:bg-slate-50
                                                ${
                                                    !notification.isRead
                                                        ? "bg-violet-50/50"
                                                        : "bg-white"
                                                }
                                            `}
                                        >
                                            <div className="flex gap-3">

                                                {/* Unread dot */}

                                                <div className="pt-1.5 w-2">
                                                    {!notification.isRead && (
                                                        <span
                                                            className="
                                                                block
                                                                w-2
                                                                h-2
                                                                rounded-full
                                                                bg-violet-600
                                                            "
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">

                                                    <p
                                                        className="
                                                            text-sm
                                                            font-semibold
                                                            text-slate-800
                                                        "
                                                    >
                                                        {
                                                            notification.title
                                                        }
                                                    </p>

                                                    <p
                                                        className="
                                                            mt-1
                                                            text-sm
                                                            text-slate-600
                                                        "
                                                    >
                                                        {
                                                            notification.message
                                                        }
                                                    </p>

                                                    <p
                                                        className="
                                                            mt-1.5
                                                            text-xs
                                                            text-slate-400
                                                        "
                                                    >
                                                        {formatNotificationTime(
                                                            notification.createdAt
                                                        )}
                                                    </p>

                                                </div>
                                            </div>
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <UserAvatar />

            </div>
        </header>
    );
}

export default Navbar;