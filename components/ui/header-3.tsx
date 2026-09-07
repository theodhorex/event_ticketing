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
  description?: string;
};

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
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent",
        scrolled
          ? "bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg"
          : "bg-background border-transparent"
      )}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 hover:bg-accent rounded-md p-2">
            <TicketIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-foreground">EventTicketing</span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Menu</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background p-1 pr-1.5">
                  <ul className="bg-popover grid w-lg grid-cols-2 gap-2 rounded-md border p-2 shadow">
                    {navLinks.map((item, i) => (
                      <li key={i}>
                        <ListItem {...item} />
                      </li>
                    ))}
                  </ul>
                  {session && (
                    <div className="p-2 border-t">
                      <p className="text-muted-foreground text-sm">
                        Signed in as{" "}
                        <span className="text-foreground font-medium">{user?.name || user?.email}</span>
                      </p>
                    </div>
                  )}
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4" asChild>
                  <Link href="/events" className="hover:bg-accent rounded-md p-2">
                    Browse Events
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-accent" />
          ) : session ? (
            <>
              <span className="text-sm text-muted-foreground mr-2">
                {user?.name || user?.email}
              </span>
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

        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      <MobileMenu open={open} className="flex flex-col justify-between gap-2 overflow-y-auto">
        <NavigationMenu className="max-w-full">
          <div className="flex w-full flex-col gap-y-2">
            <span className="text-sm font-medium text-muted-foreground px-2">Menu</span>
            {navLinks.map((link) => (
              <ListItem key={link.title} {...link} />
            ))}
          </div>
        </NavigationMenu>

        <div className="flex flex-col gap-2">
          {session ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                {user?.name || user?.email}
              </div>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
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
      </MobileMenu>
    </header>
  );
}

type MobileMenuProps = React.ComponentProps<"div"> & {
  open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div
      id="mobile-menu"
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/50 backdrop-blur-lg",
        "fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y md:hidden"
      )}
    >
      <div
        data-slot={open ? "open" : "closed"}
        className={cn(
          "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 ease-out",
          "size-full p-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

function ListItem({
  title,
  description,
  icon: Icon,
  className,
  href,
  ...props
}: React.ComponentProps<typeof NavigationMenuLink> & NavItem) {
  return (
    <NavigationMenuLink
      className={cn(
        "w-full flex flex-row gap-x-2 data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-sm p-2",
        className
      )}
      {...props}
      asChild
    >
      <Link href={href}>
        <div className="bg-background/40 flex aspect-square size-12 items-center justify-center rounded-md border shadow-sm">
          <Icon className="text-foreground size-5" />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="font-medium">{title}</span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </div>
      </Link>
    </NavigationMenuLink>
  );
}
