"use server";

// ⚠️ Đảm bảo đường dẫn này trỏ đúng tới file service ở trên
import { TrainerService } from "@/services/trainer/trainer.service"; 
import { revalidatePath } from "next/cache";

const trainerService = new TrainerService();

// --- DASHBOARD & CHECK-IN ACTIONS ---

export async function getTrainerDashboardAction(userId: string) {
  try {
    if (!userId) return { success: false, message: "User ID is required" };

    const data = await trainerService.getDashboardData(userId);
    // Serialize dữ liệu Date để tránh lỗi khi truyền từ Server về Client
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) {
    console.error("Dashboard Error:", error);
    return { success: false, message: "Lỗi lấy dữ liệu dashboard" };
  }
}

export async function toggleTrainerCheckInAction(userId: string) {
  try {
    if (!userId) return { success: false, message: "User ID is required" };

    const result = await trainerService.toggleCheckIn(userId);
    revalidatePath("/trainer/dashboard");
    return { success: true, ...result };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống chấm công" };
  }
}

// --- SCHEDULE ACTIONS ---

export async function getTrainerScheduleAction(userId: string, filter: 'upcoming' | 'history' = 'upcoming') {
  try {
    const classes = await trainerService.getUpcomingClasses(userId, 20, filter); 
    return { success: true, data: JSON.parse(JSON.stringify(classes)) };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi lấy lịch dạy" };
  }
}

// --- MEMBER & PROGRESS ACTIONS (MỚI) ---

export async function getTrainerCoursesAction(trainerId: string) {
  try {
    const courses = await trainerService.getTrainerCourses(trainerId);
    return { success: true, data: JSON.parse(JSON.stringify(courses)) };
  } catch (error) {
    console.error("Lỗi getTrainerCourses:", error);
    return { success: false, message: "Lỗi lấy danh sách lớp" };
  }
}

export async function getStudentsInCourseAction(trainerId: string, gymClassId: string) {
  try {
    const students = await trainerService.getStudentsInCourse(trainerId, gymClassId);
    return { success: true, data: JSON.parse(JSON.stringify(students)) };
  } catch (error) {
    console.error("Lỗi getStudentsInCourse:", error);
    return { success: false, message: "Lỗi lấy danh sách học viên" };
  }
}

export async function getStudentProgressAction(studentId: string) {
  try {
    const progress = await trainerService.getStudentProgress(studentId);
    return { success: true, data: JSON.parse(JSON.stringify(progress)) };
  } catch (error) {
    console.error("Lỗi getStudentProgress:", error);
    return { success: false, message: "Lỗi lấy dữ liệu sức khỏe" };
  }
}