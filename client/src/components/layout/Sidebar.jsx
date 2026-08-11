import { NavLink, useNavigate } from "react-router-dom";

import {
    FiUsers,
    FiBook,
    FiMail,
    FiMessageCircle,
    FiCalendar,
    FiUser,
    FiLogOut,
} from "react-icons/fi";

const navigation = [
    {
        name: "Matches",
        path: "/matches",
        icon: FiUsers,
    },
    {
        name: "Skills",
        path: "/skills",
        icon: FiBook,
    },
    {
        name: "Requests",
        path: "/requests",
        icon: FiMail,
    },
    {
        name: "Chat",
        path: "/chat",
        icon: FiMessageCircle,
    },
    {
        name: "Sessions",
        path: "/sessions",
        icon: FiCalendar,
    },
    {
        name: "Profile",
        path: "/profile",
        icon: FiUser,
    },
];

function Sidebar({ collapsed }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/", {
            replace: true,
        });
    };

    return (
        <aside
            className={`
                ${collapsed ? "w-20" : "w-64"}
                shrink-0
                h-screen
                bg-slate-950
                text-white
                flex
                flex-col
                border-r
                border-slate-800
                transition-all
                duration-200
            `}
        >

            {/* Logo */}

            <div
                className={`
                    h-16
                    shrink-0
                    flex
                    items-center
                    ${collapsed ? "justify-center" : "px-5"}
                    border-b
                    border-slate-800
                `}
            >

                <div
                    className="
                        w-9
                        h-9
                        shrink-0
                        rounded-lg
                        bg-violet-600
                        flex
                        items-center
                        justify-center
                        font-bold
                        text-lg
                    "
                >
                    S
                </div>

                {!collapsed && (
                    <span
                        className="
                            ml-3
                            text-xl
                            font-semibold
                            tracking-tight
                        "
                    >
                        SkillSync
                    </span>
                )}

            </div>

            {/* Navigation */}

            <nav className="flex-1 px-3 py-5">

                {navigation.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            title={
                                collapsed
                                    ? item.name
                                    : undefined
                            }
                            className={({ isActive }) =>
                                `
                                flex
                                items-center
                                ${
                                    collapsed
                                        ? "justify-center"
                                        : "gap-3"
                                }
                                rounded-lg
                                px-3
                                py-2.5
                                mb-1
                                text-sm
                                font-medium
                                transition
                                ${
                                    isActive
                                        ? "bg-violet-600 text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }
                                `
                            }
                        >
                            <Icon size={19} />

                            {!collapsed && (
                                <span>
                                    {item.name}
                                </span>
                            )}

                        </NavLink>
                    );
                })}

            </nav>

            {/* Logout */}

            <div
                className="
                    border-t
                    border-slate-800
                    p-3
                "
            >

                <button
                    type="button"
                    title={
                        collapsed
                            ? "Logout"
                            : undefined
                    }
                    onClick={handleLogout}
                    className={`
                        w-full
                        flex
                        items-center
                        ${
                            collapsed
                                ? "justify-center"
                                : "gap-3"
                        }
                        rounded-lg
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        text-slate-300
                        hover:bg-red-600
                        hover:text-white
                        transition
                    `}
                >
                    <FiLogOut size={19} />

                    {!collapsed && (
                        <span>
                            Logout
                        </span>
                    )}

                </button>

            </div>

        </aside>
    );
}

export default Sidebar;