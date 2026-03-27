"use client";

import { useEffect, useMemo, useState } from "react";
import {
    createParent,
    createStudent,
    createClass,
    createSubscriptionPlan,
    createStudentSubscription,
    getParents,
    getStudents,
    getClasses,
    getSubscriptionPlans,
    getStudentSubscriptions,
    getRegistrations,
    registerStudentToClass,
    cancelRegistration,
} from "../lib/api";

type Parent = {
    id: number;
    name: string;
    phone: string;
    email: string;
};

type Student = {
    id: number;
    name: string;
    dob: string;
    gender: "Male" | "Female" | "Other";
    currentGrade?: string | number;
    current_grade?: string | number;
    parentId?: number;
    parent_id?: number;
    parent?: Parent;
};

type ClassItem = {
    id: number;
    name: string;
    subject: string;
    dayOfWeek?: string;
    day_of_week?: string;
    timeSlot?: string;
    time_slot?: string;
    teacherName?: string;
    teacher_name?: string;
    maxStudents?: number;
    max_students?: number;
    registered_count?: number;
};

type SubscriptionPlan = {
    id: number;
    name: string;
    totalSessions?: number;
    total_sessions?: number;
    durationDays?: number;
    duration_days?: number;
    isActive?: boolean;
    is_active?: boolean;
};

type StudentSubscription = {
    id: number;
    studentId?: number;
    student_id?: number;
    subscriptionPlanId?: number;
    subscription_plan_id?: number;
    startDate?: string;
    start_date?: string;
    endDate?: string;
    end_date?: string;
    totalSessionsSnapshot?: number;
    total_sessions_snapshot?: number;
    usedSessions?: number;
    used_sessions?: number;
    student?: Student;
    subscriptionPlan?: SubscriptionPlan;
};

