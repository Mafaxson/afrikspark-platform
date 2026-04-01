import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Partners from "./pages/Partners";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Testimonials from "./pages/Testimonials";
import SubmitTestimonial from "./pages/SubmitTestimonial";
import AdminSetup from "./pages/AdminSetup";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

// Lazy load heavy components
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Community = lazy(() => import("./pages/Community"));
const DSS = lazy(() => import("./pages/DSS"));
const VentureStudio = lazy(() => import("./pages/VentureStudio"));
const CohortPage = lazy(() => import("./pages/CohortPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/dss" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}><DSS /></Suspense>} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/impact" element={<Navigate to="/testimonials" replace />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/venture-studio" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}><VentureStudio /></Suspense>} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/submit-testimonial" element={<SubmitTestimonial />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-setup" element={<AdminSetup />} />
              <Route path="/admin" element={<ProtectedAdminRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}><AdminDashboard /></Suspense></ProtectedAdminRoute>} />
              <Route path="/cohort/:id" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}><CohortPage /></Suspense>} />
              <Route path="/community" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}><Community /></Suspense>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;