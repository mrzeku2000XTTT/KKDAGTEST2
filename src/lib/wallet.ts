export async function fetchBalance(address: string): Promise<number> {
  let sompi = 0;
  
  try {
    let network = 'mainnet';
    try {
      if (window.kcc20?.getNetwork) {
        network = await window.kcc20.getNetwork();
      }
    } catch (e) {
      network = 'mainnet';
    }

    let restSuccess = false;
    if (!network.includes('testnet')) {
      try {
        const res = await fetch(`https://api.kaspa.org/addresses/${address}/balance`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.balance === 'number') {
            sompi = Number(data.balance);
            restSuccess = true;
          }
        }
      } catch (e) {
        console.warn('REST balance fetch failed', e);
      }
    }

    if (!restSuccess) {
      let kaswareSuccess = false;
      if (window.kasware?.getBalance && !window.kasware.isKcc20Shim) {
        try {
          const kaswareBal = await window.kasware.getBalance();
          if (kaswareBal) {
            const val = Number(kaswareBal.spendable ?? kaswareBal.available ?? kaswareBal.confirmed ?? kaswareBal.total ?? 0);
            if (!isNaN(val) && val > 0) {
              sompi = val;
              kaswareSuccess = true;
            }
          }
        } catch (e) {
          console.warn('Kasware balance fetch failed', e);
        }
      }

      if (!kaswareSuccess && window.kcc20?.getBalance) {
        try {
          const sdkBal = await window.kcc20.getBalance();
          if (typeof sdkBal === 'number') {
            sompi = sdkBal;
          } else if (sdkBal && typeof sdkBal === 'object') {
            const val = Number(sdkBal.spendable ?? sdkBal.available ?? sdkBal.confirmed ?? sdkBal.balance ?? sdkBal.total ?? 0);
            if (!isNaN(val) && val > 0) {
              sompi = val;
            } else if (typeof sdkBal.balanceKAS === 'number') {
              sompi = sdkBal.balanceKAS * 100_000_000;
            }
          }
        } catch (e) {
          console.warn('SDK balance fetch failed', e);
        }
      }
    }
  } catch (e) {
    console.error('fetchBalance unhandled error', e);
  }

  return sompi / 100_000_000;
}
