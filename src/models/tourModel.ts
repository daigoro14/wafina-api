import mongoose, { Schema, Document } from 'mongoose';

const customerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

const tourSchema = new Schema({
  attractions: { type: [String], required: true },
  description: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true },
  customers: { type: [customerSchema], default: [] },  
});

tourSchema.pre('save', function (next) {
  const tour = this as any;

  if (tour.customers.length > 15) {
    return next(new Error('Cannot have more than 15 customers for this tour.'));
  }

  for (const customer of tour.customers) {
    const emailExists = tour.customers.some(
      (existingCustomer: any) => existingCustomer.email === customer.email && existingCustomer !== customer
    );
    const phoneExists = tour.customers.some(
      (existingCustomer: any) => existingCustomer.phone === customer.phone && existingCustomer !== customer
    );

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
const Tour = mongoose.model('Tour', tourSchema);

export default Tour;
