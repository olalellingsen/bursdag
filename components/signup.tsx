"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

function Signup() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const routeAfterLogin = async (uid: string) => {
    const profileRef = doc(db, "profiles", uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      router.push("/");
      return;
    }

    router.push("/profile");
  };

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return;
    }

    void routeAfterLogin(currentUser.uid);
  }, []);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const credential = await signInWithPopup(auth, provider);
      await routeAfterLogin(credential.user.uid);
    } catch (error) {
      console.error(error);
      setErrorMessage("Innlogging med Google feilet. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const provider = new FacebookAuthProvider();

      const credential = await signInWithPopup(auth, provider);
      await routeAfterLogin(credential.user.uid);
    } catch (error) {
      console.error(error);
      setErrorMessage("Innlogging med Facebook feilet. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card text-center max-w-3xl mx-auto">
      <h2>Meld meg på</h2>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="button"
        >
          {isSubmitting ? "Logger inn..." : "Logg inn med Google"}
        </button>

        <button
          type="button"
          onClick={handleFacebookLogin}
          disabled={isSubmitting}
          className="button"
        >
          {isSubmitting ? "Logger inn..." : "Logg inn med Facebook"}
        </button>
      </div>
      {errorMessage ? <p className="text-red-700">{errorMessage}</p> : null}
    </section>
  );
}

export default Signup;
