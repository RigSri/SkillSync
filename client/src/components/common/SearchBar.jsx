import { FiSearch } from "react-icons/fi";

function SearchBar() {
    return (
        <div className="relative hidden md:block">

            <FiSearch
                className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                "
                size={18}
            />

            <input
                type="text"
                placeholder="Search..."
                className="
                    w-72
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    pl-11
                    pr-4
                    py-2.5
                    outline-none
                    transition
                    focus:border-violet-500
                    focus:ring-2
                    focus:ring-violet-200
                "
            />

        </div>
    );
}

export default SearchBar;