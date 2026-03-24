"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

function Signup() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      console.error(error);
      setErrorMessage("Innlogging med Google feilet. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card text-center fixed bottom-4 right-4 left-4 space-x-4 max-w-3xl mx-auto">
      <h2>Meld meg på</h2>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
        className="inline-flex rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Logger inn..." : "Logg inn med Google"}
      </button>
      {errorMessage ? <p className="text-red-700">{errorMessage}</p> : null}
    </section>
  );
}

export default Signup;
