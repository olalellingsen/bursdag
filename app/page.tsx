import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-4">
      <h1>Velkommen til min bursdag!</h1>
      <h2>Jeg blir 28 år og vil feire med deg!</h2>
      <p>16. april 2026</p>
      <Link href="/pamelding">Meld deg på!</Link>
    </main>
  );
}
