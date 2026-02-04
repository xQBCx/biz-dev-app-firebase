import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocationProvider } from "@/contexts/LocationContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import Onboarding from "./pages/Onboarding";
import Today from "./pages/Today";
import CoachChat from "./pages/CoachChat";
import Profile from "./pages/Profile";
import Coaches from "./pages/Coaches";
import CoachProfile from "./pages/CoachProfile";
import CoachDashboard from "./pages/CoachDashboard";
import FormCheck from "./pages/FormCheck";
import FormTips from "./pages/FormTips";
import FAQ from "./pages/FAQ";
import FitnessQuiz from "./pages/FitnessQuiz";
import Nutrition from "./pages/Nutrition";
import ProgressPage from "./pages/ProgressPage";
import Programs from "./pages/Programs";
import CoachRegister from "./pages/CoachRegister";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Reflection from "./pages/Reflection";
import Affirmations from "./pages/Affirmations";
import Relationships from "./pages/Relationships";
import MomentumReset from "./pages/MomentumReset";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminPartners from "./pages/AdminPartners";
import AdminStaff from "./pages/AdminStaff";
import AdminProducts from "./pages/AdminProducts";
import AdminContentLibrary from "./pages/AdminContentLibrary";
import AdminBooks from "./pages/AdminBooks";
import AdminSocialDeploy from "./pages/AdminSocialDeploy";
import AdminCoaches from "./pages/AdminCoaches";
import AdminFeedback from "./pages/AdminFeedback";
import AdminGymPartners from "./pages/AdminGymPartners";
import AdminBlog from "./pages/AdminBlog";
import ContentFeed from "./pages/ContentFeed";
import { FeedbackForm } from "./components/FeedbackForm";
import HealthGoals from "./pages/HealthGoals";
import Gyms from "./pages/Gyms";
import Partner from "./pages/Partner";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnerBookings from "./pages/PartnerBookings";
import PartnerSettings from "./pages/PartnerSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LocationProvider>
        <SubscriptionProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <FeedbackForm />
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/today" element={<Today />} />
          <Route path="/coach-chat" element={<CoachChat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/coach/:id" element={<CoachProfile />} />
          <Route path="/coach-dashboard" element={<CoachDashboard />} />
          <Route path="/form-check" element={<FormCheck />} />
          <Route path="/form-tips" element={<FormTips />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/quiz" element={<FitnessQuiz />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/coach-register" element={<CoachRegister />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/product/:handle" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/reflection" element={<Reflection />} />
          <Route path="/affirmations" element={<Affirmations />} />
          <Route path="/relationships" element={<Relationships />} />
          <Route path="/momentum-reset" element={<MomentumReset />} />
          <Route path="/admin" element={<Admin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="coaches" element={<AdminCoaches />} />
            <Route path="content" element={<AdminContentLibrary />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="social" element={<AdminSocialDeploy />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="gym-partners" element={<AdminGymPartners />} />
            <Route path="blog" element={<AdminBlog />} />
          </Route>
          <Route path="/content" element={<ContentFeed />} />
          <Route path="/health-goals" element={<HealthGoals />} />
          <Route path="/gyms" element={<Gyms />} />
          <Route path="/partner" element={<Partner />}>
            <Route index element={<PartnerDashboard />} />
            <Route path="bookings" element={<PartnerBookings />} />
            <Route path="settings" element={<PartnerSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </SubscriptionProvider>
      </LocationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
