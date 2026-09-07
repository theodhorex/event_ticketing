"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { motion, AnimatePresence } from "framer-motion";
import {
  TicketIcon,
  CalendarIcon,
  LayoutDashboardIcon,
  UserIcon,
  LogOutIcon,
  CheckSquareIcon,
  ShoppingBagIcon,
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

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

export function Header() {
  const [open, setOpen] = React.useState(false);
  const [hoverMenu, setHoverMenu] = React.useState(false);
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
  const isOrganizer = user?.role === "organizer";

  const organizerLinks: NavItem[] = [
    { title: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
    { title: "My Events", href: "/dashboard/events", icon: CalendarIcon },
    { title: "Check-in", href: "/dashboard/checkin", icon: CheckSquareIcon },
    { title: "Orders", href: "/dashboard/orders", icon: ShoppingBagIcon },
  ];

  const buyerLinks: NavItem[] = [
    { title: "Browse Events", href: "/events", icon: CalendarIcon },
    { title: "My Tickets", href: "/dashboard/tickets", icon: TicketIcon },
    { title: "Order History", href: "/dashboard/orders", icon: ShoppingBagIcon },
  ];

  const navLinks = isOrganizer ? organizerLinks : buyerLinks;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
          scrolled
            ? "bg-white/95 supports-[backdrop-filter]:bg-white/50 border-border/50 backdrop-blur-md shadow-sm"
            : "bg-white border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 rounded-md p-2 hover:bg-accent transition-colors">
            <TicketIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-foreground">EventTicketing</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/events"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              Browse Events
            </Link>

            {session && (
              <div
                className="relative"
                onMouseEnter={() => setHoverMenu(true)}
                onMouseLeave={() => setHoverMenu(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  Menu
                  <motion.svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ rotate: hoverMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {hoverMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-popover p-2 shadow-lg"
                    >
                      <div className="space-y-1">
                        {navLinks.map((link, i) => (
                          <motion.div
                            key={link.title}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15, delay: i * 0.03 }}
                          >
                            <Link
                              href={link.href}
                              className="flex items-center gap-3 rounded-md p-3 hover:bg-accent transition-colors"
                            >
                              <link.icon className="h-4 w-4 text-foreground/60" />
                              <span className="text-sm font-medium">{link.title}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-2 border-t pt-2"
                      >
                        <p className="px-3 py-1 text-xs text-muted-foreground">
                          Signed in as <span className="font-medium text-foreground">{user?.name || user?.email}</span>
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden items-center gap-2 md:flex">
            {status === "loading" ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-accent" />
            ) : session ? (
              <>
                <span className="text-sm text-muted-foreground mr-2">{user?.name || user?.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(!open)}
            className="md:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 top-14 z-40 bg-black/20 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed left-0 right-0 top-14 z-50 flex flex-col gap-4 overflow-y-auto bg-white p-4 shadow-lg md:hidden"
            >
              {/* Nav Links */}
              <div className="space-y-1">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground">Menu</p>
                {navLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md p-3 hover:bg-accent transition-colors"
                  >
                    <link.icon className="h-5 w-5 text-foreground/60" />
                    <span className="text-sm font-medium">{link.title}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t pt-4">
                {session ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                      <UserIcon className="h-4 w-4" />
                      {user?.name || user?.email}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
