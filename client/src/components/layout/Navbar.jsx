import { FiBell, FiMenu } from "react-icons/fi";
import { useLocation } from "react-router-dom";

import SearchBar from "../common/SearchBar";
import UserAvatar from "../common/UserAvatar";

function Navbar() {
    const location = useLocation();

    const pageTitle =
        location.pathname.replace("/", "").charAt(0).toUpperCase() +
        location.pathname.replace("/", "").slice(1);

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
                    className="
                        p-2
                        rounded-lg
                        text-slate-600
                        hover:bg-slate-100
                        transition
                    "
                >
                    <FiMenu size={21} />
                </button>

                <h1
                    className="
                        text-xl
                        font-semibold
                        text-slate-800
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

                <button
                    type="button"
                    className="
                        p-2
                        rounded-lg
                        text-slate-600
                        hover:bg-slate-100
                        transition
                    "
                >
                    <FiBell size={21} />
                </button>

                <UserAvatar />

            </div>

        </header>
    );
}

export default Navbar;