import { useEffect, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { ProfileCard } from "../components/ProfileCard";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { listProfiles } from "../modules/discovery/discoveryService";
import { addFavorite } from "../modules/favorite/favoriteService";
import type { Profile } from "../services/types";

export function DiscoveryPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [addingProfileId, setAddingProfileId] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const authToken = token;

    async function loadProfiles() {
      try {
        setIsLoading(true);
        setError("");
        setProfiles(await listProfiles(authToken, query));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load profiles");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfiles();
  }, [query, token]);

  async function handleAddFavorite(profileId: string) {
    if (!token || addingProfileId) {
      return;
    }

    try {
      setAddingProfileId(profileId);
      setError("");
      setFeedback("");
      await addFavorite(token, profileId);
      setFeedback("Profile added to favorites.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to add favorite");
    } finally {
      setAddingProfileId("");
    }
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow="Discovery"
        title="Find creator profiles"
        description="Search the current directory by display name, username, or bio and turn strong matches into favorites."
        badge="Searchable directory"
      />

      <div className="toolbar card toolbar-card">
        <div className="toolbar-copy">
          <strong>Search creators</strong>
          <span className="muted">Type a name, username, or a term from the bio.</span>
        </div>
        <input
          className="search-input"
          placeholder="Search profiles"
          disabled={isLoading}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {error ? <StatusMessage tone="error" message={error} /> : null}
      {!error && feedback ? <StatusMessage tone="success" message={feedback} /> : null}

      <div className="card-grid">
        {isLoading ? <Loader label="Loading profiles..." /> : null}
        {!isLoading && !error && !profiles.length ? (
          <EmptyState
            title="No profiles found"
            description="Try a broader search term or clear the query to browse the full creator directory."
          />
        ) : null}
        {!isLoading && !error
          ? profiles.map((profile) => (
              <div className="favorite-item" key={profile.id}>
                <ProfileCard profile={profile} />
                <button
                  className="button button-secondary"
                  disabled={addingProfileId === profile.id}
                  onClick={() => void handleAddFavorite(profile.id)}
                  type="button"
                >
                  {addingProfileId === profile.id ? "Adding..." : "Add to favorites"}
                </button>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
