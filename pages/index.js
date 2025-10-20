import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';

const CONTRACT_ADDRESS = '0x62264D8aEA99df1D27d3345C743980a90b869850';

// Import ABI
import TipBotABI from '../bot/TipBot.json';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [userId, setUserId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { writeContract, data: hash } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Read balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TipBotABI.abi,
    functionName: 'getBalance',
    args: [userId],
  });

  // Read stats
  const { data: stats, refetch: refetchStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TipBotABI.abi,
    functionName: 'getStats',
    args: [userId],
  });

  useEffect(() => {
    if (isConfirmed) {
      setMessage('Transaction successful!');
      refetchBalance();
      refetchStats();
      setTimeout(() => setMessage(''), 5000);
    }
  }, [isConfirmed]);

  const handleDeposit = async () => {
    if (!userId || !depositAmount) {
      setError('Please enter User ID and amount');
      return;
    }

    try {
      setError('');
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: TipBotABI.abi,
        functionName: 'deposit',
        args: [userId],
        value: parseEther(depositAmount),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleWithdraw = async () => {
    if (!userId || !withdrawAddress || !withdrawAmount) {
      setError('Please fill all fields');
      return;
    }

    try {
      setError('');
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: TipBotABI.abi,
        functionName: 'withdraw',
        args: [userId, withdrawAddress, parseEther(withdrawAmount)],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">💰 Base Tip Bot</div>
            <ConnectButton />
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="card">
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Web Dashboard</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Manage your tip bot wallet deposits and withdrawals
            </p>

            {!isConnected && (
              <div className="error-message">
                ⚠️ Please connect your wallet to use the dashboard
              </div>
            )}

            {message && <div className="success-message">✅ {message}</div>}
            {error && <div className="error-message">❌ {error}</div>}

            <div className="form-group">
              <label className="form-label">Your Telegram User ID</label>
              <input
                className="form-input"
                type="text"
                placeholder="tg_123456789"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <small style={{ color: '#64748b', display: 'block', marginTop: '0.5rem' }}>
                Get your ID from the Telegram bot: /start
              </small>
            </div>

            {userId && balance !== undefined && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{formatEther(balance || 0n)} ETH</div>
                  <div className="stat-label">Balance</div>
                </div>
                {stats && (
                  <>
                    <div className="stat-card">
                      <div className="stat-value">{formatEther(stats[1] || 0n)} ETH</div>
                      <div className="stat-label">Tips Sent</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{formatEther(stats[2] || 0n)} ETH</div>
                      <div className="stat-label">Tips Received</div>
                    </div>
                  </>
                )}
              </div>
            )}

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>💵 Deposit</h2>
            <div className="form-group">
              <label className="form-label">Amount (ETH)</label>
              <input
                className="form-input"
                type="number"
                step="0.001"
                placeholder="0.001"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleDeposit}
              disabled={!isConnected || isConfirming}
            >
              {isConfirming ? 'Depositing...' : 'Deposit ETH'}
            </button>

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>💸 Withdraw</h2>
            <div className="form-group">
              <label className="form-label">Withdraw To (Address)</label>
              <input
                className="form-input"
                type="text"
                placeholder="0x..."
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (ETH)</label>
              <input
                className="form-input"
                type="number"
                step="0.001"
                placeholder="0.001"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleWithdraw}
              disabled={!isConnected || isConfirming}
            >
              {isConfirming ? 'Withdrawing...' : 'Withdraw ETH'}
            </button>

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f1f5f9', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📱 Use Telegram Bot</h3>
              <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>
                For the best experience, use our Telegram bot for instant tips:
              </p>
              <ul style={{ color: '#64748b', paddingLeft: '1.5rem' }}>
                <li>/tip @username amount - Send tips instantly</li>
                <li>/balance - Check your balance</li>
                <li>/stats - View your statistics</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>ℹ️ How It Works</h2>
            <ol style={{ color: '#64748b', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Get your Telegram User ID from the bot</li>
              <li>Deposit ETH using this dashboard or directly to the contract</li>
              <li>Send tips to friends using <code>/tip @username amount</code> in Telegram</li>
              <li>Withdraw anytime to any address</li>
            </ol>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '10px' }}>
              <strong>Platform Fee:</strong> 1% on all tips
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