type Registration = {
    id: number;
    classId?: number;
    class_id?: number;
    studentId?: number;
    student_id?: number;
    studentSubscriptionId?: number | null;
    student_subscription_id?: number | null;
    nextOccurrenceAt?: string;
    next_occurrence_at?: string;
    class?: ClassItem;
    student?: Student;
    studentSubscription?: StudentSubscription;
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HomePage() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [parents, setParents] = useState<Parent[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
    const [studentSubscriptions, setStudentSubscriptions] = useState<StudentSubscription[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);

    const [parentForm, setParentForm] = useState({
        name: "",
        phone: "",
        email: "",
    });

    const [studentForm, setStudentForm] = useState({
        name: "",
        dob: "",
        gender: "Male" as "Male" | "Female" | "Other",
        current_grade: "",
        parent_id: "",
    });

    const [classForm, setClassForm] = useState({
        name: "",
        subject: "",
        day_of_week: "Mon",
        start_time: "",
        end_time: "",
        teacher_name: "",
        max_students: "",
    });

    const [planForm, setPlanForm] = useState({
        name: "",
        total_sessions: "",
        duration_days: "",
    });

    const [studentSubscriptionForm, setStudentSubscriptionForm] = useState({
        student_id: "",
        subscription_plan_id: "",
        start_date: "",
    });

    const [registerForm, setRegisterForm] = useState({
        student_id: "",
        class_id: "",
    });

    async function refreshAll() {
        const [
            parentRes,
            studentRes,
            classRes,
            planRes,
            studentSubscriptionRes,
            registrationRes,
        ] = await Promise.all([
            getParents(),
            getStudents(),
            getClasses(),
            getSubscriptionPlans(),
            getStudentSubscriptions(),
            getRegistrations(),
        ]);

        setParents(parentRes || []);
        setStudents(studentRes || []);
        setClasses(classRes || []);
        setSubscriptionPlans(planRes || []);
        setStudentSubscriptions(studentSubscriptionRes || []);
        setRegistrations(registrationRes || []);
    }

    useEffect(() => {
        refreshAll().catch((error) => {
            console.error(error);
            setMessage(error instanceof Error ? error.message : "Failed to load data");
        });
    }, []);

    const classesByDay = useMemo(() => {
        return days.reduce<Record<string, ClassItem[]>>((acc, day) => {
            acc[day] = classes.filter(
                (item) => (item.day_of_week || item.dayOfWeek) === day
            );
            return acc;
        }, {});
    }, [classes]);

    const handleCreateParent = async () => {
        try {
            setLoading(true);
            setMessage("");

            const created = await createParent(parentForm);
            setMessage(`Created parent: ${created?.name}`);

            setParentForm({
                name: "",
                phone: "",
                email: "",
            });

            await refreshAll();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to create parent");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudent = async () => {
        try {
            setLoading(true);
            setMessage("");

            if (!studentForm.parent_id) {
                setMessage("Please select a parent");
                return;
            }

            if (!studentForm.current_grade) {
                setMessage("Please enter current grade");
                return;
            }

            const created = await createStudent({
                name: studentForm.name,
                dob: studentForm.dob,
                gender: studentForm.gender,
                current_grade: studentForm.current_grade,
                parent_id: Number(studentForm.parent_id),
            });

            setMessage(`Created student: ${created?.name}`);

            setStudentForm({
                name: "",
                dob: "",
                gender: "Male",
                current_grade: "",
                parent_id: "",
            });

            await refreshAll();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to create student");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async () => {
        try {
            setLoading(true);
            setMessage("");

            if (!classForm.start_time || !classForm.end_time) {
                setMessage("Please select both start time and end time");
                return;
            }

            if (classForm.start_time >= classForm.end_time) {
                setMessage("End time must be later than start time");
                return;
            }

            const created = await createClass({
                name: classForm.name,
                subject: classForm.subject,
                day_of_week: classForm.day_of_week,
                time_slot: `${classForm.start_time}-${classForm.end_time}`,
                teacher_name: classForm.teacher_name,
                max_students: Number(classForm.max_students),
            });

            setMessage(`Created class: ${created?.name}`);

            setClassForm({
                name: "",
                subject: "",
                day_of_week: "Mon",
                start_time: "",
                end_time: "",
                teacher_name: "",
                max_students: "",
            });

            await refreshAll();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to create class");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubscriptionPlan = async () => {
        try {
            setLoading(true);
            setMessage("");

            const created = await createSubscriptionPlan({
                name: planForm.name,
                total_sessions: Number(planForm.total_sessions),
                duration_days: Number(planForm.duration_days),
            });

            setMessage(`Created subscription plan: ${created?.name}`);

            setPlanForm({
                name: "",
                total_sessions: "",
                duration_days: "",
            });

            await refreshAll();
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Failed to create subscription plan"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudentSubscription = async () => {
        try {
            setLoading(true);
            setMessage("");

            if (!studentSubscriptionForm.student_id) {
                setMessage("Please select a student");
                return;
            }

            if (!studentSubscriptionForm.subscription_plan_id) {
                setMessage("Please select a subscription plan");
                return;
            }

            if (!studentSubscriptionForm.start_date) {
                setMessage("Please select start date");
                return;
            }

            const created = await createStudentSubscription({
                student_id: Number(studentSubscriptionForm.student_id),
                subscription_plan_id: Number(studentSubscriptionForm.subscription_plan_id),
                start_date: studentSubscriptionForm.start_date,
            });

            setMessage(`Assigned plan to student successfully (#${created?.id})`);

            setStudentSubscriptionForm({
                student_id: "",
                subscription_plan_id: "",
                start_date: "",
            });

            await refreshAll();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to assign subscription plan to student"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            setLoading(true);
            setMessage("");

            if (!registerForm.student_id || !registerForm.class_id) {
                setMessage("Please select both student and class");
                return;
            }

            const res = await registerStudentToClass(Number(registerForm.class_id), {
                student_id: Number(registerForm.student_id),
            });

            setMessage(res?.message || "Registered successfully");

            setRegisterForm({
                student_id: "",
                class_id: "",
            });

            await refreshAll();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRegistration = async (registrationId: number) => {
        try {
            setLoading(true);
            setMessage("");

            const res = await cancelRegistration(registrationId);
            setMessage(res?.message || "Registration cancelled");

            await refreshAll();
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Failed to cancel registration"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">TeenCare Mini App</h1>
                    <p className="text-sm text-slate-600">
                        Manage parents, students, classes, subscription plans, student subscriptions, and registrations
                    </p>
                </div>

                {message && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow">
                        {message}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl bg-white p-5 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Create Parent</h2>
                        <div className="grid gap-3">
                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Parent Name</label>
                                <input
                                    className="rounded-lg border p-3"
                                    placeholder="Enter parent name"
                                    value={parentForm.name}
                                    onChange={(e) =>
                                        setParentForm({ ...parentForm, name: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Phone</label>
                                <input
                                    className="rounded-lg border p-3"
                                    placeholder="Enter phone number"
                                    value={parentForm.phone}
                                    onChange={(e) =>
                                        setParentForm({ ...parentForm, phone: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Email</label>
                                <input
                                    className="rounded-lg border p-3"
                                    placeholder="Enter email"
                                    value={parentForm.email}
                                    onChange={(e) =>
                                        setParentForm({ ...parentForm, email: e.target.value })
                                    }
                                />
                            </div>

                            <button
                                onClick={handleCreateParent}
                                disabled={loading}
                                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create Parent"}
                            </button>
                        </div>
                    </section>

                    <section className="rounded-2xl bg-white p-5 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Create Student</h2>
                        <div className="grid gap-3">
                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Student Name</label>
                                <input
                                    className="rounded-lg border p-3"
                                    placeholder="Enter student name"
                                    value={studentForm.name}
                                    onChange={(e) =>
                                        setStudentForm({ ...studentForm, name: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Date of Birth</label>
                                <input
                                    className="rounded-lg border p-3"
                                    type="date"
                                    value={studentForm.dob}
                                    onChange={(e) =>
                                        setStudentForm({ ...studentForm, dob: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Gender</label>
                                <select
                                    className="rounded-lg border p-3"
                                    value={studentForm.gender}
                                    onChange={(e) =>
                                        setStudentForm({
                                            ...studentForm,
                                            gender: e.target.value as "Male" | "Female" | "Other",
                                        })
                                    }
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Current Grade</label>
                                <input
                                    className="rounded-lg border p-3"
                                    type="number"
                                    min={1}
                                    max={12}
                                    placeholder="Enter current grade"
                                    value={studentForm.current_grade}
                                    onChange={(e) =>
                                        setStudentForm({
                                            ...studentForm,
                                            current_grade: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Parent</label>
                                <select
                                    className="rounded-lg border p-3"
                                    value={studentForm.parent_id}
                                    onChange={(e) =>
                                        setStudentForm({ ...studentForm, parent_id: e.target.value })
                                    }
                                >
                                    <option value="">Select parent</option>
                                    {parents.map((parent) => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.name} - {parent.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleCreateStudent}
                                disabled={loading}
                                className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-3 text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create Student"}
                            </button>
                        </div>
                    </section>

                    <section className="rounded-2xl bg-white p-5 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Create Class</h2>
                        <div className="grid gap-3">
                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Class Name</label>
                                <input
                                    className="rounded-lg border p-3"
                                    placeholder="Enter class name"
                                    value={classForm.name}
                                    onChange={(e) =>
                                        setClassForm({ ...classForm, name: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Subject</label>
                                <input
                                    className="rounded-lg border p-3"
                                    placeholder="Enter subject"
                                    value={classForm.subject}
                                    onChange={(e) =>
                                        setClassForm({ ...classForm, subject: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Day of Week</label>
                                <select
                                    className="rounded-lg border p-3"
                                    value={classForm.day_of_week}
                                    onChange={(e) =>
                                        setClassForm({ ...classForm, day_of_week: e.target.value })
                                    }
                                >
                                    {days.map((day) => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="grid gap-1">
                                    <label className="text-sm font-semibold">Start Time</label>
                                    <input
                                        className="rounded-lg border p-3"
                                        type="time"
                                        value={classForm.start_time}
                                        onChange={(e) =>
                                            setClassForm({ ...classForm, start_time: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="grid gap-1">
                                    <label className="text-sm font-semibold">End Time</label>
                                    <input
                                        className="rounded-lg border p-3"
                                        type="time"
                                        value={classForm.end_time}
                                        onChange={(e) =>
                                            setClassForm({ ...classForm, end_time: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Teacher Name</label>
                                <input
                                    className="rounded-lg border p-3"
                                    placeholder="Enter teacher name"
                                    value={classForm.teacher_name}
                                    onChange={(e) =>
                                        setClassForm({ ...classForm, teacher_name: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Max Students</label>
                                <input
                                    className="rounded-lg border p-3"
                                    type="number"
                                    min={1}
                                    placeholder="Enter max students"
                                    value={classForm.max_students}
                                    onChange={(e) =>
                                        setClassForm({ ...classForm, max_students: e.target.value })
                                    }
                                />
                            </div>

                            <button
                                onClick={handleCreateClass}
                                disabled={loading}
                                className="cursor-pointer rounded-lg bg-violet-600 px-4 py-3 text-white transition hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create Class"}
                            </button>
                        </div>
                    </section>

                    <section className="rounded-2xl bg-white p-5 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Create Subscription Plan</h2>
                        <div className="grid gap-3">
                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Plan Name</label>
                                <input
                                    className="rounded-lg border p-3"
                                    placeholder="e.g. Basic / Premium"
                                    value={planForm.name}
                                    onChange={(e) =>
                                        setPlanForm({ ...planForm, name: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Total Sessions</label>
                                <input
                                    className="rounded-lg border p-3"
                                    type="number"
                                    min={1}
                                    placeholder="e.g. 10"
                                    value={planForm.total_sessions}
                                    onChange={(e) =>
                                        setPlanForm({ ...planForm, total_sessions: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Duration Days</label>
                                <input
                                    className="rounded-lg border p-3"
                                    type="number"
                                    min={1}
                                    placeholder="e.g. 30"
                                    value={planForm.duration_days}
                                    onChange={(e) =>
                                        setPlanForm({ ...planForm, duration_days: e.target.value })
                                    }
                                />
                            </div>

                            <button
                                onClick={handleCreateSubscriptionPlan}
                                disabled={loading}
                                className="cursor-pointer rounded-lg bg-cyan-600 px-4 py-3 text-white transition hover:bg-cyan-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create Subscription Plan"}
                            </button>
                        </div>
                    </section>

                    <section className="rounded-2xl bg-white p-5 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Assign Plan To Student</h2>
                        <div className="grid gap-3">
                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Student</label>
                                <select
                                    className="rounded-lg border p-3"
                                    value={studentSubscriptionForm.student_id}
                                    onChange={(e) =>
                                        setStudentSubscriptionForm({
                                            ...studentSubscriptionForm,
                                            student_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select student</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Subscription Plan</label>
                                <select
                                    className="rounded-lg border p-3"
                                    value={studentSubscriptionForm.subscription_plan_id}
                                    onChange={(e) =>
                                        setStudentSubscriptionForm({
                                            ...studentSubscriptionForm,
                                            subscription_plan_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select subscription plan</option>
                                    {subscriptionPlans
                                        .filter((plan) => (plan.is_active ?? plan.isActive ?? true) === true)
                                        .map((plan) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Start Date</label>
                                <input
                                    className="rounded-lg border p-3"
                                    type="date"
                                    value={studentSubscriptionForm.start_date}
                                    onChange={(e) =>
                                        setStudentSubscriptionForm({
                                            ...studentSubscriptionForm,
                                            start_date: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <button
                                onClick={handleCreateStudentSubscription}
                                disabled={loading}
                                className="cursor-pointer rounded-lg bg-sky-600 px-4 py-3 text-white transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Assigning..." : "Assign Plan To Student"}
                            </button>
                        </div>
                    </section>

                    <section className="rounded-2xl bg-white p-5 shadow lg:col-span-2">
                        <h2 className="mb-4 text-xl font-semibold">Register Student To Class</h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Student</label>
                                <select
                                    className="rounded-lg border p-3"
                                    value={registerForm.student_id}
                                    onChange={(e) =>
                                        setRegisterForm({ ...registerForm, student_id: e.target.value })
                                    }
                                >
                                    <option value="">Select student</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-semibold">Class</label>
                                <select
                                    className="rounded-lg border p-3"
                                    value={registerForm.class_id}
                                    onChange={(e) =>
                                        setRegisterForm({ ...registerForm, class_id: e.target.value })
                                    }
                                >
                                    <option value="">Select class</option>
                                    {classes.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} - {item.day_of_week || item.dayOfWeek} -{" "}
                                            {item.time_slot || item.timeSlot}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    onClick={handleRegister}
                                    disabled={loading}
                                    className="w-full cursor-pointer rounded-lg bg-amber-600 px-4 py-3 text-white transition hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading ? "Registering..." : "Register"}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="rounded-2xl bg-white p-5 shadow">
                    <h2 className="mb-4 text-xl font-semibold">Subscription Plans</h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {subscriptionPlans.length ? (
                            subscriptionPlans.map((plan) => {
                                const total = plan.total_sessions ?? plan.totalSessions ?? 0;
                                const duration = plan.duration_days ?? plan.durationDays ?? 0;
                                const active = plan.is_active ?? plan.isActive ?? true;

                                return (
                                    <div key={plan.id} className="rounded-xl border p-4">
                                        <p className="font-semibold">{plan.name}</p>
                                        <p className="text-sm text-slate-600">Total Sessions: {total}</p>
                                        <p className="text-sm text-slate-600">Duration Days: {duration}</p>
                                        <p className="text-sm text-slate-600">
                                            Status: {active ? "Active" : "Inactive"}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-slate-400">No subscription plans</p>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-5 shadow">
                    <h2 className="mb-4 text-xl font-semibold">Student Subscriptions</h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {studentSubscriptions.length ? (
                            studentSubscriptions.map((sub) => {
                                const total =
                                    sub.total_sessions_snapshot ?? sub.totalSessionsSnapshot ?? 0;
                                const used = sub.used_sessions ?? sub.usedSessions ?? 0;
                                const startDate = sub.start_date ?? sub.startDate;
                                const endDate = sub.end_date ?? sub.endDate;

                                return (
                                    <div key={sub.id} className="rounded-xl border p-4">
                                        <p className="font-semibold">
                                            {sub.student?.name || `Student #${sub.student_id || sub.studentId}`}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Plan: {sub.subscriptionPlan?.name || `Plan #${sub.subscription_plan_id || sub.subscriptionPlanId}`}
                                        </p>
                                        <p className="text-sm text-slate-600">Start: {startDate}</p>
                                        <p className="text-sm text-slate-600">End: {endDate}</p>
                                        <p className="text-sm text-slate-600">
                                            Used: {used}/{total}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Remaining: {Math.max(total - used, 0)}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-slate-400">No student subscriptions</p>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-5 shadow">
                    <h2 className="mb-4 text-xl font-semibold">Parents</h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {parents.map((parent) => (
                            <div key={parent.id} className="rounded-xl border p-4">
                                <p className="font-semibold">{parent.name}</p>
                                <p className="text-sm text-slate-600">{parent.phone}</p>
                                <p className="text-sm text-slate-600">{parent.email}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-5 shadow">
                    <h2 className="mb-4 text-xl font-semibold">Students</h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {students.map((student) => (
                            <div key={student.id} className="rounded-xl border p-4">
                                <p className="font-semibold">{student.name}</p>
                                <p className="text-sm text-slate-600">
                                    DOB: {new Date(student.dob).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-slate-600">Gender: {student.gender}</p>
                                <p className="text-sm text-slate-600">
                                    Grade: {student.current_grade ?? student.currentGrade}
                                </p>
                                <p className="text-sm text-slate-600">
                                    Parent: {student.parent?.name || student.parent_id || student.parentId}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-5 shadow">
                    <h2 className="mb-4 text-xl font-semibold">Registrations</h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {registrations.length ? (
                            registrations.map((item) => (
                                <div key={item.id} className="rounded-xl border p-4">
                                    <p className="font-semibold">
                                        {item.student?.name || `Student #${item.student_id || item.studentId}`}
                                    </p>
                                    <p className="text-sm text-slate-600">Class: {item.class?.name}</p>
                                    <p className="text-sm text-slate-600">Subject: {item.class?.subject}</p>
                                    <p className="text-sm text-slate-600">
                                        Day: {item.class?.day_of_week || item.class?.dayOfWeek}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        Time: {item.class?.time_slot || item.class?.timeSlot}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        Next Class Time:{" "}
                                        {item.next_occurrence_at || item.nextOccurrenceAt
                                            ? new Date(
                                                (item.next_occurrence_at || item.nextOccurrenceAt) as string
                                            ).toLocaleString()
                                            : "-"}
                                    </p>
                                    <button
                                        onClick={() => handleCancelRegistration(item.id)}
                                        disabled={loading}
                                        className="mt-3 cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-sm text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel registration
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400">No registrations</p>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-5 shadow">
                    <h2 className="mb-4 text-xl font-semibold">Weekly Classes</h2>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {days.map((day) => (
                            <div key={day} className="rounded-xl border p-3">
                                <h3 className="mb-3 font-semibold">{day}</h3>
                                <div className="space-y-2">
                                    {classesByDay[day]?.length ? (
                                        classesByDay[day].map((item) => {
                                            const timeSlot = item.time_slot || item.timeSlot;
                                            const teacherName = item.teacher_name || item.teacherName;
                                            const maxStudents = item.max_students || item.maxStudents || 0;

                                            return (
                                                <div key={item.id} className="rounded-lg bg-slate-100 p-3 text-sm">
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        Subject: {item.subject}
                                                    </p>
                                                    <p>{timeSlot}</p>
                                                    <p className="text-slate-500">{teacherName}</p>
                                                    <p className="text-xs text-slate-400">
                                                        Capacity: {item.registered_count || 0}/{maxStudents}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-slate-400">No classes</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}