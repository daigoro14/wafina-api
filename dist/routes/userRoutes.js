"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userModel_1 = __importDefault(require("../models/userModel"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post("/register", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRoles)(["superAdmin"]), async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, roles } = req.body;
        if (!username || !email || !password || !firstName || !lastName) {
            res.status(400).json({ error: "All fields are required" });
        }
        const newUser = new userModel_1.default({
            username,
            email,
            firstName,
            lastName,
            roles: roles && Array.isArray(roles) ? roles : ["user"],
        });
        const registeredUser = await userModel_1.default.register(newUser, password);
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: registeredUser._id,
                username: registeredUser.username,
                email: registeredUser.email,
                firstName: registeredUser.firstName,
                lastName: registeredUser.lastName,
                roles: registeredUser.roles
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
