import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QBCScriptProvider } from "@/contexts/QBCScriptContext";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import VDR from "./pages/VDR";
import QBCHome from "./pages/QBCHome";
import QBCSimulator from "./pages/QBCSimulator";
import QBCDecode from "./pages/QBCDecode";
import QBCLibrary from "./pages/QBCLibrary";
import QBCInbox from "./pages/QBCInbox";
import QBCAdmin from "./pages/QBCAdmin";
import QBCProducts from "./pages/QBCProducts";
import QBCExperimental from "./pages/QBCExperimental";
import GlyphDetail from "./pages/GlyphDetail";
import ClaimsLibrary from "./pages/ClaimsLibrary";
import GovernmentSolutions from "./pages/GovernmentSolutions";
import Compliance from "./pages/Compliance";
import WhitePaper from "./pages/WhitePaper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <QBCScriptProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/vdr/:dealSlug" element={<VDR />} />
            <Route path="/qbc" element={<QBCHome />} />
            <Route path="/qbc/simulator" element={<QBCSimulator />} />
            <Route path="/qbc/decode" element={<QBCDecode />} />
            <Route path="/qbc/library" element={<QBCLibrary />} />
            <Route path="/qbc/admin" element={<QBCAdmin />} />
            <Route path="/qbc/inbox" element={<QBCInbox />} />
            <Route path="/glyph/:id" element={<GlyphDetail />} />
            <Route path="/claims" element={<ClaimsLibrary />} />
            <Route path="/qbc/products" element={<QBCProducts />} />
            <Route path="/qbc/experimental" element={<QBCExperimental />} />
            <Route path="/government" element={<GovernmentSolutions />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/whitepaper" element={<WhitePaper />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QBCScriptProvider>
  </QueryClientProvider>
);

export default App;
