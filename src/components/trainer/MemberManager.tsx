"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  getTrainerCoursesAction, 
  getStudentsInCourseAction, 
  getStudentProgressAction 
} from "@/actions/trainer/trainer";
import { Loader2 } from "lucide-react";

// Import UI Components
import { CourseListWidget } from "./CourseListWidget";
import { StudentListWidget } from "./StudentListWidget";
import { ProgressModal } from "./ProgressModal";

export default function MemberManager() {
  const { user } = useAuth();
  
  // State điều khiển View
  const [viewMode, setViewMode] = useState<'COURSES' | 'STUDENTS'>('COURSES');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Data State
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  // Loading State
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // 1. Fetch Courses on Load
  useEffect(() => {
    if (user?.id) {
      getTrainerCoursesAction(user.id).then(res => {
        if (res.success) setCourses(res.data);
        setLoadingCourses(false);
      });
    }
  }, [user?.id]);

  // 2. Handle Select Course -> Fetch Students
  const handleSelectCourse = async (course: any) => {
    if (!user?.id) return;
    setSelectedCourse(course);
    setViewMode('STUDENTS');
    setLoadingStudents(true);
    
    const res = await getStudentsInCourseAction(user.id, course.id);
    if (res.success) setStudents(res.data);
    
    setLoadingStudents(false);
  };

  // 3. Handle Select Student -> Fetch Progress
  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    setLoadingProgress(true);
    const res = await getStudentProgressAction(student.id);
    if (res.success) setProgressData(res.data);
    setLoadingProgress(false);
  };

  // 4. Back logic
  const handleBackToCourses = () => {
    setViewMode('COURSES');
    setSelectedCourse(null);
    setStudents([]);
  };

  return (
    <div className="space-y-8 fade-in pb-10 min-h-screen">
      
      {/* HEADER */}
      {viewMode === 'COURSES' && (
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Học viên & Tiến độ
          </h1>
          <p className="text-muted-foreground">
            Chọn lớp học để xem danh sách và chỉ số sức khỏe của học viên.
          </p>
        </div>
      )}

      {/* CONTENT SWITCHER */}
      <div className="min-h-[400px]">
        {viewMode === 'COURSES' ? (
           loadingCourses ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
           ) : (
             <CourseListWidget courses={courses} onSelect={handleSelectCourse} />
           )
        ) : (
           loadingStudents ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
           ) : (
             <StudentListWidget 
               courseName={selectedCourse?.name || "Lớp học"} 
               students={students} 
               onBack={handleBackToCourses} 
               onSelectStudent={handleSelectStudent}
             />
           )
        )}
      </div>

      {/* MODAL POPUP */}
      <ProgressModal 
        isOpen={!!selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
        student={selectedStudent} 
        data={progressData} 
        loading={loadingProgress} 
      />
    </div>
  );
}