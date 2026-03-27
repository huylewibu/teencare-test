import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { getNextOccurrence } from "../utils/nextOccurrenceAt";

function parseTimeRange(timeSlot: string) {
  const [start, end] = timeSlot.split("-").map((s) => s.trim());
  return { start, end };
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function isOverlap(slotA: string, slotB: string) {
  const a = parseTimeRange(slotA);
  const b = parseTimeRange(slotB);

  const aStart = timeToMinutes(a.start);
  const aEnd = timeToMinutes(a.end);
  const bStart = timeToMinutes(b.start);
  const bEnd = timeToMinutes(b.end);

  return aStart < bEnd && bStart < aEnd;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const AppController = {
  async createParent(req: Request, res: Response) {
    try {
      const { name, phone, email } = req.body;

      if (!name || !phone || !email) {
        return res.status(400).json({ message: "Missing required parent fields" });
      }

      const parent = await prisma.parent.create({
        data: { name, phone, email },
      });

      return res.status(201).json(parent);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getParentById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const parent = await prisma.parent.findUnique({
        where: { id },
        include: {
          students: true,
        },
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      return res.json(parent);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getParents(req: Request, res: Response) {
    try {
      const parents = await prisma.parent.findMany({
        orderBy: { id: "desc" },
      });

      return res.json(parents);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getStudents(req: Request, res: Response) {
    try {
      const students = await prisma.student.findMany({
        include: {
          parent: true,
        },
        orderBy: { id: "desc" },
      });

      return res.json(students);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async createStudent(req: Request, res: Response) {
    try {
      const { name, dob, gender, current_grade, parent_id } = req.body;

      if (!name || !dob || !gender || !current_grade || !parent_id) {
        return res.status(400).json({
          message:
            "Missing required student fields: name, dob, gender, current_grade, parent_id",
        });
      }

      const parent = await prisma.parent.findUnique({
        where: { id: Number(parent_id) },
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      const student = await prisma.student.create({
        data: {
          name,
          dob: new Date(dob),
          gender,
          currentGrade: current_grade,
          parentId: Number(parent_id),
        },
        include: {
          parent: true,
        },
      });

      return res.status(201).json(student);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getStudentById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          parent: true,
          subscriptions: {
            include: {
              subscriptionPlan: true,
            },
            orderBy: {
              id: "desc",
            },
          },
          registrations: {
            include: {
              class: true,
              studentSubscription: {
                include: {
                  subscriptionPlan: true,
                },
              },
            },
            orderBy: {
              id: "desc",
            },
          },
        },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      return res.json(student);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async createClass(req: Request, res: Response) {
    try {
      const {
        name,
        subject,
        day_of_week,
        time_slot,
        teacher_name,
        max_students,
      } = req.body;

      if (!name || !subject || !day_of_week || !time_slot || !teacher_name || !max_students) {
        return res.status(400).json({ message: "Missing required class fields" });
      }

      const createdClass = await prisma.class.create({
        data: {
          name,
          subject,
          dayOfWeek: day_of_week,
          timeSlot: time_slot,
          teacherName: teacher_name,
          maxStudents: Number(max_students),
        },
      });

      return res.status(201).json(createdClass);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getClasses(req: Request, res: Response) {
    try {
      const day = req.query.day as string | undefined;

      const classes = await prisma.class.findMany({
        where: day ? { dayOfWeek: day } : {},
        include: {
          registrations: {
            include: {
              student: true,
            },
          },
        },
        orderBy: [{ dayOfWeek: "asc" }, { timeSlot: "asc" }],
      });

      const mapped = classes.map((item) => ({
        ...item,
        registered_count: item.registrations.length,
      }));

      return res.json(mapped);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async createSubscriptionPlan(req: Request, res: Response) {
    try {
      const { name, total_sessions, duration_days, is_active } = req.body;

      if (!name || !total_sessions || !duration_days) {
        return res.status(400).json({
          message: "Missing required subscription plan fields",
        });
      }

      const plan = await prisma.subscriptionPlan.create({
        data: {
          name,
          totalSessions: Number(total_sessions),
          durationDays: Number(duration_days),
          isActive: is_active == null ? true : Boolean(is_active),
        },
      });

      return res.status(201).json(plan);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getSubscriptionPlans(req: Request, res: Response) {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { id: "desc" },
      });

      return res.json(plans);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getSubscriptionPlanById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id },
      });

      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }

      return res.json(plan);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async createStudentSubscription(req: Request, res: Response) {
    try {
      const { student_id, subscription_plan_id, start_date } = req.body;

      if (!student_id || !subscription_plan_id || !start_date) {
        return res.status(400).json({
          message: "Missing required student subscription fields",
        });
      }

      const student = await prisma.student.findUnique({
        where: { id: Number(student_id) },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: Number(subscription_plan_id) },
      });

      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }

      if (!plan.isActive) {
        return res.status(400).json({ message: "Subscription plan is inactive" });
      }

      const startDate = new Date(start_date);
      const endDate = addDays(startDate, plan.durationDays);

      const subscription = await prisma.studentSubscription.create({
        data: {
          studentId: Number(student_id),
          subscriptionPlanId: Number(subscription_plan_id),
          startDate,
          endDate,
          totalSessionsSnapshot: plan.totalSessions,
          usedSessions: 0,
        },
        include: {
          student: true,
          subscriptionPlan: true,
        },
      });

      return res.status(201).json(subscription);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getStudentSubscriptionById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const subscription = await prisma.studentSubscription.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              parent: true,
            },
          },
          subscriptionPlan: true,
        },
      });

      if (!subscription) {
        return res.status(404).json({ message: "Student subscription not found" });
      }

      return res.json(subscription);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async useStudentSubscriptionSession(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const subscription = await prisma.studentSubscription.findUnique({
        where: { id },
      });

      if (!subscription) {
        return res.status(404).json({ message: "Student subscription not found" });
      }

      const now = new Date();

      if (subscription.endDate < now) {
        return res.status(400).json({ message: "Student subscription expired" });
      }

      if (subscription.usedSessions >= subscription.totalSessionsSnapshot) {
        return res.status(400).json({ message: "No remaining sessions" });
      }

      const updated = await prisma.studentSubscription.update({
        where: { id },
        data: {
          usedSessions: subscription.usedSessions + 1,
        },
        include: {
          student: true,
          subscriptionPlan: true,
        },
      });

      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getStudentSubscriptions(req: Request, res: Response) {
    try {
      const subscriptions = await prisma.studentSubscription.findMany({
        include: {
          student: {
            include: {
              parent: true,
            },
          },
          subscriptionPlan: true,
        },
        orderBy: { id: "desc" },
      });

      return res.json(subscriptions);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async registerStudentToClass(req: Request, res: Response) {
    try {
      const classId = Number(req.params.classId);
      const { student_id } = req.body;

      if (!student_id) {
        return res.status(400).json({
          message: "student_id is required",
        });
      }

      const cls = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          registrations: true,
        },
      });

      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }

      const student = await prisma.student.findUnique({
        where: { id: Number(student_id) },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      if (cls.registrations.length >= cls.maxStudents) {
        return res.status(400).json({ message: "Class is full" });
      }

      const existingRegistration = await prisma.classRegistration.findFirst({
        where: {
          classId,
          studentId: Number(student_id),
        },
      });

      if (existingRegistration) {
        return res.status(400).json({
          message: "Student already registered in this class",
        });
      }

      const nextOccurrenceAt = getNextOccurrence(cls.dayOfWeek, cls.timeSlot);

      const studentRegistrations = await prisma.classRegistration.findMany({
        where: {
          studentId: Number(student_id),
        },
        include: {
          class: true,
        },
      });

      const hasTimeConflict = studentRegistrations.some((registration) => {
        return (
          registration.nextOccurrenceAt.getTime() === nextOccurrenceAt.getTime() &&
          isOverlap(registration.class.timeSlot, cls.timeSlot)
        );
      });

      if (hasTimeConflict) {
        return res.status(400).json({
          message: "Student has another class that overlaps this time slot",
        });
      }

      const activeSubscriptions = await prisma.studentSubscription.findMany({
        where: {
          studentId: Number(student_id),
          startDate: {
            lte: nextOccurrenceAt,
          },
          endDate: {
            gte: nextOccurrenceAt,
          },
        },
        orderBy: {
          endDate: "asc",
        },
        include: {
          subscriptionPlan: true,
        },
      });

      const validSubscription = activeSubscriptions.find(
        (item) => item.usedSessions < item.totalSessionsSnapshot
      );

      if (!validSubscription) {
        return res.status(400).json({
          message: "No active student subscription with remaining sessions found",
        });
      }

      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const registration = await tx.classRegistration.create({
          data: {
            classId,
            studentId: Number(student_id),
            studentSubscriptionId: validSubscription.id,
            nextOccurrenceAt,
          },
          include: {
            class: true,
            student: true,
            studentSubscription: {
              include: {
                subscriptionPlan: true,
              },
            },
          },
        });

        const updatedSubscription = await tx.studentSubscription.update({
          where: { id: validSubscription.id },
          data: {
            usedSessions: validSubscription.usedSessions + 1,
          },
          include: {
            subscriptionPlan: true,
          },
        });

        return {
          message: "Registered successfully",
          registration,
          studentSubscription: updatedSubscription,
        };
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async cancelRegistration(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
  
      const registration = await prisma.classRegistration.findUnique({
        where: { id },
        include: {
          class: true,
          studentSubscription: true,
        },
      });
  
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
  
      const now = new Date();
      const diffMs = registration.nextOccurrenceAt.getTime() - now.getTime();
      const refundSession = diffMs > 24 * 60 * 60 * 1000;
  
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.classRegistration.delete({
          where: { id },
        });
  
        if (
          refundSession &&
          registration.studentSubscriptionId &&
          registration.studentSubscription
        ) {
          const nextUsedSessions = Math.max(
            registration.studentSubscription.usedSessions - 1,
            0
          );
  
          await tx.studentSubscription.update({
            where: { id: registration.studentSubscriptionId },
            data: {
              usedSessions: nextUsedSessions,
            },
          });
        }
      });
  
      return res.json({
        message: refundSession
          ? "Registration cancelled and 1 session refunded"
          : "Registration cancelled without refund",
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getRegistrations(req: Request, res: Response) {
    try {
      const registrations = await prisma.classRegistration.findMany({
        include: {
          student: {
            include: {
              parent: true,
            },
          },
          class: true,
          studentSubscription: {
            include: {
              subscriptionPlan: true,
            },
          },
        },
        orderBy: { id: "desc" },
      });

      return res.json(registrations);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },
};