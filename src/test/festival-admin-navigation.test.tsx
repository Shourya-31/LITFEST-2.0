import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import AdminDashboard from "../../frontend/src/features/admin/AdminDashboard";
import { FestivalNav } from "../../frontend/src/features/home/components/FestivalNav";

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
  user: null as { role: string; name: string; email: string; id: string } | null,
}));

vi.mock("../../frontend/src/state/AuthContext", () => ({
  useAuth: () => ({
    ...authState,
    loading: false,
    isAdmin: authState.user?.role === "ADMIN",
  }),
}));

function CurrentPath() {
  const { pathname } = useLocation();
  return <output data-testid="current-path">{pathname}</output>;
}

function renderNavigation(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <FestivalNav />
      <CurrentPath />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  authState.isAuthenticated = false;
  authState.user = null;
});

describe("homepage festival navigation", () => {
  it("only exposes the admin link to an authenticated admin", () => {
    const { rerender } = renderNavigation();
    expect(screen.queryByRole("link", { name: "Administration" })).toBeNull();
    expect(screen.getByRole("button", { name: "Login" })).toBeTruthy();

    authState.isAuthenticated = true;
    authState.user = {
      id: "1",
      name: "Participant",
      email: "participant@example.test",
      role: "USER",
    };
    rerender(
      <MemoryRouter initialEntries={["/"]}>
        <FestivalNav />
        <CurrentPath />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("link", { name: "Administration" })).toBeNull();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeTruthy();

    authState.user = {
      id: "1",
      name: "Administrator",
      email: "admin@example.test",
      role: "ADMIN",
    };
    rerender(
      <MemoryRouter initialEntries={["/"]}>
        <FestivalNav />
        <CurrentPath />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Administration" })).toBeTruthy();
  });

  it("navigates to the admin route, marks it active, and closes the mobile menu", () => {
    authState.isAuthenticated = true;
    authState.user = {
      id: "2",
      name: "Administrator",
      email: "admin@example.test",
      role: "ADMIN",
    };
    renderNavigation();

    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation menu" }));
    expect(screen.getByRole("navigation", { name: "Main Navigation" })).toHaveClass(
      "mobile-active",
    );

    fireEvent.click(screen.getByRole("link", { name: "Administration" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/admin/dashboard");
    expect(screen.getByRole("link", { name: "Administration" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("navigation", { name: "Main Navigation" })).not.toHaveClass(
      "mobile-active",
    );
  });

  it("redirects guests to login and denies participants before loading admin data", () => {
    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/login" element={<CurrentPath />} />
          <Route path="/dashboard" element={<CurrentPath />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("current-path")).toHaveTextContent("/login");

    cleanup();
    authState.isAuthenticated = true;
    authState.user = {
      id: "3",
      name: "Participant",
      email: "participant@example.test",
      role: "USER",
    };
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/login" element={<CurrentPath />} />
          <Route path="/dashboard" element={<CurrentPath />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Administrator access required" }),
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders the admin dashboard and loads leaderboard data through the API client", async () => {
    authState.isAuthenticated = true;
    authState.user = {
      id: "4",
      name: "Administrator",
      email: "admin@example.test",
      role: "ADMIN",
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            leaderboard: [
              { id: "12", name: "A participant", totalPoints: 35, rank: 1 },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "Points & leaderboard" }),
    ).toBeTruthy();
    expect(
      await screen.findByRole("button", { name: /A participant/ }),
    ).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/points/leaderboard",
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
