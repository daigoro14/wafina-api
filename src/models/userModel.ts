import mongoose, { Document, Schema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string; 
    roles: string[];
}

const userSchema = new Schema<IUser>({
    username: { type: String, unique: true, required: true, trim: true },
    email: { 
        type: String, 
        unique: true, 
        required: true, 
        trim: true, 
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    roles: { type: [String], default: ["user"] },
}, { timestamps: true });

userSchema.pre('save', function(next) {
    this.fullName = `${this.firstName} ${this.lastName}`;
    next();
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const User = mongoose.model<IUser>("User", userSchema);
export default User;
