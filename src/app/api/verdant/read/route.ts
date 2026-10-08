import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { CalldataEncodable } from "genlayer-js/types";
import { NextResponse } from "next/server";

const DEFAULT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_VERDANT_RELAY_CONTRACT || DEFAULT_CONTRACT_ADDRESS) as `0x${string}`;
const endpoint = process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api";

type EncodedArg =
  | string
  | number
  | boolean
  | null
  | EncodedArg[]
  | { __verdantBigInt: string }
  | { [key: string]: EncodedArg };

function decodeArg(value: EncodedArg): CalldataEncodable {
  if (Array.isArray(value)) return value.map((item) => decodeArg(item)) as CalldataEncodable;
  if (value && typeof value === "object") {
    const maybeBigInt = (value as { __verdantBigInt?: unknown }).__verdantBigInt;
    if (typeof maybeBigInt === "string") return BigInt(maybeBigInt);
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decodeArg(item as EncodedArg)])) as CalldataEncodable;
  }
  return value as CalldataEncodable;
}

export async function POST(request: Request) {
  try {
    if (!CONTRACT_ADDRESS || /^0x0{40}$/i.test(CONTRACT_ADDRESS)) {
      throw new Error("Verdant Relay contract not configured.");
    }
    const body = await request.json() as { functionName?: string; args?: EncodedArg[] };
    if (!body.functionName) throw new Error("functionName is required.");
    const client = createClient({ chain: studionet, endpoint });
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: body.functionName,
      args: (body.args ?? []).map(decodeArg),
    });
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to read Verdant Relay." },
      { status: 500 },
    );
  }
}
