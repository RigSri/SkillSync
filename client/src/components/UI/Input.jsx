function Input({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block mb-2 text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
                className="
                    w-full
                    h-11
                    rounded-lg
                    border
                    border-slate-300
                    px-4
                    text-sm
                    text-slate-900
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:border-violet-500
                    focus:ring-2
                    focus:ring-violet-100
                "
            />
        </div>
    );
}

export default Input;