export default function Home() {
  const actionUrl = "/api/actions/transfer-sol";
  const dialTo = `https://dial.to/?action=${encodeURIComponent(`solana-action:${typeof window !== "undefined" ? window.location.origin : "https://solana-actions-blinks-demo.vercel.app"}${actionUrl}`)}`;

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 720, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Solana Actions & Blinks — Live Demo</h1>
      <p>Devnet SOL tip jar Action powered by <code>@solana/actions</code>.</p>
      <ul>
        <li>
          Action API:{" "}
          <a href={actionUrl} target="_blank" rel="noreferrer">
            {actionUrl}
          </a>
        </li>
        <li>
          Blinks Inspector:{" "}
          <a href="https://www.blinks.xyz/inspector" target="_blank" rel="noreferrer">
            blinks.xyz/inspector
          </a>
        </li>
      </ul>
      <p>
        Test in Inspector — paste your deployed Action URL (must be HTTPS).
      </p>
    </main>
  );
}
