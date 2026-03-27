import { Router } from "express";
import { AppController } from "../controllers/app.controller";

const router = Router();

// Parents
router.post("/parents", AppController.createParent);
router.get("/parents", AppController.getParents);
router.get("/parents/:id", AppController.getParentById);

// Students
router.post("/students", AppController.createStudent);
router.get("/students", AppController.getStudents);
router.get("/students/:id", AppController.getStudentById);

// Classes
router.post("/classes", AppController.createClass);
router.get("/classes", AppController.getClasses);
router.post("/classes/:classId/register", AppController.registerStudentToClass);

// Registrations
router.get("/registrations", AppController.getRegistrations);
router.delete("/registrations/:id", AppController.cancelRegistration);

// Subscriptions
router.post("/subscription", AppController.createSubscriptionPlan);
router.get("/subscription", AppController.getSubscriptionPlans);
router.get("/subscription/:id", AppController.getSubscriptionPlanById);

router.post("/student-subscriptions", AppController.createStudentSubscription);
router.get("/student-subscriptions", AppController.getStudentSubscriptions);
router.get("/student-subscriptions/:id", AppController.getStudentSubscriptionById);
router.patch("/student-subscriptions/:id/use", AppController.useStudentSubscriptionSession);

router.post("/classes/:classId/register", AppController.registerStudentToClass);
router.delete("/registrations/:id", AppController.cancelRegistration);
router.get("/registrations", AppController.getRegistrations);

export default router;