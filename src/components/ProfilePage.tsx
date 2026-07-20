"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, ImagePlus, LogOut, Mail, Target, Trash2, Trophy, UserRound } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { CasinoCard, SecondaryButton } from "@/components/ui";
import { storage } from "@/lib/storage";
import { getLeaderboardForUser } from "@/lib/scoring";
import { useAuth } from "@/providers/AuthProvider";

function ProfileContent() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [avatarError, setAvatarError] = useState("");
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  if (!user) return null;

  const predictions = storage.getPredictions(user.id);
  const leaderboard = getLeaderboardForUser(user);
  const rank = leaderboard.findIndex((entry) => entry.userId === user.id) + 1;
  const entry = leaderboard.find((item) => item.userId === user.id);

  function handleLogout() {
    logout();
    router.replace("/");
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Kies een geldig afbeeldingsbestand.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setAvatarError("De foto mag maximaal 6 MB groot zijn.");
      return;
    }

    setAvatarError("");
    setIsProcessingAvatar(true);
    try {
      const avatarUrl = await createAvatarDataUrl(file);
      updateProfile({ avatarUrl });
    } catch {
      setAvatarError("De foto kon niet worden verwerkt. Probeer een andere foto.");
    } finally {
      setIsProcessingAvatar(false);
    }
  }

  return (
    <>
      <header className="page-heading profile-heading">
        <div
          className={`profile-monogram ${user.avatarUrl ? "profile-monogram--photo" : ""}`}
          style={user.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : undefined}
          role={user.avatarUrl ? "img" : undefined}
          aria-label={user.avatarUrl ? `Profielfoto van ${user.firstName} ${user.lastName}` : undefined}
          aria-hidden={user.avatarUrl ? undefined : "true"}
        >
          {!user.avatarUrl && <>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</>}
        </div>
        <div className="avatar-actions">
          <label className="avatar-upload">
            <ImagePlus size={17} />{isProcessingAvatar ? "Foto verwerken…" : user.avatarUrl ? "Foto wijzigen" : "Foto uploaden"}
            <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={isProcessingAvatar} />
          </label>
          {user.avatarUrl && (
            <button type="button" className="avatar-remove" onClick={() => updateProfile({ avatarUrl: undefined })}>
              <Trash2 size={16} />Verwijderen
            </button>
          )}
        </div>
        <p className="avatar-help">JPG, PNG of WebP · maximaal 6 MB</p>
        {avatarError && <p className="form-error avatar-error" role="alert">{avatarError}</p>}
        <p className="eyebrow">Spelerskaart</p>
        <h1>{user.firstName} {user.lastName}</h1>
        <p>@{user.username}</p>
      </header>

      <div className="profile-stats">
        <CasinoCard><Target size={22} /><strong>{predictions.length}</strong><span>Ingevuld</span></CasinoCard>
        <CasinoCard><Trophy size={22} /><strong>{rank}</strong><span>Positie</span></CasinoCard>
        <CasinoCard><span className="card-suit-icon">♦</span><strong>{entry?.points ?? 0}</strong><span>Punten</span></CasinoCard>
      </div>

      <CasinoCard className="profile-details">
        <h2>Profielgegevens</h2>
        <dl>
          <div><dt><UserRound size={17} />Naam</dt><dd>{user.firstName} {user.lastName}</dd></div>
          <div><dt><AtSign size={17} />Gebruikersnaam</dt><dd>{user.username}</dd></div>
          <div><dt><Mail size={17} />E-mailadres</dt><dd>{user.email}</dd></div>
        </dl>
      </CasinoCard>

      <SecondaryButton type="button" onClick={handleLogout} className="logout-button"><LogOut size={19} />Uitloggen</SecondaryButton>
    </>
  );
}

export function ProfilePage() {
  return <ProtectedPage><ProfileContent /></ProtectedPage>;
}

async function createAvatarDataUrl(file: File): Promise<string> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - sourceSize) / 2;
    const sourceY = (image.naturalHeight - sourceSize) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 320;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas wordt niet ondersteund");
    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 320, 320);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
