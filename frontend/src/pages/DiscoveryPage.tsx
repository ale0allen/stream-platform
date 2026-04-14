import { useEffect, useState } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { SectionHeader } from "../components/SectionHeader";
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
        title="Find streamer profiles"
        description="Search the current streamer directory by display name, username, or bio."
      />

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search profiles"
          disabled={isLoading}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="card-grid">
        {isLoading ? <div className="state-card">Loading profiles...</div> : null}
        {!isLoading && error ? <div className="form-error">{error}</div> : null}
        {!isLoading && !error && feedback ? <div className="form-success">{feedback}</div> : null}
        {!isLoading && !error && !profiles.length ? <div className="state-card">No profiles found.</div> : null}
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
