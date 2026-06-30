import { ActionBlink } from "../components/ActionBlink";
import { CopyButton } from "../components/CopyButton";
import { DevnetBanner } from "../components/DevnetBanner";

const PRODUCTION_ORIGIN = "https://solana-actions-blinks-demo-nine.vercel.app";
const ACTION_PATH = "/api/actions/transfer-sol";
const REPO_URL = "https://github.com/gautammanak1/solana-actions-blinks-skill";

export default function Home() {
  const actionUrl = `${PRODUCTION_ORIGIN}${ACTION_PATH}`;
  const curlCommand = `curl -s ${actionUrl} | jq '.title, .links.actions[].label'`;
  const dialToUrl = `https://dial.to/?action=${encodeURIComponent(`solana-action:${actionUrl}`)}`;

  return (
    <main className="page">
      <DevnetBanner />

      <header className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" aria-hidden />
          Devnet · Live on Vercel
        </div>
        <h1>Solana Actions &amp; Blinks Demo</h1>
        <p>
          Tip jar Action built with <code>@solana/actions</code>. Push to GitHub → auto-deploys
          from the <code>demo/</code> folder.
        </p>
      </header>

      <div className="grid grid-two">
        <ActionBlink />

        <aside className="card">
          <h2>How to test</h2>
          <ol className="steps">
            <li>
              <span className="step-num">1</span>
              <div className="step-body">
                <strong>Switch Phantom to Devnet</strong>
                <span>Settings → network → Devnet (not Mainnet)</span>
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div className="step-body">
                <strong>Pick a tip amount</strong>
                <span>0.01, 0.1, 1 SOL, or custom</span>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div className="step-body">
                <strong>Approve in wallet</strong>
                <span>Transaction lands on Solana devnet</span>
              </div>
            </li>
          </ol>
        </aside>
      </div>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>Action endpoints</h2>
        <ul className="link-list">
          <li>
            <span className="label">GET (JSON)</span>
            <a href={actionUrl} target="_blank" rel="noreferrer">
              {actionUrl}
            </a>
          </li>
          <li>
            <span className="label">actions.json</span>
            <a href={`${PRODUCTION_ORIGIN}/actions.json`} target="_blank" rel="noreferrer">
              {PRODUCTION_ORIGIN}/actions.json
            </a>
          </li>
          <li>
            <span className="label">Local path</span>
            <a href={ACTION_PATH} target="_blank" rel="noreferrer">
              {ACTION_PATH}
            </a>
          </li>
        </ul>
        <pre className="code-block">
          <CopyButton text={curlCommand} />
          {curlCommand}
        </pre>
      </section>

      <section className="card notice" style={{ marginTop: "1.25rem" }}>
        <h2>About dial.to &amp; Inspector</h2>
        <p>
          Third-party testers are unreliable right now — <strong>dial.to</strong> may return{" "}
          <code>503</code> and <strong>blinks.xyz/inspector</strong> often redirects to a parked
          page. Your Action can still be valid; use this page or curl instead.
        </p>
        <p>
          When dial.to works:{" "}
          <a href={dialToUrl} target="_blank" rel="noreferrer">
            open interstitial link
          </a>
        </p>
      </section>

      <footer className="footer">
        <span>Skill repo · Superteam Brasil bounty demo</span>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          View on GitHub →
        </a>
      </footer>
    </main>
  );
}
