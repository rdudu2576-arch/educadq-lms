import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CourseView from "./pages/CourseView";
import AssessmentView from "./pages/AssessmentView";
import SettingsPage from "./pages/SettingsPage";
import LessonEditor from "./pages/LessonEditor";
import ReportsPage from "./pages/ReportsPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import UsersManagement from "./pages/UsersManagement";
import PaymentsManagement from "./pages/PaymentsManagement";
import EditCoursePage from "./pages/EditCoursePage";
import LessonsManagement from "./pages/LessonsManagement";
import AssessmentsManagement from "./pages/AssessmentsManagement";
import MaterialsManagement from "./pages/MaterialsManagement";
import ContentPortal from "./pages/ContentPortal";
import EducationalAnalytics from "./pages/EducationalAnalytics";
import MercadopagoIntegration from "./pages/MercadopagoIntegration";
import ForumPage from "./pages/ForumPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticlePage from "./pages/ArticlePage";
import ProfilePage from "./pages/ProfilePage";
import CourseLandingPage from "./pages/CourseLandingPage";
import RegisterPage from "./pages/RegisterPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfessionalProfilePage from "./pages/ProfessionalProfilePage";
import ProfessionalPublicProfile from "./pages/ProfessionalPublicProfile";
import ProfessionalsPage from "./pages/ProfessionalsPage";
import ProfissionaisEducadqPage from "./pages/ProfissionaisEducadqPage";
import ProfessionalRegistration from "./pages/ProfessionalRegistration";
import Courses from "./pages/Courses";
import Forbidden403Page from "./pages/Forbidden403Page";
import MercadoPagoCheckoutPage from "./pages/MercadoPagoCheckoutPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { FreeCoursesPage } from "./pages/FreeCoursesPage";
import MonitorPage from "./pages/MonitorPage";
// import { ResetPasswordPage } from "./pages/ResetPasswordPage"; // TODO: Fix tRPC type issue

function Router() {
  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      {/* <Route path="/reset-password" component={ResetPasswordPage} /> */}

      {/* Rotas públicas de conteúdo */}
      <Route path="/cursos" component={Courses} />
      <Route path="/cursos-gratuitos" component={FreeCoursesPage} />
      <Route path="/artigos" component={ArticlesPage} />
      <Route path="/artigos/:slug" component={ArticlePage} />
      <Route path="/curso/:slug" component={CourseLandingPage} />
      <Route path="/aluno/:slug" component={ProfessionalProfilePage} />
      <Route path="/profissional/:id" component={ProfessionalPublicProfile} />
      <Route path="/profissionais" component={ProfessionalsPage} />
      <Route path="/profissionais-educadq" component={ProfissionaisEducadqPage} />
      <ProtectedRoute path="/profissional/cadastro" component={ProfessionalRegistration} />

      {/* Rotas do Admin (protegidas, role admin) */}
      <ProtectedRoute path="/admin" component={AdminDashboard} requiredRole="admin" />
      <ProtectedRoute path="/admin/monitor" component={MonitorPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/reports/:reportType" component={ReportsPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/courses/new" component={CreateCoursePage} requiredRole="admin" />
      <ProtectedRoute path="/admin/courses/:courseId/edit" component={EditCoursePage} requiredRole="admin" />
      <ProtectedRoute path="/admin/users" component={UsersManagement} requiredRole="admin" />
      <ProtectedRoute path="/admin/payments" component={PaymentsManagement} requiredRole="admin" />

      {/* Rotas do Professor (protegidas) */}
      <ProtectedRoute path="/professor" component={ProfessorDashboard} requiredRole="professor" />
      <ProtectedRoute path="/professor/lessons" component={LessonsManagement} requiredRole="professor" />
      <ProtectedRoute path="/professor/assessments" component={AssessmentsManagement} requiredRole="professor" />
      <ProtectedRoute path="/professor/materials" component={MaterialsManagement} requiredRole="professor" />
      <ProtectedRoute path="/professor/lessons/new" component={LessonEditor} requiredRole="professor" />
      <ProtectedRoute path="/professor/courses/:courseId/lessons" component={LessonEditor} requiredRole="professor" />
      <ProtectedRoute path="/professor/lessons/:lessonId/edit" component={LessonEditor} requiredRole="professor" />

      {/* Rotas do Aluno (protegidas) */}
      <ProtectedRoute path="/student" component={StudentDashboard} />
      <ProtectedRoute path="/courses/:courseId" component={CourseView} />
      <ProtectedRoute path="/assessments/:assessmentId" component={AssessmentView} />
      <ProtectedRoute path="/payments" component={CheckoutPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/perfil" component={ProfilePage} />
      <ProtectedRoute path="/completar-cadastro" component={RegisterPage} />
      <ProtectedRoute path="/checkout/:courseId" component={CheckoutPage} />
      <ProtectedRoute path="/pagamento-confirmado" component={StudentDashboard} />

      {/* Rotas extras (protegidas) */}
      <ProtectedRoute path="/content" component={ContentPortal} />
      <ProtectedRoute path="/analytics" component={EducationalAnalytics} requiredRole="admin" />
      <ProtectedRoute path="/mercadopago" component={MercadopagoIntegration} requiredRole="admin" />
      <ProtectedRoute path="/forum" component={ForumPage} />
      <ProtectedRoute path="/courses/:courseId/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/mercadopago-checkout/:courseId" component={MercadoPagoCheckoutPage} />
      <ProtectedRoute path="/pagamento-pix" component={StudentDashboard} />
      <ProtectedRoute path="/pagamento-boleto" component={StudentDashboard} />
      <ProtectedRoute path="/pagamento-transferencia" component={StudentDashboard} />

      {/* 403 */}
      <Route path="/403" component={Forbidden403Page} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
