import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./components/LoginPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { ProjectsPage } from "./components/ProjectsPage";
import { ProjectDetailPage } from "./components/ProjectDetailPage";
import { AccountPage } from "./components/AccountPage";
import { CalendarPage } from "./components/CalendarPage";
import { DashboardOverviewPage } from "./components/DashboardOverviewPage";
import { PurchasesPage } from "./components/PurchasesPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        Component: DashboardLayout,
        children: [
          {
            index: true,
            Component: ProjectsPage,
          },
          {
            path: "project/:projectId",
            Component: ProjectDetailPage,
          },
          {
            path: "account",
            Component: AccountPage,
          },
          {
            path: "calendar",
            Component: CalendarPage,
          },
          {
            path: "dashboard",
            Component: DashboardOverviewPage,
          },
          {
            path: "purchases",
            Component: PurchasesPage,
          },
        ],
      },
    ],
  },
]);
