import { createActionHeaders } from "@solana/actions";

const headers = createActionHeaders();

export const dynamic = "force-dynamic";

export const GET = async (req: Request) => {
  const origin = new URL(req.url).origin;
  const apiPath = `${origin}/api/actions/transfer-sol`;

  return Response.json(
    {
      rules: [
        { pathPattern: "/tip", apiPath },
        { pathPattern: "/", apiPath },
      ],
    },
    { headers },
  );
};

export const OPTIONS = async () => Response.json(null, { headers });
