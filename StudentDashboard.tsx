import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, CheckCircle, Clock, Play, GraduationCap, ShoppingCart, ArrowLeft, Star, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useMemo } from "react";

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch student enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = trpc.courses.getStudentCourses.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch all available courses
  const { data: allCourses, isLoading: coursesLoading } = trpc.courses.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: !!user }
  );

  // Categorize enrollments
  const { inProgress, completed } = useMemo(() => {
    if (!enrollments) return { inProgress: [], completed: [] };
    return {
      inProgress: enrollments.filter((e: any) => e.status === "active"),
      completed: enrollments.filter((e: any) => e.status === "completed"),
    };
  }, [enrollments]);

  // Find courses not enrolled in
  const availableCourses = useMemo(() => {
    if (!allCourses || !enrollments) return allCourses || [];
    const enrolledCourseIds = new Set(enrollments.map((e: any) => e.courseId));
    return allCourses.filter((c: any) => !enrolledCourseIds.has(c.id));
  }, [allCourses, enrollments]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>