
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Report from "./pages/Report";
import NewsDetail from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";
import StakeSheet from "./components/StakeSheet";
import WitnessModal from "./components/WitnessModal";
import VictimEnroll from "./components/VictimEnroll";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<Report />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          {/* Global modals and sheets */}
          <StakeSheet />
          <WitnessModal />
          <VictimEnroll />
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
