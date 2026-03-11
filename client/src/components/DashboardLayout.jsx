import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar, } from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
var menuItems = [
    { icon: LayoutDashboard, label: "Page 1", path: "/" },
    { icon: Users, label: "Page 2", path: "/some-path" },
];
var SIDEBAR_WIDTH_KEY = "sidebar-width";
var DEFAULT_WIDTH = 280;
var MIN_WIDTH = 200;
var MAX_WIDTH = 480;
export default function DashboardLayout(_a) {
    var children = _a.children;
    var _b = useState(function () {
        var saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
        return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
    }), sidebarWidth = _b[0], setSidebarWidth = _b[1];
    var _c = useAuth(), loading = _c.loading, user = _c.user;
    useEffect(function () {
        localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
    }, [sidebarWidth]);
    if (loading) {
        return <DashboardLayoutSkeleton />;
    }
    if (!user) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button onClick={function () {
                window.location.href = getLoginUrl();
            }} size="lg" className="w-full shadow-lg hover:shadow-xl transition-all">
            Sign in
          </Button>
        </div>
      </div>);
    }
    return (<SidebarProvider style={{
            "--sidebar-width": "".concat(sidebarWidth, "px"),
        }}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>);
}
function DashboardLayoutContent(_a) {
    var _b, _c;
    var children = _a.children, setSidebarWidth = _a.setSidebarWidth;
    var _d = useAuth(), user = _d.user, logout = _d.logout;
    var _e = useLocation(), location = _e[0], setLocation = _e[1];
    var _f = useSidebar(), state = _f.state, toggleSidebar = _f.toggleSidebar;
    var isCollapsed = state === "collapsed";
    var _g = useState(false), isResizing = _g[0], setIsResizing = _g[1];
    var sidebarRef = useRef(null);
    var activeMenuItem = menuItems.find(function (item) { return item.path === location; });
    var isMobile = useIsMobile();
    useEffect(function () {
        if (isCollapsed) {
            setIsResizing(false);
        }
    }, [isCollapsed]);
    useEffect(function () {
        var handleMouseMove = function (e) {
            var _a, _b;
            if (!isResizing)
                return;
            var sidebarLeft = (_b = (_a = sidebarRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect().left) !== null && _b !== void 0 ? _b : 0;
            var newWidth = e.clientX - sidebarLeft;
            if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
                setSidebarWidth(newWidth);
            }
        };
        var handleMouseUp = function () {
            setIsResizing(false);
        };
        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        }
        return function () {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing, setSidebarWidth]);
    return (<>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button onClick={toggleSidebar} className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0" aria-label="Toggle navigation">
                <PanelLeft className="h-4 w-4 text-muted-foreground"/>
              </button>
              {!isCollapsed ? (<div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    Navigation
                  </span>
                </div>) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map(function (item) {
            var isActive = location === item.path;
            return (<SidebarMenuItem key={item.path}>
                    <SidebarMenuButton isActive={isActive} onClick={function () { return setLocation(item.path); }} tooltip={item.label} className={"h-10 transition-all font-normal"}>
                      <item.icon className={"h-4 w-4 ".concat(isActive ? "text-primary" : "")}/>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>);
        })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {(_b = user === null || user === void 0 ? void 0 : user.name) === null || _b === void 0 ? void 0 : _b.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {(user === null || user === void 0 ? void 0 : user.name) || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {(user === null || user === void 0 ? void 0 : user.email) || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4"/>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div className={"absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ".concat(isCollapsed ? "hidden" : "")} onMouseDown={function () {
            if (isCollapsed)
                return;
            setIsResizing(true);
        }} style={{ zIndex: 50 }}/>
      </div>

      <SidebarInset>
        {isMobile && (<div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background"/>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {(_c = activeMenuItem === null || activeMenuItem === void 0 ? void 0 : activeMenuItem.label) !== null && _c !== void 0 ? _c : "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>)}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>);
}
