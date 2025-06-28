"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin-auth');
      const data = await response.json();
      
      if (response.ok && data.success && data.user) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin/login');
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/login');
      return;
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, userRole: string, userEmail: string) => {
    if (userRole === "ADMIN") {
      if (!confirm(`Are you sure you want to delete the admin user "${userEmail}"? This action cannot be undone and may affect system access.`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete the user "${userEmail}"?`)) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      
      setUsers(users.filter((user) => user.id !== id));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === "ALL") return true;
    return user.role === filter;
  });

  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const userCount = users.filter(u => u.role === "USER").length;

  if (!isAuthenticated || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="admin-heading">User Management</h2>
          <p className="text-[#a7a9b4] mt-1">
            Total: {users.length} users ({adminCount} admin{adminCount !== 1 ? 's' : ''}, {userCount} regular user{userCount !== 1 ? 's' : ''})
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="btn-primary flex items-center justify-center text-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New User
        </Link>
      </div>

      {/* Filter Tabs - Mobile Responsive */}
      <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:space-x-1 sm:bg-[#3c3f4a] sm:p-1 sm:rounded-lg sm:w-fit">
        {[
          { key: "ALL", label: "All Users", count: users.length },
          { key: "ADMIN", label: "Admins", count: adminCount },
          { key: "USER", label: "Users", count: userCount }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              filter === tab.key
                ? "bg-[#68D08B] text-white"
                : "bg-[#3c3f4a] sm:bg-transparent text-[#a7a9b4] hover:text-white hover:bg-[#404055]"
            }`}
          >
            <span className="hidden sm:inline">{tab.label} ({tab.count})</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]} ({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Table Container - Mobile Responsive */}
      <div className="admin-container p-0">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead className="bg-[#373946] border-b border-[#404055]">
              <tr>
                <th className="admin-table-th-mobile">User</th>
                <th className="admin-table-th-mobile hidden sm:table-cell">Email</th>
                <th className="admin-table-th-mobile">Role</th>
                <th className="admin-table-th-mobile hidden md:table-cell">Created</th>
                <th className="admin-table-th-mobile text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#404055]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#373946] transition-colors duration-200">
                  <td className="admin-table-td-mobile">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${
                        user.role === "ADMIN" ? "bg-[#68D08B]" : "bg-[#6b7280]"
                      }`}>
                        {user.role === "ADMIN" ? (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-white truncate">
                          {user.name || "No name set"}
                        </div>
                        <div className="text-xs text-[#a7a9b4] sm:hidden truncate">
                          {user.email}
                        </div>
                        {user.role === "ADMIN" && (
                          <div className="text-xs text-[#68D08B]">Administrator</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="admin-table-td-mobile hidden sm:table-cell">
                    <div className="text-sm text-white truncate">{user.email}</div>
                  </td>
                  <td className="admin-table-td-mobile">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "ADMIN" 
                        ? "bg-[#68D08B]/20 text-[#68D08B]" 
                        : "bg-[#6b7280]/20 text-[#a7a9b4]"
                    }`}>
                      {user.role === "ADMIN" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="admin-table-td-mobile hidden md:table-cell">
                    <div className="text-sm text-[#a7a9b4]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="admin-table-td-mobile text-right">
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="text-[#68D08B] hover:text-[#5abc7a] transition-colors duration-200 px-2 py-1 sm:px-0 sm:py-0 rounded sm:rounded-none bg-[#373946] sm:bg-transparent text-xs sm:text-sm"
                        title="Edit user"
                      >
                        <span className="sm:hidden">Edit</span>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.role, user.email)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200 px-2 py-1 sm:px-0 sm:py-0 rounded sm:rounded-none bg-[#373946] sm:bg-transparent text-xs sm:text-sm"
                        title="Delete user"
                      >
                        <span className="sm:hidden">Delete</span>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 sm:px-6 py-12 text-center">
                    <div className="text-[#a7a9b4]">
                      {filter === "ALL" ? (
                        <>
                          <svg className="w-12 h-12 mx-auto mb-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-lg font-medium mb-2">No users found</p>
                          <p>Create your first user by clicking the "Add New User" button.</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-medium mb-2">No {filter.toLowerCase()} users found</p>
                          <p>Try switching to a different filter or create a new user.</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 