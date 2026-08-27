import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { Wallet, LogOut, Zap, ShieldCheck } from 'lucide-react';
import { fetchBalance } from './lib/wallet';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [payAmount, setPayAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined' || !window.kcc20) return;
    try {
      const accounts = await window.kcc20.getAccounts();
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        const bal = await fetchBalance(address);
        setBalance(bal);
      } else {
        setIsConnected(false);
        setWalletAddress('');
        setBalance(0);
      }
    } catch (error: any) {
      const errMsg = typeof error === 'string' ? error : error?.message || '';
      if (!errMsg.toLowerCase().includes('connect kcc20 wallet first')) {
        console.warn('Silent check error:', errMsg);
      }
      setIsConnected(false);
      setWalletAddress('');
      setBalance(0);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 3000);

    const handleAccountsChanged = () => {
      checkConnection();
    };

    if (typeof window !== 'undefined' && window.kcc20?.on) {
      window.kcc20.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined' && window.kcc20?.removeListener) {
        window.kcc20.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [checkConnection]);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.kcc20) {
      toast.error('Scorpion Wallet (KCC20 SDK) is not installed or injected.');
      return;
    }
    try {
      await window.kcc20.connect();
      await checkConnection();
      toast.success('Wallet connected');
    } catch (error: any) {
      const errMsg = typeof error === 'string' ? error : error?.message || 'Connection failed';
      if (errMsg.toLowerCase().includes('cancel') || errMsg.toLowerCase().includes('reject')) {
        toast.info('Connection cancelled by user');
      } else {
        toast.error(errMsg);
      }
    }
  };

  const disconnectWallet = async () => {
    if (typeof window !== 'undefined' && window.kcc20?.disconnect) {
      try {
        await window.kcc20.disconnect();
      } catch (error) {
        console.warn('Disconnect method failed', error);
      }
    }
    setIsConnected(false);
    setWalletAddress('');
    setBalance(0);
    toast.info('Wallet disconnected');
  };

  const executeTrade = async () => {
    if (!payAmount || isNaN(Number(payAmount)) || Number(payAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (typeof window === 'undefined' || !window.kcc20) return;
    
    setIsProcessing(true);
    const loadingToastId = toast.loading('Waiting for wallet approval...');
    
    try {
      const result = await window.kcc20.buyKron({
        tick: 'KKDAG',
        amount: Number(payAmount)
      });
      
      const txid = typeof result === 'string' ? result : (result?.txid || result?.hash || '');
      
      if (txid) {
        toast.success(`Transaction successful! TXID: ${txid.substring(0, 8)}...`, { id: loadingToastId });
      } else {
        toast.success('Transaction submitted successfully!', { id: loadingToastId });
      }
      
      setPayAmount('');
      checkConnection();
    } catch (error: any) {
      const errMsg = typeof error === 'string' ? error : error?.message || 'Transaction failed';
      if (errMsg.toLowerCase().includes('cancel') || errMsg.toLowerCase().includes('reject')) {
        toast.info('Transaction cancelled by user', { id: loadingToastId });
      } else {
        toast.error(errMsg, { id: loadingToastId });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const truncateAddr = (addr: string) => addr ? `${addr.substring(0, 10)}...${addr.substring(addr.length - 8)}` : '';
  const estimatedReceive = payAmount && !isNaN(Number(payAmount)) ? Number(payAmount) * 99 : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e0e0e0] font-sans selection:bg-teal-500/30 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,78,59,0.05) 0%, transparent 70%)' }} />
      </div>

      <Toaster theme="dark" position="top-center" />

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">KKDAG <span className="text-teal-500">PROTOCOL</span></span>
        </div>
        
        {isConnected ? (
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end mr-2 hidden sm:flex">
              <div className="flex items-center space-x-2 text-[11px] text-teal-500/80 uppercase tracking-widest font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                <span>Network: Mainnet</span>
              </div>
              <div className="text-xs text-white/40">Polling active (3s)</div>
            </div>
            <div className="flex items-center space-x-3 bg-[#16161e] border border-white/10 px-3 py-1.5 rounded-full">
              <span className="text-xs font-mono text-teal-400">{truncateAddr(walletAddress)}</span>
              <button
                onClick={disconnectWallet}
                className="hover:bg-white/5 p-1 rounded-full text-white/50 hover:text-white transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="px-4 py-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">
              KAS KNIGHT
            </h1>
            <p className="text-white/40 text-sm">Secure KKDAG token acquisition portal.</p>
          </div>

          <div className="bg-[#16161e] border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-white">Exchange KAS for <span className="text-teal-400 font-bold">KKDAG</span></h2>
              <div className="bg-teal-500/10 text-teal-400 text-[10px] px-2 py-0.5 rounded border border-teal-500/20 uppercase tracking-tighter">
                SDK v170 Ready
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">
                  Pay (KAS)
                </label>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    className="bg-transparent text-4xl font-light focus:outline-none w-full text-white placeholder-white/20"
                  />
                  <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-[#35D07F] flex items-center justify-center text-[10px] text-black font-bold">K</div>
                    <span className="font-bold text-white">KAS</span>
                  </div>
                </div>
                {isConnected && (
                  <div className="mt-3 flex justify-between text-xs text-white/30">
                    <span>Spendable Balance: <span className="text-teal-500/80 font-mono">{balance.toLocaleString(undefined, { maximumFractionDigits: 8 })}</span></span>
                    <span className="cursor-pointer hover:text-white transition-colors underline underline-offset-4" onClick={() => setPayAmount(balance.toString())}>Use Max</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center -my-3 relative z-20">
                <div className="w-10 h-10 rounded-full bg-[#16161e] border border-white/5 flex items-center justify-center shadow-lg hover:border-teal-500/50 transition-all">
                  <Zap className="w-5 h-5 text-teal-400" />
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">
                  Estimated Receive (KKDAG)
                </label>
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-light text-teal-400 truncate pr-4">
                    {estimatedReceive.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-2 bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/20 shrink-0">
                    <span className="font-bold text-teal-400">KKDAG</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-white/30">
                  <span>Rate: 1 KAS = 99 KKDAG</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a0a0c] font-bold py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] active:scale-[0.98] flex items-center justify-center space-x-2"
                >
                  <span>CONNECT SCORPION WALLET</span>
                </button>
              ) : (
                <button
                  onClick={executeTrade}
                  disabled={isProcessing || !payAmount || Number(payAmount) <= 0}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a0a0c] font-bold py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                >
                  <span>{isProcessing ? 'PROCESSING DECENTRALIZED PURCHASE...' : 'EXECUTE DECENTRALIZED PURCHASE'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
