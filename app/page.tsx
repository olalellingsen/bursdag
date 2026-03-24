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
      <section className="space-y-5">
        <h1>Velkommen til Olas bursdag!</h1>
        <h2>
          16. april 2026 kl 19.00 på{" "}
          <Link
            href="https://maps.app.goo.gl/L5Jje98GK4MY3RfL8"
            className="underline hover:no-underline"
            target="_blank"
          >
            Fyrhuset Kuba
          </Link>
        </h2>

        <p>
          Jeg blir 28 år og vil ha deg med på feiringen! 🎉 Jeg har booket 2.
          etasjen på Fyrhuset fra 19.00 og til det stenger kl 23.00, også kan vi
          sikkert dra videre til f.eks Løkka etter dette for de som vil!
        </p>
      </section>

      {loading ? <p>Laster...</p> : null}

      {!loading && !user ? <Signup /> : null}

      {!loading && user ? (
        <section>
          <GuestList />

          <footer className="card text-center fixed bottom-4 right-4 left-4 space-x-4 max-w-3xl mx-auto">
            <p>Innlogget som {user.displayName ?? user.email}</p>

            <div className="flex gap-2 justify-center">
              <Link href="/profile" className="button">
                Rediger profil
              </Link>

              <button type="button" onClick={handleSignOut} className="button">
                Logg ut
              </button>
            </div>
          </footer>
        </section>
      ) : null}
    </main>
  );
}
