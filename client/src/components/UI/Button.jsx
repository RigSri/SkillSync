function Button({
    children,
    variant = "primary",
    type = "button",
    onClick,
    className = "",
}) {
    const variants = {
        primary:
            "bg-violet-600 hover:bg-violet-700 text-white",

        secondary:
            "bg-slate-100 hover:bg-slate-200 text-slate-900",

        danger:
            "bg-red-600 hover:bg-red-700 text-white",

        ghost:
            "hover:bg-slate-100 text-slate-700",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`
                px-5
                h-10
                rounded-xl
                font-medium
                transition-all
                duration-200
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </button>
    );
}

export default Button;