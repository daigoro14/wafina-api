import express, { Request, Response } from "express";
import Tour from "../models/tourModel";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";


const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { attractions, description, time, date } = req.body;

  if (!attractions || !description || !time || !date) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const existingTour = await Tour.findOne({ date });

    if (existingTour) {
      res.status(400).json({ error: 'A tour already exists for this date' });
      return;
    }

    const newTour = new Tour({
      attractions,
      description,
      time,
      date
    });

    await newTour.save();

    res.status(201).json(newTour);
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) { 
      res.status(400).json({ error: 'A tour already exists for this date' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});


router.get("/", authenticateJWT, authorizeRoles(["admin", "superAdmin"]), async (req: Request, res: Response): Promise<void> => {
  try {
    let query: any = {};

    if (req.query.earliest) {
      query.date = { $gte: req.query.earliest };
    }

    if (req.query.latest) {
      query.date = { ...query.date, $lte: req.query.latest }; 
    }

    const tours = await Tour.find(query).sort({ date: 1 });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error });
  }
});

router.get("/public", async (req: Request, res: Response): Promise<void> => {
  try {
    let query: any = {};

    if (req.query.earliest) {
      query.date = { $gte: req.query.earliest };
    }

    if (req.query.latest) {
      query.date = { ...query.date, $lte: req.query.latest }; 
    }

    const tours = await Tour.find(query)
      .sort({ date: 1 })
      .select("attractions description time date customers"); 

    const formattedTours = tours.map(tour => ({
      ...tour.toObject(),
      customers: tour.customers.length
    }));

    res.json(formattedTours);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error });
  }
});



router.get('/:date', authenticateJWT, authorizeRoles(["admin", "superAdmin"]), async (req: Request, res: Response): Promise<void> => {
  const { date } = req.params;

  try {
    const tour = await Tour.findOne({ date });

    if (!tour) {
      res.status(404).json({ error: `Tour not found for the date: ${date}` });
      return;
    }

    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/public/:date', async (req: Request, res: Response): Promise<void> => {
  const { date } = req.params;

  try {
    const tour = await Tour.findOne({ date });

    if (!tour) {
      res.status(404).json({ error: `Tour not found for the date: ${date}` });
      return;
    }

    const customerCount = tour.customers ? tour.customers.length : 0;

    res.json({ 
      ...tour.toObject(), 
      customers: customerCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put("/:date", async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.params;

        const updatedTour = await Tour.findOneAndUpdate(
            { date }, 
            req.body, 
            { new: true }
        );

        if (!updatedTour) {
            res.status(404).json({ error: "Tour not found for the specified date" });
            return;
        }

        res.json({ message: "Tour updated successfully", tour: updatedTour });
        return;
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
        return;
    }
});


router.delete("/:date", async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.params;
        const deletedTour = await Tour.findOneAndDelete({ date });

        if (!deletedTour) {
            res.status(404).json({ error: `No tour found for the date: ${date}` });
            return;
        }

        res.json({ message: "Tour deleted successfully" });
        return;
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
        return;
    }
});


export default router;
