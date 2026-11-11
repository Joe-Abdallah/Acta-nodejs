require("dotenv").config();
const app  = require("./app");
/**
 * Application entry point.
 *
 * Loads environment variables from .env, then starts the Express server
 * on the port specified by the PORT environment variable.
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SERVER running on http://localhost:${PORT}`);
});
