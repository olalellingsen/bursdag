"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";

type ProfileData = {
  displayName: string;
  bio: string;
  photoURL: string;
};

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

export default function ProfileEditor({ user }: { user: User }) {
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState(user.photoURL ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileRef = doc(db, "profiles", user.uid);
        const snap = await getDoc(profileRef);

        if (snap.exists()) {
          const data = snap.data() as Partial<ProfileData>;
          setDisplayName(data.displayName ?? user.displayName ?? "");
          setBio(data.bio ?? "");
          setPhotoURL(data.photoURL ?? user.photoURL ?? "");
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Kunne ikke hente profilen din akkurat nå.");
      } finally {
        setLoadingProfile(false);
      }
    };

    void loadProfile();
  }, [user.displayName, user.photoURL, user.uid]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!nextFile) {
      setFile(null);
      setFileError(null);
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      setFile(null);
      setFileError("Velg en bildefil (jpg, png, webp...).");
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      setFile(null);
      setFileError("Bildet kan maks være 4MB.");
      return;
    }

    setFile(nextFile);
    setFileError(null);
  };

  const handleRemoveImage = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const profileRef = doc(db, "profiles", user.uid);
      const currentPhotoURL = photoURL;

      if (currentPhotoURL && currentPhotoURL.includes("/profiles/")) {
        const imageRef = ref(storage, `profiles/${user.uid}/avatar`);
        await deleteObject(imageRef).catch(() => null);
      }

      await updateProfile(user, {
        photoURL: "",
      });

      await setDoc(
        profileRef,
        {
          photoURL: "",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setPhotoURL("");
      setFile(null);
      setSuccessMessage("Profilbildet ble fjernet.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Kunne ikke fjerne profilbildet.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      let nextPhotoURL = photoURL;

      if (file) {
        const imageRef = ref(storage, `profiles/${user.uid}/avatar`);
        await uploadBytes(imageRef, file, { contentType: file.type });
        nextPhotoURL = await getDownloadURL(imageRef);
      }

      const trimmedName = displayName.trim();
      const trimmedBio = bio.trim();

      await updateProfile(user, {
        displayName: trimmedName,
        photoURL: nextPhotoURL || null,
      });

      await setDoc(
        doc(db, "profiles", user.uid),
        {
          uid: user.uid,
          email: user.email ?? "",
          displayName: trimmedName,
          bio: trimmedBio,
          photoURL: nextPhotoURL,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setPhotoURL(nextPhotoURL);
      setFile(null);
      setSuccessMessage("Profilen er oppdatert.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Kunne ikke lagre profilen. Prøv igjen.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProfile) {
    return <p>Laster profil...</p>;
  }

  return (
    <section className="card space-y-4">
      <form className="space-y-4" onSubmit={handleSave}>
        <div className="space-y-2">
          <label htmlFor="displayName">Navn</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <textarea
            id="bio"
            value={bio}
            placeholder="Har du noe på hjertet?"
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block" htmlFor="photo">
            Profilbilde
          </label>
          <label
            htmlFor="photo"
            className="inline-flex rounded-md border border-dotted px-4 py-2 cursor-pointer hover:bg-background/50 transition-colors"
          >
            Velg profilbilde
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {fileError ? <p className="text-red-700">{fileError}</p> : null}
        </div>

        {previewUrl || photoURL ? (
          <Image
            src={previewUrl ?? photoURL}
            alt="Profilbilde"
            width={50}
            height={50}
            className="h-28 w-28 rounded-full object-cover border border-border"
          />
        ) : null}

        <div className="flex gap-2">
          {(photoURL || file) && !isSaving ? (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="inline-flex rounded-md border border-border px-4 py-2"
            >
              Fjern bilde
            </button>
          ) : null}

          <button className="button" type="submit" disabled={isSaving}>
            {isSaving ? "Lagrer..." : "Lagre"}
          </button>
        </div>

        {successMessage ? (
          <p className="text-green-700">{successMessage}</p>
        ) : null}
        {errorMessage ? <p className="text-red-700">{errorMessage}</p> : null}
      </form>
    </section>
  );
}
