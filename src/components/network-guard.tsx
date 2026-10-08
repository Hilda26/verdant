"use client";

import { useEffect, useState } from "react";
import { STUDIONET_CHAIN_ID } from "@/lib/network";

export function useNetworkGuard() {
  const [wrongNetwork, setWrongNetwork] = useState(false);

  useEffect(() => {
    async function check() {
      if (!window.ethereum) return;
      const hex = await window.ethereum.request({ method: "eth_chainId" }).catch(() => undefined) as string | undefined;
      if (hex) setWrongNetwork(Number.parseInt(hex, 16) !== STUDIONET_CHAIN_ID);
    }
    void check();
  }, []);

  return { wrongNetwork };
}

export function NetworkGuard() {
  const { wrongNetwork } = useNetworkGuard();
  if (!wrongNetwork) return null;
  return <p className="form-error">Switch your wallet to GenLayer StudioNet before signing.</p>;
}
