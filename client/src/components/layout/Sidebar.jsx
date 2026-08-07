import { NavLink } from "react-router-dom";
import { FiUsers, FiBook, FiMail, FiUser, FiLogOut } from "react-icons/fi";

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
        name: "Profile",
        path: "/profile",
        icon: FiUser,
    },
];

function Sidebar() {
    return (
        <aside className="w-60 bg-[#111827] text-white flex flex-col border-r border-slate-800">

            {/* Logo */}

            <div className="h-16 flex items-center px-6 border-b border-slate-800">

                <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-lg">
                    S
                </div>

                <span className="ml-3 text-2xl font-bold tracking-tight">
                    SkillSync
                </span>

            </div>

            {/* Navigation */}

            <nav className="flex-1 mt-6 px-4">

                {navigation.map((item) => {

                    const Icon = item.icon;

                    return (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 rounded-xl px-4 py-3 mb-2 transition-all duration-200

                                ${
                                    isActive
                                        ? "bg-violet-600 text-white shadow-md"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`
                            }
                        >
                            <Icon size={20} />

                            <span className="text-base font-medium">
                                {item.name}
                            </span>

                        </NavLink>

                    );

                })}

            </nav>

            {/* Logout */}

            <div className="border-t border-slate-800 p-4">

                <button
                    className="
                        w-full
                        flex
                        items-center
                        gap-4
                        rounded-xl
                        px-4
                        py-3
                        text-slate-300
                        hover:bg-red-600
                        hover:text-white
                        transition
                    "
                >
                    <FiLogOut size={20} />

                    Logout

                </button>

            </div>

        </aside>
    );
}

export default Sidebar;