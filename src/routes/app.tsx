import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, type SubPage } from "@/components/app/AppShell";
import { RequireAuth } from "@/components/site/RequireAuth";
import { Overview } from "@/components/app/pages/Overview";
import { Planning } from "@/components/app/pages/Planning";
import { Tasks } from "@/components/app/pages/Tasks";
import { Markets } from "@/components/app/pages/Markets";
import { Faq } from "@/components/app/pages/Faq";
import { Survey } from "@/components/app/Survey";
import { Profile } from "@/components/app/pages/Profile";
import { ReportPage } from "@/components/app/pages/Report";

export const Route = createFileRoute("/app")({
  component: AppPage,
});

function AppPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState<SubPage>("overview");
  const [showSurvey, setShowSurvey] = React.useState(false);
  const [openCreateTask, setOpenCreateTask] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const completed = localStorage.getItem("sc-onboarding-completed") === "1";
    // Protect app: require valid token
    import("@/lib/api").then(({ isTokenValid, auth }) => {
      if (!isTokenValid()) {
        auth.clear();
        navigate({ to: "/login" });
      }
    });
    if (!completed) setShowSurvey(true);
  }, []);

  function triggerNewTask() {
    setOpenCreateTask(true);
    setPage("tasks");
  }

  return (
    <RequireAuth>
      <AppShell page={page} onPageChange={setPage}>
        {page === "overview" && <Overview go={setPage} onNewTask={triggerNewTask} />}
        {page === "planning" && <Planning />}
        {page === "tasks" && (
          <Tasks openCreateOnMount={openCreateTask} onConsumed={() => setOpenCreateTask(false)} />
        )}
        {page === "markets" && <Markets />}
        {page === "faq" && <Faq />}
        {page === "profile" && <Profile />}
        {page === "report" && <ReportPage />}
      </AppShell>
      {showSurvey && <Survey onComplete={() => setShowSurvey(false)} />}
    </RequireAuth>
  );
}