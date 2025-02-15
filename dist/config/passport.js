"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const userModel_1 = __importDefault(require("../models/userModel"));
passport_1.default.use(new passport_local_1.Strategy({ usernameField: "email" }, userModel_1.default.authenticate()));
passport_1.default.serializeUser(userModel_1.default.serializeUser());
passport_1.default.deserializeUser(userModel_1.default.deserializeUser());
exports.default = passport_1.default;
