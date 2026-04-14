import { useEffect, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
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
        title="User operations"
        description="Review account access and toggle active status without leaving the workspace."
        badge="Admin only"
      />

      {isLoading ? <Loader label="Loading users..." /> : null}
      {!isLoading && error ? <StatusMessage tone="error" message={error} /> : null}
      {!isLoading && !error && successMessage ? <StatusMessage tone="success" message={successMessage} /> : null}
      {!isLoading && !error && users.length === 0 ? (
        <EmptyState title="No users found" description="New accounts will appear here for administrative review." />
      ) : null}

      {!isLoading && !error && users.length > 0 ? (
        <div className="card table-card">
          <div className="table-header">
            <div>
              <strong>User directory</strong>
              <p className="muted">Manage activation status for every account in the platform.</p>
            </div>
          </div>
          <div className="table-scroll">
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
                    <td>
                      <span className="table-pill">{user.role}</span>
                    </td>
                    <td>
                      <span className={`table-pill ${user.active ? "is-success" : "is-muted"}`}>
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
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
        </div>
      ) : null}
    </section>
  );
}
