"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AdminDashboardTableSkeleton } from "@/components/admin/AdminDashboardTableSkeleton";
import {
  Search, Filter, Eye, CheckCircle, Clock, XCircle,
  FileText, Users, Plus, ChevronLeft, ChevronRight
} from "lucide-react";
import { formatDate, formatPhone, cn } from "@/lib/utils/cn";
import type { UserCV, CVStatus } from "@/types";
import { getCVs } from "@/app/actions/cv";
import { statusConfig } from "@/lib/constants";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [debouncedSearch] = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCVs({ 
        status: statusFilter, 
        search: debouncedSearch, 
        page: currentPage,
        limit 
      });
      setUsers(result.users as unknown as UserCV[]);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const stats = {
    total,
    pending: users.filter((u) => u.status === "pending").length,
    reviewed: users.filter((u) => u.status === "reviewed").length,
    completed: users.filter((u) => u.status === "completed").length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Gestiona los currículums registrados
            </p>
          </div>
          <Button onClick={() => router.push("/admin/cv/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo CV
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Pendientes</span>
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Revisando</span>
            </div>
            <p className="text-2xl font-bold">{stats.reviewed}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Completados</span>
            </div>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          options={[
            { value: "all", label: "Todos los estados" },
            { value: "pending", label: "Pendientes" },
            { value: "reviewed", label: "Revisando" },
            { value: "completed", label: "Completados" },
          ]}
          className="w-full md:w-48"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card rounded-lg border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Nombre</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Teléfono</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Email</th>
                <th className="text-left p-4 font-medium">Estado</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Fecha</th>
                <th className="text-left p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <tbody>
                {loading ? (
                  <AdminDashboardTableSkeleton rows={6} />
                ) : users.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No se encontraron registros
                    </td>
                  </motion.tr>
                ) : (
                  users.map((user, index) => {
                    const status = statusConfig[user.status];
                    return (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "border-t hover:bg-muted/50 transition-colors",
                          !user.viewed && "bg-primary/5"
                        )}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {user.photo && (
                              <img
                                src={user.photo}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              {!user.viewed && (
                                <Badge variant="info" className="text-xs">Nuevo</Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <a
                            href={`https://wa.me/${user.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            className="text-primary hover:underline"
                          >
                            {formatPhone(user.phone)}
                          </a>
                        </td>
                        <td className="p-4 hidden lg:table-cell text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="p-4">
                          <Badge variant={status.variant}>
                            <status.icon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-muted-foreground text-sm">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="p-4">
                          <Link href={`/admin/cv/${user._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </AnimatePresence>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, total)} de {total} registros
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
