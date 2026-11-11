const express          = require("express");
const ClientController = require("../controllers/client.controller");
const { authenticate } = require("../middleware/auth.middleware");

/**
 * @module clientRoutes
 *
 * Client routes — all routes require a valid JWT token.
 * Mounted at /api/v1/clients in app.js.
 *
 * GET    /api/v1/clients      → Get all registered clients.
 * GET    /api/v1/clients/:id  → Get a single client by ID.
 * PUT    /api/v1/clients/:id  → Update own account (owner only).
 * DELETE /api/v1/clients/:id  → Delete own account (owner only).
 */
const router = express.Router();

// Apply authentication middleware to every route in this file
router.use(authenticate);

router.get("/",       ClientController.getAll);
router.get("/:id",    ClientController.getById);
router.put("/:id",    ClientController.update);
router.delete("/:id", ClientController.deleteById);

module.exports = router;