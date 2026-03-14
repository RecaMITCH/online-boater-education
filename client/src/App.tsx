import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import StatesList from "@/pages/states-list";
import StateDetail from "@/pages/state-detail";
import BlogList from "@/pages/blog-list";
import BlogDetail from "@/pages/blog-detail";
import Admin from "@/pages/admin";
import { InstructorChat } from "@/components/instructor-chat";
import BlogEditor from "./pages/blog-editor";
import About from "@/pages/about";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/states" component={StatesList} />
      <Route path="/states/:slug" component={StateDetail} />
      <Route path="/blog" component={BlogList} />
      <Route path="/blog/:slug" component={BlogDetail} />
      <Route path="/about" component={About} />
          <Route path="/admin/blog/new" component={BlogEditor} />
          <Route path="/admin/blog/:id" component={BlogEditor} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1">
              <Router />
            </main>
            <SiteFooter />
        <InstructorChat isOpen={chatOpen} onOpenChange={setChatOpen} />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
