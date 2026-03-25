import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AppLayout } from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Architecture from "./pages/Architecture";
import Agriculture from "./pages/Agriculture";
import Finance from "./pages/Finance";
import Healthcare from "./pages/Healthcare";
import Governance from "./pages/Governance";
import IndiaStack from "./pages/IndiaStack";
import Boilerplate from "./pages/Boilerplate";
import Bottlenecks from "./pages/Bottlenecks";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/app" component={Dashboard} />
        <Route path="/app/architecture" component={Architecture} />
        <Route path="/app/agriculture" component={Agriculture} />
        <Route path="/app/finance" component={Finance} />
        <Route path="/app/healthcare" component={Healthcare} />
        <Route path="/app/governance" component={Governance} />
        <Route path="/app/indiastack" component={IndiaStack} />
        <Route path="/app/boilerplate" component={Boilerplate} />
        <Route path="/app/bottlenecks" component={Bottlenecks} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/app/*" component={AppRoutes} />
      <Route path="/app" component={AppRoutes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
