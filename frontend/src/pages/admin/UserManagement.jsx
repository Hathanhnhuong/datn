import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Search, Plus, Trash2, Pencil, X } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/admin/users", {
        params: {
          page,
          limit,
          search: search || undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          is_active:
            statusFilter === "active"
              ? true
              : statusFilter === "locked"
                ? false
                : undefined,
        },
      });

      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delay);
  }, [page, limit, search, roleFilter, statusFilter]);

  /* ================= SAVE USER ================= */
  const handleSave = async () => {
    try {
      if (editingUser) {
        await axios.put(`/admin/users/${editingUser.id}`, {
          email: formData.email,
          role: formData.role,
        });
      } else {
        await axios.post("/admin/users", formData);
      }

      fetchUsers();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    try {
      await axios.delete(`/admin/users/${selectedUser.id}`);
      fetchUsers();
      setShowDelete(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= TOGGLE ================= */
  const toggleActive = async (user) => {
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, is_active: !u.is_active } : u,
    );

    setUsers(updatedUsers);

    try {
      await axios.patch(`/admin/users/${user.id}/status`, null, {
        params: { is_active: !user.is_active },
      });
    } catch (err) {
      console.error(err);
      fetchUsers(); // fallback nếu lỗi
    }
  };

  const toggleRole = async (user) => {
    await axios.patch(`/admin/users/${user.id}/role`);
    fetchUsers();
  };

  /* ================= MODAL HELPERS ================= */
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username:"",
      email: "",
      password: "",
      role: "user",
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white p-6 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl 
            bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-lg text-white"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>

        {/* FILTER */}
        <div className="bg-white border rounded-2xl p-4 flex flex-wrap gap-4 shadow">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              placeholder="Search email..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-10 pr-4 py-2 rounded-xl border"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value);
            }}
            className="border px-3 py-2 rounded-xl"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="border px-3 py-2 rounded-xl"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
          </select>

          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="border px-3 py-2 rounded-xl"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

        {/* TABLE */}
        {/* TABLE */}
        <div className="bg-white border rounded-2xl overflow-hidden shadow relative">
          {/* overlay loading */}
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Email</th>
                <th className="hidden md:table-cell">Role</th>
                <th className="hidden md:table-cell">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="p-4">{user.email}</td>

                    <td className="hidden md:table-cell">
                      <button
                        onClick={() => toggleRole(user)}
                        className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600"
                      >
                        {user.role}
                      </button>
                    </td>

                    <td className="hidden md:table-cell">
                      <button
                        onClick={() => toggleActive(user)}
                        className={`px-3 py-1 rounded-full ${
                          user.is_active
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.is_active ? "Active" : "Locked"}
                      </button>
                    </td>

                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => openEditModal(user)}>
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDelete(true);
                        }}
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center">
          <span>
            Page {page} of {totalPages || 1}
          </span>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded-lg ${
                  page === i + 1
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white"
                    : "bg-slate-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MODAL ADD / EDIT ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingUser ? "Edit User" : "Add User"}
              </h2>
              <button onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <input
  type="text"
  placeholder="Username"
  value={formData.username}
  onChange={(e) =>
    setFormData({ ...formData, username: e.target.value })
  }
  className="w-full border px-3 py-2 rounded-xl"
/>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-xl"
            />

            {!editingUser && (
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-xl"
              />
            )}

            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-xl"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={handleSave}
              className="w-full py-2 rounded-xl bg-indigo-500 text-white"
            >
              {editingUser ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM ================= */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-80 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-semibold text-center">
              Confirm delete?
            </h3>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
