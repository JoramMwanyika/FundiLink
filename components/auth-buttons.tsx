"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { User, Settings, LogOut, LayoutDashboardIcon as Dashboard } from "lucide-react"
import Link from "next/link"

export function AuthButtons() {
  const { user, logout, isAuthenticated } = useAuth()

  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email || user.phone}</p>
              <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {user.role === "fundi" && (
            <DropdownMenuItem asChild>
              <Link href="/fundi/dashboard" className="cursor-pointer">
                <Dashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          )}

          {user.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Dashboard className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href="/login">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          Get Started
        </Button>
      </Link>
    </div>
  )
}
