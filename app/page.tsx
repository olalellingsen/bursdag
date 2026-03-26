"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Signup from "@/components/signup";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import GuestList from "@/components/guest-list";
import UserFooter from "@/components/user-footer";
import Image from "next/image";

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
    <main className="max-w-3xl mx-auto flex flex-col gap-4">
      <section className="space-y-4">
        <h1>Velkommen til Olas bursdag!</h1>
        <h2>
          Torsdag 16. april 2026 kl 19.00 på{" "}
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
          sikkert dra videre til et sted på f.eks Løkka etter dette for de som
          vil! Håper du har mulighet til å komme, og ta gjerne med deg din +1☺️
        </p>
        <Image
          src="/img.jpeg"
          alt="Fyrhuset Kuba"
          width={500}
          height={500}
          className="rounded-lg w-full max-w-sm my-8 mx-auto rotate-4"
        />
      </section>

      <section>
        {loading ? <p>Laster...</p> : null}
        {!loading && !user ? <Signup /> : null}
        {!loading && user ? <GuestList /> : null}
      </section>

      {!loading && user ? (
        <UserFooter user={user} onSignOut={handleSignOut} />
      ) : null}
    </main>
  );
}
