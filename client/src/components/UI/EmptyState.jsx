function EmptyState({
    title,
    description,
}) {
    return (
        <div className="text-center py-20">

            <h2 className="text-xl font-semibold text-slate-800">
                {title}
            </h2>

            <p className="mt-2 text-slate-500">
                {description}
            </p>

        </div>
    );
}

export default EmptyState;