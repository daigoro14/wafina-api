"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
router.post("/login", (req, res, next) => {
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err)
            return next(err);
        if (!user)
            return res.status(401).json({ error: "Invalid email or password" });
        req.logIn(user, { session: false }, async (err) => {
            if (err)
                return next(err);
            const accessToken = jsonwebtoken_1.default.sign({
                id: user._id,
                email: user.email,
                roles: user.roles,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName
            }, process.env.JWT_SECRET || "supersecretkey", { expiresIn: "5min" });
            const refreshToken = jsonwebtoken_1.default.sign({
                id: user._id,
                email: user.email,
                roles: user.roles,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName
            }, process.env.JWT_SECRET || "supersecretkey", { expiresIn: "7d" });
            res.json({
                message: "Login successful",
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    roles: user.roles
                }
            });
        });
    })(req, res, next);
});
router.post("/logout", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }
        // If using a database, store invalidated tokens (optional)
        // await BlacklistedToken.create({ token: refreshToken });
        res.clearCookie("auth.access-token");
        res.clearCookie("auth.refresh-token");
        res.status(200).json({ message: "Logout successful" });
        return;
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/refreshToken", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ error: "Refresh token is required" });
        return;
    }
    try {
        const decoded = await new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET || "supersecretkey", (err, decoded) => {
                if (err) {
                    reject(new Error("Invalid or expired refresh token"));
                }
                else {
                    resolve(decoded);
                }
            });
        });
        const accessToken = jsonwebtoken_1.default.sign({
            id: decoded.id,
            email: decoded.email,
            roles: decoded.roles,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            fullName: decoded.fullName
        }, process.env.JWT_SECRET || "supersecretkey", { expiresIn: "5min" });
        res.json({ accessToken, refreshToken });
    }
    catch (err) {
        res.status(403).json({ error: err.message });
    }
});
router.get('/session', (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        res.json({ user: decoded });
    }
    catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
});
exports.default = router;
