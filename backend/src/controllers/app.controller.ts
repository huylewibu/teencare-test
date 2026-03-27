import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

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

  async createStudent(req: Request, res: Response) {
    try {
      const { name, dob, gender, current_grade, parent_id } = req.body;

      if (!name || !dob || !gender || !current_grade || !parent_id) {
        return res.status(400).json({ message: "Missing required student fields" });
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
          subscriptions: true,
          registrations: {
            include: {
              class: true,
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
        start_at,
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
          startAt: start_at ? new Date(start_at) : null,
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
        orderBy: [
          { dayOfWeek: "asc" },
          { timeSlot: "asc" },
        ],
      });

      return res.json(classes);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async createSubscription(req: Request, res: Response) {
    try {
      const {
        student_id,
        package_name,
        start_date,
        end_date,
        total_sessions,
        used_sessions,
      } = req.body;

      if (!student_id || !package_name || !start_date || !end_date || !total_sessions) {
        return res.status(400).json({ message: "Missing required subscription fields" });
      }

      const student = await prisma.student.findUnique({
        where: { id: Number(student_id) },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const subscription = await prisma.subscription.create({
        data: {
          studentId: Number(student_id),
          packageName: package_name,
          startDate: new Date(start_date),
          endDate: new Date(end_date),
          totalSessions: Number(total_sessions),
          usedSessions: Number(used_sessions || 0),
        },
      });

      return res.status(201).json(subscription);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getSubscriptionById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: {
          student: true,
        },
      });

      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      return res.json(subscription);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async useSubscriptionSession(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const subscription = await prisma.subscription.findUnique({
        where: { id },
      });

      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      if (new Date(subscription.endDate) < new Date()) {
        return res.status(400).json({ message: "Subscription expired" });
      }

      if (subscription.usedSessions >= subscription.totalSessions) {
        return res.status(400).json({ message: "No remaining sessions" });
      }

      const updated = await prisma.subscription.update({
        where: { id },
        data: {
          usedSessions: subscription.usedSessions + 1,
        },
      });

      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async registerStudentToClass(req: Request, res: Response) {
    try {
      const classId = Number(req.params.classId);
      const { student_id } = req.body;

      if (!student_id) {
        return res.status(400).json({ message: "student_id is required" });
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
        return res.status(400).json({ message: "Student already registered in this class" });
      }

      const studentRegistrations = await prisma.classRegistration.findMany({
        where: {
          studentId: Number(student_id),
        },
        include: {
          class: true,
        },
      });

      const hasTimeConflict = studentRegistrations.some((registration: {
        class: {
          dayOfWeek: string;
          timeSlot: string;
        };
      }) => {
        return (
          registration.class.dayOfWeek === cls.dayOfWeek &&
          isOverlap(registration.class.timeSlot, cls.timeSlot)
        );
      });

      if (hasTimeConflict) {
        return res.status(400).json({
          message: "Student has another class that overlaps this time slot",
        });
      }

      const now = new Date();

      const validSubscription = await prisma.subscription.findFirst({
        where: {
          studentId: Number(student_id),
          endDate: {
            gte: now,
          },
        },
        orderBy: {
          endDate: "desc",
        },
      });

      if (!validSubscription) {
        return res.status(400).json({ message: "No valid subscription found" });
      }

      if (validSubscription.usedSessions >= validSubscription.totalSessions) {
        return res.status(400).json({ message: "Subscription has no remaining sessions" });
      }

      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const registration = await tx.classRegistration.create({
          data: {
            classId,
            studentId: Number(student_id),
            subscriptionId: validSubscription.id,
          },
          include: {
            class: true,
            student: true,
            subscription: true,
          },
        });

        const updatedSubscription = await tx.subscription.update({
          where: { id: validSubscription.id },
          data: {
            usedSessions: validSubscription.usedSessions + 1,
          },
        });

        return {
          registration,
          subscription: updatedSubscription,
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
          subscription: true,
        },
      });

      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      let refundSession = false;

      if (registration.class.startAt) {
        const diffMs = new Date(registration.class.startAt).getTime() - Date.now();
        const diffHours = diffMs / (1000 * 60 * 60);
        refundSession = diffHours > 24;
      }

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.classRegistration.delete({
          where: { id },
        });

        if (refundSession && registration.subscriptionId && registration.subscription) {
          const nextUsedSessions = Math.max(registration.subscription.usedSessions - 1, 0);

          await tx.subscription.update({
            where: { id: registration.subscriptionId },
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
};