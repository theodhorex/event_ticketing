"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { createPortal } from "react-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  CalendarIcon,
  TicketIcon,
  LayoutDashboardIcon,
  UserIcon,
  LogOutIcon,
} from "lucide-react";

function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);

  const onScroll = React.useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);

  React.useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  React.useEffect(() => {
    onScroll();
  }, [onScroll]);

  return scrolled;
}

export function Header() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const user = session?.user as { name?: string; email?: string; role?: string } | undefined;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-200",
        scrolled
          ? "bg-white/95 supports-[backdrop-filter]:bg-white/50 border-border/50 backdrop-blur-md shadow-sm"
          : "bg-white border-transparent"
      )}
    >
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <TicketIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-neutral-900 tracking-tight">
              EventTicketing
            </span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a
                    href="/events"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    Browse Events
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {session && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-white">
                    Dashboard
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white p-2">
                    <ul className="grid w-[200px] gap-1">
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="/dashboard"
                            className="flex select-none items-center gap-2 rounded-md p-3 hover:bg-accent focus:bg-accent outline-none"
                          >
                            <LayoutDashboardIcon className="h-4 w-4 text-neutral-500" />
                            <span className="text-sm font-medium">Overview</span>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="/dashboard/events"
                            className="flex select-none items-center gap-2 rounded-md p-3 hover:bg-accent focus:bg-accent outline-none"
                          >
                            <CalendarIcon className="h-4 w-4 text-neutral-500" />
                            <span className="text-sm font-medium">My Events</span>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      {user?.role === "organizer" && (
                        <li>
                          <NavigationMenuLink asChild>
                            <a
                              href="/dashboard/checkin"
                              className="flex select-none items-center gap-2 rounded-md p-3 hover:bg-accent focus:bg-accent outline-none"
                            >
                              <TicketIcon className="h-4 w-4 text-neutral-500" />
                              <span className="text-sm font-medium">Check-in</span>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-neutral-100" />
          ) : session ? (
            <>
              <span className="text-sm text-neutral-500">
                {user?.name || user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-neutral-600 hover:text-neutral-900"
              >
                <LogOutIcon className="h-4 w-4 mr-1.5" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="md:hidden border-neutral-200"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      {open && typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 top-14 z-40 flex flex-col overflow-y-auto bg-white/95 backdrop-blur-md md:hidden border-t"
          >
            <div className="flex flex-col gap-1 p-4">
              <Link
                href="/events"
                className="flex items-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                <CalendarIcon className="h-4 w-4 text-neutral-500" />
                Browse Events
              </Link>

              {session && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboardIcon className="h-4 w-4 text-neutral-500" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/events"
                    className="flex items-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    <CalendarIcon className="h-4 w-4 text-neutral-500" />
                    My Events
                  </Link>
                </>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2 border-t p-4">
              {session ? (
                <>
                  <div className="flex items-center gap-2 p-3 text-sm text-neutral-500">
                    <UserIcon className="h-4 w-4" />
                    {user?.name || user?.email}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                  >
                    <LogOutIcon className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
