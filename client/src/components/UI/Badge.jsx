function Badge({
    children,
    variant = "primary",
}) {
    const variants = {
        primary:
            "bg-violet-100 text-violet-700",

        success:
            "bg-green-100 text-green-700",

        warning:
            "bg-yellow-100 text-yellow-700",

        danger:
            "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`
                px-3
                py-1
                rounded-full
                text-xs
                font-medium
                ${variants[variant]}
            `}
        >
            {children}
        </span>
    );
}

export default Badge;