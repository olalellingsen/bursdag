import Link from "next/link";
import type { User } from "firebase/auth";

type UserFooterProps = {
  user: User;
  onSignOut: () => Promise<void>;
};

export default function UserFooter({ user, onSignOut }: UserFooterProps) {
  return (
    <footer className="fixed w-full right-0 p-4 bottom-0 bg-card z-20">
      <div className="flex flex-col gap-2 sm:flex-row justify-between items-center">
        <p className="text-center">
          Innlogget som {user.displayName ?? user.email}
        </p>

        <div className="flex gap-2">
          <Link href="/profil" className="button">
            Rediger profil
          </Link>

          <button
            type="button"
            onClick={() => void onSignOut()}
            className="button"
          >
            Logg ut
          </button>
        </div>
      </div>
    </footer>
  );
}
