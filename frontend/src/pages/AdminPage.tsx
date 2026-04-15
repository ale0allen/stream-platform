import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { listUsers, updateUserStatus } from "../modules/admin/adminService";
import type { UserSummary } from "../services/types";
import { formatDateTime } from "../utils/format";

export function AdminPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
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
        setError(loadError instanceof Error ? loadError.message : t("pages.admin.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, [t, token]);

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
      setSuccessMessage(
        t("pages.admin.statusChanged", {
          email: updatedUser.email,
          status: t(updatedUser.active ? "common.status.active" : "common.status.inactive")
        })
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t("pages.admin.updateError"));
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow={t("pages.admin.eyebrow")}
        title={t("pages.admin.title")}
        description={t("pages.admin.description")}
        badge={t("pages.admin.badge")}
      />

      {isLoading ? <Loader label={t("pages.admin.loading")} /> : null}
      {!isLoading && error ? <StatusMessage tone="error" message={error} /> : null}
      {!isLoading && !error && successMessage ? <StatusMessage tone="success" message={successMessage} /> : null}
      {!isLoading && !error && users.length === 0 ? (
        <EmptyState title={t("pages.admin.emptyTitle")} description={t("pages.admin.emptyDescription")} />
      ) : null}

      {!isLoading && !error && users.length > 0 ? (
        <div className="card table-card">
          <div className="table-header">
            <div>
              <strong>{t("pages.admin.tableTitle")}</strong>
              <p className="muted">{t("pages.admin.tableDescription")}</p>
            </div>
            <span className="table-summary">{t("pages.admin.userCount", { count: users.length })}</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t("pages.admin.headers.email")}</th>
                  <th>{t("pages.admin.headers.role")}</th>
                  <th>{t("pages.admin.headers.status")}</th>
                  <th>{t("pages.admin.headers.updatedAt")}</th>
                  <th>{t("pages.admin.headers.action")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>
                      <span className="table-pill">{t(`common.role.${user.role}`)}</span>
                    </td>
                    <td>
                      <span className={`table-pill ${user.active ? "is-success" : "is-muted"}`}>
                        {t(user.active ? "common.status.active" : "common.status.inactive")}
                      </span>
                    </td>
                    <td>{formatDateTime(user.updatedAt)}</td>
                    <td>
                      <button
                        className="button button-secondary table-action-button"
                        onClick={() => void handleStatusToggle(user)}
                        type="button"
                        disabled={pendingUserId !== null}
                      >
                        {pendingUserId === user.id
                          ? t("common.actions.saving")
                          : user.active
                            ? t("common.actions.deactivate")
                            : t("common.actions.activate")}
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
