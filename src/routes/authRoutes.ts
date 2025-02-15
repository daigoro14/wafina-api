import express, { Request, Response } from "express";
import passport from "passport";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: "Invalid email or password" });

        req.logIn(user, { session: false }, async (err) => {
            if (err) return next(err);

            const accessToken = jwt.sign(
                { 
                    id: user._id, 
                    email: user.email, 
                    roles: user.roles,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName
                },
                process.env.JWT_SECRET || "supersecretkey",
                { expiresIn: "5min" } 
            );

            const refreshToken = jwt.sign(
                { 
                    id: user._id, 
                    email: user.email, 
                    roles: user.roles,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName
                },
                process.env.JWT_SECRET || "supersecretkey",
                { expiresIn: "7d" } 
            );

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

router.post("/logout", async (req: Request, res: Response):Promise <void> => {
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
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/refreshToken", async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ error: "Refresh token is required" });
        return;
    }

    try {
        const decoded = await new Promise<any>((resolve, reject) => {
            jwt.verify(refreshToken, process.env.JWT_SECRET || "supersecretkey", (err, decoded) => {
                if (err) {
                    reject(new Error("Invalid or expired refresh token"));
                } else {
                    resolve(decoded);
                }
            });
        });

        const accessToken = jwt.sign(
            { 
                id: decoded.id, 
                email: decoded.email, 
                roles: decoded.roles,
                firstName: decoded.firstName,
                lastName: decoded.lastName,
                fullName: decoded.fullName
            },
            process.env.JWT_SECRET || "supersecretkey",
            { expiresIn: "5min" } 
        );

        res.json({ accessToken, refreshToken });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

router.get('/session', (req: Request, res: Response): Promise<void> => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        res.json({ user: decoded });
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
});

export default router;
