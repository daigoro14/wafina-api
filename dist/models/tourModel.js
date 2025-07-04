"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const customerSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
});
const tourSchema = new mongoose_1.Schema({
    attractions: { type: [String], required: true },
    description: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true },
    customers: { type: [customerSchema], default: [] },
});
tourSchema.pre('save', function (next) {
    const tour = this;
    if (tour.customers.length > 15) {
        return next(new Error('Cannot have more than 15 customers for this tour.'));
    }
    for (const customer of tour.customers) {
        const emailExists = tour.customers.some((existingCustomer) => existingCustomer.email === customer.email && existingCustomer !== customer);
        const phoneExists = tour.customers.some((existingCustomer) => existingCustomer.phone === customer.phone && existingCustomer !== customer);
        if (emailExists) {
            return next(new Error(`Email ${customer.email} already exists within this tour.`));
        }
        if (phoneExists) {
            return next(new Error(`Phone number ${customer.phone} already exists within this tour.`));
        }
    }
    next();
});
// Define the Tour model
const Tour = mongoose_1.default.model('Tour', tourSchema);
exports.default = Tour;
