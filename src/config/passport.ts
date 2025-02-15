import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/userModel";

passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

export default passport;
