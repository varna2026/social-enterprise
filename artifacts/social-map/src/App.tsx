import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Enterprises from "@/pages/Enterprises";
import EnterpriseDetail from "@/pages/EnterpriseDetail";
import Admin from "@/pages/Admin";

const IS_STATIC = import.meta.env.VITE_STATIC_MODE === "true";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/enterprises" component={Enterprises} />
        <Route path="/enterprises/:id" component={EnterpriseDetail} />
        {!IS_STATIC && <Route path="/admin" component={Admin} />}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter
          hook={IS_STATIC ? useHashLocation : undefined}
          base={IS_STATIC ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "")}
        >
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
