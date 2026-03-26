"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { CircleUser } from "lucide-react";

type GuestProfile = {
  id: string;
  displayName: string;
  email: string;
  bio: string;
  photoURL: string;
};

export default function GuestList() {
  const [guests, setGuests] = useState<GuestProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "profiles"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextGuests = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Partial<GuestProfile>;

          return {
            id: docSnap.id,
            displayName: data.displayName ?? "Ukjent gjest",
            email: data.email ?? "",
            bio: data.bio ?? "",
            photoURL: data.photoURL ?? "",
          };
        });

        setGuests(nextGuests);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="space-y-4 mb-24 card">
      <h2 className="text-center">Påmeldte ({guests.length})</h2>

      {loading ? <p>Laster gjester...</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}

      {!loading && !error && guests.length === 0 ? (
        <p>Ingen er påmeldt enda.</p>
      ) : null}

      {!loading && !error && guests.length > 0 ? (
        <ul className="grid gap-4">
          {guests.map((guest) => (
            <li key={guest.id} className="flex gap-3 items-center">
              {guest.photoURL ? (
                <Image
                  width={50}
                  height={50}
                  src={guest.photoURL}
                  alt={`Profilbilde av ${guest.displayName}`}
                  className="rounded-full object-cover aspect-square size-20"
                />
              ) : (
                <CircleUser
                  className="size-16 stroke-white"
                  strokeWidth={0.5}
                />
              )}

              <div className="space-y-1">
                <p className="font-bold">{guest.displayName}</p>
                {guest.bio && (
                  <p className="text-muted-foreground">{guest.bio}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
