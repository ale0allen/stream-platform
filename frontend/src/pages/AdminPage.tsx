import { useEffect, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { listUsers, updateUserStatus } from "../modules/admin/adminService";
import type { UserSummary } from "../services/types";

export function AdminPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const authToken = token;

    async function loadUsers() {
      try {
        setIsLoading(true);
        setError("");
        setSuccessMessage("");
        const response = await listUsers(authToken);
        setUsers(response);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load users");
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, [token]);

  async function handleStatusToggle(user: UserSummary) {
    if (!token || pendingUserId) {
      return;
    }

    try {
      setPendingUserId(user.id);
      setError("");
      setSuccessMessage("");

      const updatedUser = await updateUserStatus(token, user.id, !user.active);
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) => (currentUser.id === updatedUser.id ? updatedUser : currentUser))
      );
      setSuccessMessage(`${updatedUser.email} is now ${updatedUser.active ? "active" : "inactive"}.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update user status");
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow="Admin"
        title="Users"
        description="Basic user listing for administrative review."
      />

      {isLoading ? <div className="state-card">Loading users...</div> : null}
      {!isLoading && error ? <div className="form-error">{error}</div> : null}
      {!isLoading && !error && successMessage ? <div className="form-success">{successMessage}</div> : null}
      {!isLoading && !error && users.length === 0 ? <div className="state-card">No users found.</div> : null}

      {!isLoading && !error && users.length > 0 ? (
        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.active ? "Active" : "Inactive"}</td>
                  <td>
                    <button
                      className="button button-secondary table-action-button"
                      onClick={() => void handleStatusToggle(user)}
                      type="button"
                      disabled={pendingUserId !== null}
                    >
                      {pendingUserId === user.id
                        ? "Saving..."
                        : user.active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
