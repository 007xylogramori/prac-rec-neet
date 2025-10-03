import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="group inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 grid place-items-center">
              <span className="h-3 w-3 rounded-sm bg-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              NEET Practice Tracker
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 text-sm">
              <NavLink to="/" active={isActive("/")}>New Test</NavLink>
              <NavLink to="/history" active={isActive("/history")}>History</NavLink>
            </nav>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user?.email}</span>
                </DropdownMenuItem>
                {user?.guardianEmail && (
                  <DropdownMenuItem disabled>
                    <span className="text-xs text-muted-foreground">
                      Guardian: {user.guardianEmail}
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Built for NEET UG practice • MongoDB database integration
      </footer>
    </div>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-md px-3 py-2 transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground hover:bg-foreground/5",
      )}
    >
      {children}
    </Link>
  );
}
