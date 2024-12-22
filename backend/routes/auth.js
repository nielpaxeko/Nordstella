import express from "express";
import { updateUserProfile } from "../models/userModel.js"
import upload from "../middleware/uploadProfilePicture.js";

const router = express.Router();




export default router;
