"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search, Filter, Eye, CheckCircle, Clock, XCircle,
  FileText, Users
} from "lucide-react";
import { formatDate, formatPhone, cn } from "@/lib/utils/cn";
import type { UserCV, CVStatus } from "@/types";

const statusConfig: Record<CVStatus, { label: string; variant: "warning" | "info" | "success"; icon: any }> = {
  pending: { label: "Pendiente", variant: "warning", icon: Clock },
  reviewed: { label: "Revisando", variant: "info", icon: Eye },
  completed: { label: "Completado", variant: "success", icon: CheckCircle },
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const { data } = await axios.get(`/api/cv?${params.toString()}`);
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: users.length,
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
        <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona los currículums registrados
        </p>
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
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const status = statusConfig[user.status];
                  return (
                    <tr
                      key={user._id}
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
