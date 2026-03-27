const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request(path: string, options?: RequestInit) {
    const res = await fetch(`${API_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
        },
        ...options,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(data?.message || "Request failed");
    }

    return data;
}

export async function createParent(payload: {
    name: string;
    phone: string;
    email: string;
}) {
    return request("/parents", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getParents() {
    return request("/parents");
}

export async function getParent(id: number) {
    return request(`/parents/${id}`);
}

export async function createStudent(payload: {
    name: string;
    dob: string;
    gender: "Male" | "Female" | "Other";
    current_grade: string | number;
    parent_id: number;
}) {
    return request("/students", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getStudents() {
    return request("/students");
}

export async function getStudent(id: number) {
    return request(`/students/${id}`);
}

export async function createClass(payload: {
    name: string;
    subject: string;
    day_of_week: string;
    time_slot: string;
    teacher_name: string;
    max_students: number;
}) {
    return request("/classes", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getClasses(day?: string) {
    const query = day ? `?day=${encodeURIComponent(day)}` : "";
    return request(`/classes${query}`);
}

export async function createSubscriptionPlan(payload: {
    name: string;
    total_sessions: number;
    duration_days: number;
    is_active?: boolean;
}) {
    return request("/subscription", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getSubscriptionPlans() {
    return request("/subscription");
}

export async function getSubscriptionPlan(id: number) {
    return request(`/subscription/${id}`);
}

export async function createStudentSubscription(payload: {
    student_id: number;
    subscription_plan_id: number;
    start_date: string;
}) {
    return request("/student-subscriptions", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getStudentSubscriptions() {
    return request("/student-subscriptions");
}

export async function getStudentSubscription(id: number) {
    return request(`/student-subscriptions/${id}`);
}

export async function useStudentSubscription(id: number) {
    return request(`/student-subscriptions/${id}/use`, {
        method: "PATCH",
    });
}

export async function getRegistrations() {
    return request("/registrations");
}

export async function registerStudentToClass(
    classId: number,
    payload: { student_id: number }
) {
    return request(`/classes/${classId}/register`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function cancelRegistration(registrationId: number) {
    return request(`/registrations/${registrationId}`, {
        method: "DELETE",
    });
}