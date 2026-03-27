import { Router } from "express";
import { AppController } from "../controllers/app.controller";

const router = Router();

// Parents
router.post("/parents", AppController.createParent);
router.get("/parents/:id", AppController.getParentById);

// Students
router.post("/students", AppController.createStudent);
router.get("/students/:id", AppController.getStudentById);

// Classes
router.post("/classes", AppController.createClass);
router.get("/classes", AppController.getClasses);
router.post("/classes/:classId/register", AppController.registerStudentToClass);

// Registrations
router.delete("/registrations/:id", AppController.cancelRegistration);

// Subscriptions
router.post("/subscriptions", AppController.createSubscription);
router.get("/subscriptions/:id", AppController.getSubscriptionById);
router.patch("/subscriptions/:id/use", AppController.useSubscriptionSession);

export default router;