import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axios.get("http://localhost:8000/admin/users")
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
        setError(err.message || "Failed to fetch users");
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
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
        axios.delete(`http://localhost:8000/admin/users/${userId}`)
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
    return <div className="p-6">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Registered Users ({users.length})</h2>

      {users.length === 0 ? (
        <p className="text-gray-500">No users found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 shadow-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left border">ID</th>
                <th className="p-3 text-left border">Name</th>
                <th className="p-3 text-left border">Email</th>
                <th className="p-3 text-left border">Mobile</th>
                <th className="p-3 text-left border">Registered</th>
                <th className="p-3 text-left border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr className="border hover:bg-gray-50" key={u.id}>
                  <td className="p-3 border">{u.id}</td>
                  <td className="p-3 border">{u.name}</td>
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border">{u.mobile}</td>
                  <td className="p-3 border text-sm text-gray-600">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 border">
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
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
