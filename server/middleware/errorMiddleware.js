const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Mongoose invalid ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid resource ID.",
        });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(
            (error) => error.message
        );

        return res.status(400).json({
            success: false,
            message: messages.join(", "),
        });
    }

    // MongoDB duplicate key
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate resource already exists.",
        });
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

module.exports = errorHandler;