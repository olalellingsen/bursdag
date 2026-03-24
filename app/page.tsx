"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Signup from "@/components/signup";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import GuestList from "@/components/guest-list";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <main className="max-w-3xl mx-auto space-y-8">
      <section className="space-y-4">
        <h1>Velkommen til min bursdag!</h1>
        <h2>Jeg blir 28 år og vil feire med deg!</h2>
        <h3>
          16. april 2026 kl 19.00 på{" "}
          <Link
            href="https://maps.app.goo.gl/L5Jje98GK4MY3RfL8"
            className="underline"
            target="_blank"
          >
            Fyrhuset Kuba
          </Link>
        </h3>
      </section>

      {loading ? <p>Laster...</p> : null}

      {!loading && !user ? <Signup /> : null}

      {!loading && user ? (
        <section>
          <GuestList />

          <div className="card text-center fixed bottom-4 right-4 left-4 space-x-4">
            <p>Innlogget som {user.displayName ?? user.email}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex rounded-md bg-black px-4 py-2 text-white"
            >
              Logg ut
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
