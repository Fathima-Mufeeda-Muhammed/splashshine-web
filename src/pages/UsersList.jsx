import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "https://splash-shine-api.onrender.com";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}/admin/users`)
      .then(res => {
        if (res.data.users && Array.isArray(res.data.users)) {
          setUsers(res.data.users);
        } else {
          setUsers([]);
          setError("Invalid data format received");
        }
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Server may be waking up, please retry.");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  const deleteUser = (userId, userName) => {
    Swal.fire({
      title: "Delete User?",
      html: `Are you sure you want to delete <strong>${userName}</strong>?<br/><span style="color:#dc2626; font-size:13px;">This action cannot be undone.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${API_URL}/admin/users/${userId}`)
          .then(() => {
            setUsers(users.filter(u => u.id !== userId));
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: `${userName} has been deleted successfully.`,
              confirmButtonColor: "#10b981",
              timer: 2500,
              timerProgressBar: true,
            });
          })
          .catch(err => {
            console.error("Error deleting user:", err);
            Swal.fire({
              icon: "error",
              title: "Failed!",
              text: "Failed to delete user. Please try again.",
              confirmButtonColor: "#ef4444",
            });
          });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600">Loading users...</span>
          <span className="text-sm text-gray-400 mt-1">Server may be waking up, please wait...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchUsers} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Registered Users ({users.length})</h2>
        <button onClick={fetchUsers} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200">
          🔄 Refresh
        </button>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500">No users found</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left border text-xs font-semibold text-gray-700 uppercase">ID</th>
                <th className="p-3 text-left border text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="p-3 text-left border text-xs font-semibold text-gray-700 uppercase">Email</th>
                <th className="p-3 text-left border text-xs font-semibold text-gray-700 uppercase">Mobile</th>
                <th className="p-3 text-left border text-xs font-semibold text-gray-700 uppercase">Registered</th>
                <th className="p-3 text-left border text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr className="border hover:bg-gray-50 transition-colors" key={u.id}>
                  <td className="p-3 border text-sm text-gray-700">{u.id}</td>
                  <td className="p-3 border text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="p-3 border text-sm text-gray-700">{u.email}</td>
                  <td className="p-3 border text-sm text-gray-700">{u.mobile}</td>
                  <td className="p-3 border text-sm text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td className="p-3 border">
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersList;