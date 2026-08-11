const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getOrCreateConversation,
    sendMessage,
    getMessages,
    getMyConversations,
} = require("../controllers/chatController");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            ".pdf",
            ".doc",
            ".docx",
            ".png",
            ".jpg",
            ".jpeg",
        ];

        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        if (!allowedTypes.includes(extension)) {
            return cb(
                new Error(
                    "Only PDF, DOC, DOCX, PNG, JPG and JPEG files are allowed."
                )
            );
        }

        cb(null, true);
    },
});


// Get all conversations for logged-in user
router.get(
    "/my-conversations",
    authMiddleware,
    getMyConversations
);


// Create/get conversation for an active match
router.post(
    "/conversations",
    authMiddleware,
    getOrCreateConversation
);


// Send message
router.post(
    "/messages",
    authMiddleware,
    sendMessage
);


// Get conversation messages
router.get(
    "/conversations/:conversationId/messages",
    authMiddleware,
    getMessages
);


// Upload chat attachment
router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded.",
            });
        }

        const extension = path
            .extname(req.file.originalname)
            .toLowerCase()
            .replace(".", "");

        return res.status(201).json({
            success: true,
            message: "File uploaded successfully.",
            data: {
                name: req.file.originalname,
                url: `http://localhost:5000/uploads/${req.file.filename}`,
                type: extension,
            },
        });
    }
);


module.exports = router;