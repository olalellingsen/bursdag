"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ProfileEditor from "@/components/profile-editor";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser) {
        router.replace("/");
        return;
      }

      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/");
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto space-y-4">
        <p>Laster profil...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      <section className="space-y-2">
        <h1>Profil</h1>
        <Link href="/" className="underline">
          Tilbake til forsiden
        </Link>
      </section>

      <ProfileEditor user={user} />

      <button className="button" type="button" onClick={handleSignOut}>
        Logg ut
      </button>
    </main>
  );
}
