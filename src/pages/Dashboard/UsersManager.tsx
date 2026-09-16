import { useState } from "react";
import { Search, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function UsersManager() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const utils = trpc.useUtils();

  const { data: users, isLoading } = trpc.admin.users.useQuery({
    search,
    limit: pageSize,
    offset: page * pageSize,
  });
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      toast.success("User role updated");
    },
  });

  const totalPages = Math.max(1, Math.ceil((users?.total ?? 0) / pageSize));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-slate-500">Manage registered users</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search users..."
          className="pl-10"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-slate-800">
                <th className="pb-2 text-left font-medium">User</th>
                <th className="pb-2 text-left font-medium">Email</th>
                <th className="pb-2 text-left font-medium">Role</th>
                <th className="pb-2 text-left font-medium">Joined</th>
                <th className="pb-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {users?.items?.map((user) => (
                <tr key={user.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                      <span className="font-medium">{user.name || "Unnamed"}</span>
                    </div>
                  </td>
                  <td className="py-3">{user.email || "—"}</td>
                  <td className="py-3">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" && <Shield className="mr-1 h-3 w-3" />}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateRole.mutate({
                          id: user.id,
                          role: user.role === "admin" ? "user" : "admin",
                        })
                      }
                    >
                      Make {user.role === "admin" ? "User" : "Admin"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
