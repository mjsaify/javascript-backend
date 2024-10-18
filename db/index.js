import mongoose from "mongoose";
import { DB_NAME, DB_URI } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstacnce = await mongoose.connect(DB_URI + "/" + DB_NAME);
        console.log("DB Connection OK");
        return connectionInstacnce; // Return the connection to be used if necessary

    } catch (error) {
        throw new Error(`DB Connection Error: ${error.message}`); // Throw error to handle it globally
    }
};


export default connectDB;