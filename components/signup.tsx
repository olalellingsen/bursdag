"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const EMAIL_FOR_SIGN_IN_KEY = "emailForSignIn";

function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const routeAfterLogin = async () => {
    router.push("/");
  };

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      void routeAfterLogin();
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const savedEmail = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
    const fallbackEmail = window.prompt(
      "Bekreft e-posten din for å fullføre innlogging:",
    );
    const resolvedEmail = (savedEmail ?? fallbackEmail ?? "").trim();

    if (!resolvedEmail) {
      setErrorMessage(
        "Mangler e-post for å fullføre innlogging med e-postlenke.",
      );
      setIsSubmitting(false);
      return;
    }

    void signInWithEmailLink(auth, resolvedEmail, window.location.href)
      .then(async () => {
        window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
        await routeAfterLogin();
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("Kunne ikke fullføre innlogging med e-postlenke.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, []);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithPopup(auth, provider);
      await routeAfterLogin();
    } catch (error) {
      console.error(error);
      setErrorMessage("Innlogging med Google feilet. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLinkLogin = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage("Skriv inn e-postadressen din først.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, normalizedEmail);
      setSuccessMessage(
        "Jeg har sendt deg en innloggingslenke på e-post (den kan havne i søppelposten).",
      );
      setEmail("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Kunne ikke sende innloggingslenke på e-post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card text-center max-w-3xl mx-auto">
      <h2>Meld deg på</h2>
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="button"
        >
          {isSubmitting ? "Logger inn..." : "med Google"}
        </button>

        <p>... eller med lenke på e-post</p>

        <div>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="navn@epost.no"
            className="border border-background rounded-lg w-full max-w-sm px-3 py-2"
            autoComplete="email"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="button"
          onClick={handleEmailLinkLogin}
          disabled={isSubmitting}
          className="button"
        >
          {isSubmitting ? "Sender lenke..." : "Send lenke"}
        </button>
      </div>

      {errorMessage ? <p className="text-red-700">{errorMessage}</p> : null}
      {successMessage ? <p>{successMessage}</p> : null}
    </section>
  );
}

export default Signup;
