import express, { Request, Response } from "express";
import Tour from "../models/tourModel";

const router = express.Router();


router.put("/newCustomer/:tourDate", async (req: Request, res: Response): Promise<void> => {
  const { tourDate } = req.params;
  const { firstName, lastName, email, phone } = req.body;

  if (!firstName || !lastName || !email || !phone) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const tour = await Tour.findOne({ date: tourDate });

    if (!tour) {
      res.status(404).json({ error: "Tour not found for this date" });
      return;
    }

    if (!tour.customers) {
      tour.customers = [];
    }

    const customerExists = tour.customers.some(
      (customer: { email: string; phone: string }) =>
        customer.email === email || customer.phone === phone
    );

    if (customerExists) {
      res.status(400).json({ error: "A customer with this email or phone already exists in this tour" });
      return;
    }

    tour.customers.push({ firstName, lastName, email, phone });

    await tour.save();

    res.json({ message: "Booking successful", tour });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error });
  }
});

export default router;
