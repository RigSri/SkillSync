function UserAvatar() {
    return (

        <div className="flex items-center gap-3">

            <div className="text-right">

                <p className="text-sm text-slate-500">
                    Welcome back
                </p>

                <h3 className="font-semibold text-slate-800">
                    Hrige
                </h3>

            </div>

            <div
                className="
                    w-10
                    h-10
                    rounded-full
                    bg-violet-600
                    text-white
                    flex
                    items-center
                    justify-center
                    font-semibold
                "
            >
                H
            </div>

        </div>

    );
}

export default UserAvatar;