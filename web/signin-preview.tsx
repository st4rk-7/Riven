
import { useState } from "react";
import { createRoot } from "react-dom/client";

import { SignIn } from "./screens/SignIn";
import "./index.css";

function SignInPreview() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <SignIn onSignIn={() => setSubmitted(true)} />

      {submitted && (
        <p
          role="status"
          className="fixed inset-x-4 bottom-4 mx-auto max-w-sm rounded-lg border border-default bg-default p-4 text-center text-sm shadow-lg"
        >
          This is a UI preview. No real sign-in has occurred.
        </p>
      )}
    </>
  );
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element missing");
}

createRoot(root).render(<SignInPreview />);
