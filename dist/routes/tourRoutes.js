"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tourModel_1 = __importDefault(require("../models/tourModel"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const { attractions, description, time, date } = req.body;
    if (!attractions || !description || !time || !date) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    try {
        const existingTour = await tourModel_1.default.findOne({ date });
        if (existingTour) {
            res.status(400).json({ error: 'A tour already exists for this date' });
            return;
        }
        const newTour = new tourModel_1.default({
            attractions,
            description,
            time,
            date
        });
        await newTour.save();
        res.status(201).json(newTour);
    }
    catch (error) {
        console.error(error);
        if (error.code === 11000) {
            res.status(400).json({ error: 'A tour already exists for this date' });
        }
        else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});
router.get("/", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRoles)(["admin", "superAdmin"]), async (req, res) => {
    try {
        let query = {};
        if (req.query.earliest) {
            query.date = { $gte: req.query.earliest };
        }
        if (req.query.latest) {
            query.date = { ...query.date, $lte: req.query.latest };
        }
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");
            query.$or = [
                { attractions: searchRegex },
                { description: searchRegex },
                { time: searchRegex },
            ];
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await tourModel_1.default.countDocuments(query);
        const tours = await tourModel_1.default.find(query).sort({ date: 1 }).skip(skip).limit(limit);
        res.json({ tours, total });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});
router.get("/public", async (req, res) => {
    try {
        let query = {};
        if (req.query.earliest) {
            query.date = { $gte: req.query.earliest };
        }
        if (req.query.latest) {
            query.date = { ...query.date, $lte: req.query.latest };
        }
        const tours = await tourModel_1.default.find(query)
            .sort({ date: 1 })
            .select("attractions description time date customers");
        const formattedTours = tours.map(tour => ({
            ...tour.toObject(),
            customers: tour.customers.length
        }));
        res.json(formattedTours);
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});
router.get('/:date', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRoles)(["admin", "superAdmin"]), async (req, res) => {
    const { date } = req.params;
    try {
        const tour = await tourModel_1.default.findOne({ date });
        if (!tour) {
            res.status(404).json({ error: `Tour not found for the date: ${date}` });
            return;
        }
        res.json(tour);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/public/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const tour = await tourModel_1.default.findOne({ date });
        if (!tour) {
            res.status(404).json({ error: `Tour not found for the date: ${date}` });
            return;
        }
        const customerCount = tour.customers ? tour.customers.length : 0;
        res.json({
            ...tour.toObject(),
            customers: customerCount
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.put("/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const updatedTour = await tourModel_1.default.findOneAndUpdate({ date }, req.body, { new: true });
        if (!updatedTour) {
            res.status(404).json({ error: "Tour not found for the specified date" });
            return;
        }
        res.json({ message: "Tour updated successfully", tour: updatedTour });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error });
        return;
    }
});
router.delete("/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const deletedTour = await tourModel_1.default.findOneAndDelete({ date });
        if (!deletedTour) {
            res.status(404).json({ error: `No tour found for the date: ${date}` });
            return;
        }
        res.json({ message: "Tour deleted successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error });
        return;
    }
});
exports.default = router;
