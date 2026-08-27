export {};

declare global {
  interface KCC20 {
    connect: () => Promise<string[] | any>;
    disconnect?: () => Promise<void>;
    getAccounts: () => Promise<string[]>;
    getNetwork: () => Promise<string>;
    getBalance: () => Promise<any>;
    buyKron: (params: { tick: string; amount: number }) => Promise<any>;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  }

  interface Kasware {
    getBalance: () => Promise<any>;
    isKcc20Shim?: boolean;
  }

  interface Window {
    kcc20?: KCC20;
    kasware?: Kasware;
  }
}
