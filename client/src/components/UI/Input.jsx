function Input({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
}) {
    return (
        <div className="flex flex-col gap-2">

            {label && (
                <label className="text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="
                    h-11
                    rounded-xl
                    border
                    border-slate-300
                    px-4
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

export default Input;