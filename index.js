import connectDB from './db/index.js';
import { PORT } from './constants.js';
import { app } from './app.js';

; (async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error.message);
        process.exit(1); // Gracefully exit
    }
})();



/* First way to make db connection
; (async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI + "/" + DB_NAME);
        app.on("error", (error) => {
            console.log("ERRR:", error);
            throw error;
        });

        app.listen(port, () => {
            console.log("Server is listening on", port);
        })
    } catch (error) {
        console.log("Database Connection Error", error);
    }
})();
*/