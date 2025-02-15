"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoURI = process.env.MONGODB_URI;
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(mongoURI);
        console.log("MongoDB Connected!");
    }
    catch (err) {
        console.error("MongoDB Connection Error: ", err);
    }
};
exports.default = connectDB;
