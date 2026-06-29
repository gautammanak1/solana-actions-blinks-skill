import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
  ActionError,
  LinkedAction,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { DEFAULT_SOL_ADDRESS, DEFAULT_SOL_AMOUNT } from "./const";

const headers = createActionHeaders();

export const dynamic = "force-dynamic";

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { toPubkey } = validatedQueryParams(requestUrl);

    const baseHref = new URL(
      `/api/actions/transfer-sol?to=${toPubkey.toBase58()}`,
      requestUrl.origin,
    ).toString();

    const payload: ActionGetResponse = {
      type: "action",
      title: "solana-actions-blinks-skill — Tip Jar",
      icon: new URL("/icon.png", requestUrl.origin).toString(),
      description: "Devnet demo: send SOL via Solana Action blink. Built with @solana/actions.",
      label: "Transfer",
      links: {
        actions: [
          { type: "action", label: "Tip 0.01 SOL", href: `${baseHref}&amount=0.01` },
          { type: "action", label: "Tip 0.1 SOL", href: `${baseHref}&amount=0.1` },
          { type: "action", label: "Tip 1 SOL", href: `${baseHref}&amount=1` },
          {
            type: "action",
            label: "Custom Tip",
            href: `${baseHref}&amount={amount}`,
            parameters: [
              {
                name: "amount",
                label: "Enter SOL amount",
                required: true,
                type: "number",
                min: 0.001,
                max: 10,
              },
            ],
          },
        ] as unknown as LinkedAction[],
      },
    };

    return Response.json(payload, { headers });
  } catch (err) {
    const message = typeof err === "string" ? err : "An unknown error occurred";
    return Response.json({ message } satisfies ActionError, { status: 400, headers });
  }
};

export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { amount, toPubkey } = validatedQueryParams(requestUrl);
    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch {
      throw 'Invalid "account" provided';
    }

    const connection = new Connection(
      process.env.SOLANA_RPC ?? clusterApiUrl("devnet"),
    );

    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(0);
    if (lamports < minimumBalance) {
      throw "Transfer too small for rent exemption";
    }

    const transferIx = SystemProgram.transfer({
      fromPubkey: account,
      toPubkey,
      lamports,
    });

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const transaction = new Transaction({
      feePayer: account,
      blockhash,
      lastValidBlockHeight,
    }).add(transferIx);

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: `Send ${amount} SOL on devnet`,
      },
    });

    return Response.json(payload, { headers });
  } catch (err) {
    const message = typeof err === "string" ? err : "An unknown error occurred";
    return Response.json({ message } satisfies ActionError, { status: 400, headers });
  }
};

function validatedQueryParams(requestUrl: URL) {
  let toPubkey: PublicKey = DEFAULT_SOL_ADDRESS;
  let amount: number = DEFAULT_SOL_AMOUNT;

  try {
    if (requestUrl.searchParams.get("to")) {
      toPubkey = new PublicKey(requestUrl.searchParams.get("to")!);
    }
  } catch {
    throw "Invalid query parameter: to";
  }

  try {
    if (requestUrl.searchParams.get("amount")) {
      amount = parseFloat(requestUrl.searchParams.get("amount")!);
    }
    if (amount <= 0 || amount > 10) throw "amount out of range";
  } catch {
    throw "Invalid query parameter: amount";
  }

  return { amount, toPubkey };
}
