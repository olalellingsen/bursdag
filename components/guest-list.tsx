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
    <section className="card space-y-4">
      <h2>Påmeldte</h2>

      {loading ? <p>Laster gjester...</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}

      {!loading && !error && guests.length === 0 ? (
        <p>Ingen er påmeldt enda.</p>
      ) : null}

      {!loading && !error && guests.length > 0 ? (
        <ul className="space-y-3">
          {guests.map((guest) => (
            <li key={guest.id}>
              <div className="flex items-center gap-3">
                {guest.photoURL ? (
                  <Image
                    width={50}
                    height={50}
                    src={guest.photoURL}
                    alt={`Profilbilde av ${guest.displayName}`}
                    className="rounded-full object-cover size-16"
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
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
