"use client";

import { Dumbbell, Users } from "lucide-react";

interface CourseListWidgetProps {
  courses: any[];
  onSelect: (course: any) => void;
}

export const CourseListWidget = ({ courses, onSelect }: CourseListWidgetProps) => {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-muted/20">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
          <Dumbbell size={32} />
        </div>
        <p className="text-muted-foreground font-medium">Bạn chưa được phân công lớp nào.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div
          key={course.id}
          onClick={() => onSelect(course)}
          // STYLE: bg-card, border-border, hover hiệu ứng nổi
          className="group bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all duration-300 flex flex-col items-center text-center"
        >
          {/* Icon Circle */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Dumbbell className="text-primary" size={32} />
          </div>

          {/* Info */}
          <h3 className="text-xl font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors">
            {course.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Đã dạy <span className="font-semibold text-foreground">{course._count.sessions}</span> buổi
          </p>

          {/* Button Fake */}
          <div className="w-full py-2.5 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center justify-center gap-2">
            <Users size={16} /> Xem danh sách học viên
          </div>
        </div>
      ))}
    </div>
  );
};