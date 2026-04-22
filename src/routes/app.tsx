import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, type SubPage } from "@/components/app/AppShell";
import { Overview } from "@/components/app/pages/Overview";
import { Planning } from "@/components/app/pages/Planning";
import { Tasks } from "@/components/app/pages/Tasks";
import { Markets } from "@/components/app/pages/Markets";
import { Faq } from "@/components/app/pages/Faq";
import { Survey } from "@/components/app/Survey";

export const Route = createFileRoute("/app")({
  component: AppPage,
});

function AppPage() {
  const [page, setPage] = React.useState<SubPage>("overview");
  const [showSurvey, setShowSurvey] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const completed = localStorage.getItem("sc-onboarding-completed") === "1";
    if (!completed) setShowSurvey(true);
  }, []);

  return (
    <>
      <AppShell page={page} onPageChange={setPage}>
        {page === "overview" && <Overview go={setPage} />}
        {page === "planning" && <Planning />}
        {page === "tasks" && <Tasks />}
        {page === "markets" && <Markets />}
        {page === "faq" && <Faq />}
      </AppShell>
      {showSurvey && <Survey onComplete={() => setShowSurvey(false)} />}
    </>
  );
}