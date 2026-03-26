"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Signup from "@/components/signup";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import GuestList from "@/components/guest-list";
import UserFooter from "@/components/user-footer";
import Image from "next/image";
import { AddToCalendarButton } from "add-to-calendar-button-react";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [attendError, setAttendError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setIsAttending(false);
        setAttendError(null);
        setLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "profiles", nextUser.uid));
        setIsAttending(profileSnap.exists());
      } catch (error) {
        console.error(error);
        setAttendError("Kunne ikke hente påmeldingsstatus.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAttend = async () => {
    if (!user) {
      return;
    }

    setLoadingAttendance(true);
    setAttendError(null);

    try {
      const fallbackName =
        user.displayName ?? user.email?.split("@")[0] ?? "Ukjent gjest";

      await setDoc(
        doc(db, "profiles", user.uid),
        {
          uid: user.uid,
          email: user.email ?? "",
          displayName: fallbackName,
          bio: "",
          photoURL: user.photoURL ?? "",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setIsAttending(true);
      router.push("/profil");
    } catch (error) {
      console.error(error);
      setAttendError("Kunne ikke melde deg på. Prøv igjen.");
    } finally {
      setLoadingAttendance(false);
    }
  };

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

        <div className="flex justify-center sm:justify-start">
          <AddToCalendarButton
            name="Olas bursdag"
            options={["Apple", "Google"]}
            location="Fyrhuset Kuba, Oslo"
            startDate="2026-04-16T19:00:00"
            endDate="2026-04-16T23:00:00"
            timeZone="Europe/Oslo"
            size="small"
          />
        </div>

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

        {!loading && user && !isAttending ? (
          <section className="card space-y-3 mb-24">
            <h2>Kommer du?</h2>
            <p>Klikk under for å bekrefte at du kommer på bursdagen.</p>
            <button
              type="button"
              className="button"
              onClick={handleAttend}
              disabled={loadingAttendance}
            >
              {loadingAttendance ? "Melder på..." : "Jeg kommer"}
            </button>
            {attendError ? <p className="text-red-700">{attendError}</p> : null}
          </section>
        ) : null}

        {!loading && user && isAttending ? <GuestList /> : null}
      </section>

      {!loading && user ? (
        <UserFooter user={user} onSignOut={handleSignOut} />
      ) : null}
    </main>
  );
}
