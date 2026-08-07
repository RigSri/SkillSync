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
                bg-white
                border-b
                border-slate-200
                flex
                items-center
                justify-between
                px-8
            "
        >

            {/* Left */}

            <div className="flex items-center gap-5">

                <button
                    className="
                        p-2
                        rounded-lg
                        hover:bg-slate-100
                        transition
                    "
                >
                    <FiMenu size={22} />
                </button>

                <h1
                    className="
                        text-2xl
                        font-semibold
                        text-slate-800
                    "
                >
                    {pageTitle}
                </h1>

            </div>

            {/* Right */}

            <div className="flex items-center gap-6">

                <SearchBar />

                <button
                    className="
                        p-2
                        rounded-lg
                        hover:bg-slate-100
                        transition
                    "
                >
                    <FiBell size={22} />
                </button>

                <UserAvatar />

            </div>

        </header>

    );
}

export default Navbar;