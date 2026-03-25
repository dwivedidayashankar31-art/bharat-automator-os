import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Architecture from "./pages/Architecture";
import Agriculture from "./pages/Agriculture";
import Finance from "./pages/Finance";
import Healthcare from "./pages/Healthcare";
import Governance from "./pages/Governance";
import IndiaStack from "./pages/IndiaStack";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Let failures show gracefully in the dashboard
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/architecture" component={Architecture} />
        <Route path="/agents/agriculture" component={Agriculture} />
        <Route path="/agents/finance" component={Finance} />
        <Route path="/agents/healthcare" component={Healthcare} />
        <Route path="/agents/governance" component={Governance} />
        <Route path="/indiastack" component={IndiaStack} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
