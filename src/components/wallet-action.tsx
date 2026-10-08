"use client";

import type { CalldataEncodable } from "genlayer-js/types";
import { useWallet } from "@/components/wallet-provider";
import { useTransaction } from "@/lib/tx/useTransaction";

export function useWalletAction(onFinalized?: () => Promise<void> | void) {
  const { address: wallet, connect } = useWallet();
  const { error, transactions, send: sendTx } = useTransaction(onFinalized);

  async function send(label: string, functionName: string, args: CalldataEncodable[], value = 0n) {
    const account = wallet ?? (await connect().catch(() => undefined));
    if (!account) return;
    await sendTx(label, functionName, args, account, value);
  }

  return { wallet, error, transactions, send };
}
