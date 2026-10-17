import { Outlet } from "react-router";
import { RouteErrorBoundary } from "../components/feedback/route-error";

/**
 * A pathless layout under the app frame whose only job is to catch route
 * errors *inside* the frame (tab bar stays), with a retry and a way home.
 */
export default function ShellErrors() {
  return <Outlet />;
}

export { RouteErrorBoundary as ErrorBoundary };
