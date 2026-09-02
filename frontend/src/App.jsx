import React, { useState, useEffect, useCallback } from 'react';
import './styles/enterprise.css';
import SidebarNav from './components/layout/SidebarNav';
import TopNav from './components/layout/TopNav';
import ExecutiveMetrics from './components/overview/ExecutiveMetrics';
import ThreatDistribution from './components/overview/ThreatDistribution';
import IntradayThreatCurve from './components/overview/IntradayThreatCurve';
import LiveTransactionLedger from './components/ledger/LiveTransactionLedger';
import TransactionDrawer from './components/ledger/TransactionDrawer';
import DecisionSimulator from './components/engine/DecisionSimulator';
import PolicyOptimizer from './components/engine/PolicyOptimizer';
import DisputeCaseKit from './components/dispute/DisputeCaseKit';
import FraudNetworkGraph from './components/network/FraudNetworkGraph';
import EVTStressTest from './components/evt/EVTStressTest';
import DeveloperHub from './components/developer/DeveloperHub';
import Toast from './components/ui/Toast';
import { fetchDashboard, fetchMetrics, fetchRecentAlerts } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const loadData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setRefreshing(true);
      const [dash, met, alr] = await Promise.all([
        fetchDashboard(),
        fetchMetrics(),
        fetchRecentAlerts()
      ]);
      setDashboard(dash);
      setMetrics(met);
      setAlerts(alr);
      setLoading(false);
    } catch (e) {
      console.error('Data sync failed:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global Keyboard Shortcuts (1-5 to navigate, Esc to close drawer)
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't trigger shortcut if typing in input/textarea
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      if (e.key === '1') setActiveTab('overview');
      if (e.key === '2') setActiveTab('ledger');
      if (e.key === '3') setActiveTab('simulator');
      if (e.key === '4') setActiveTab('policy');
      if (e.key === '5') setActiveTab('dispute');
      if (e.key === '6') setActiveTab('network');
      if (e.key === '7') setActiveTab('evt');
      if (e.key === '8') setActiveTab('developer');
      if (e.key === 'Escape') setSelectedTxn(null);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tabLabels = {
    overview: 'Executive Threat Overview',
    ledger: 'Real-Time Transaction Ledger',
    simulator: 'Inference & Decision Engine',
    policy: 'Cost & Policy Calibration',
    dispute: 'Chargeback Dispute Rebuttal',
    network: 'Fraud Ring Network Topology',
    evt: 'EVT Tail Risk Stress Test',
    developer: 'Developer SDK & Webhooks',
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '2px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.7s linear infinite',
          marginBottom: 12
        }}></div>
        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>SENTINEL RISK CORE INITIALIZING</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Loading neural ensemble & POT generalized pareto models...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Left Navigation Rail */}
      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Operational Window */}
      <div className="app-main">
        <TopNav
          isRefreshing={refreshing}
          onRefresh={() => loadData(false)}
          activeTabLabel={tabLabels[activeTab]}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="app-content">
          {activeTab === 'overview' && (
            <>
              <ExecutiveMetrics summary={dashboard?.summary} metrics={metrics} />
              <ThreatDistribution
                lossBreakdown={dashboard?.loss_breakdown}
                riskDistribution={dashboard?.risk_distribution}
                riskHistogram={dashboard?.risk_histogram}
              />
              <IntradayThreatCurve
                hourlyPattern={dashboard?.hourly_pattern}
                categoryRisk={dashboard?.category_risk}
              />
            </>
          )}

          {activeTab === 'ledger' && (
            <LiveTransactionLedger
              onSelectTransaction={(txn) => setSelectedTxn(txn)}
              externalFilter={searchQuery}
            />
          )}

          {activeTab === 'simulator' && (
            <DecisionSimulator />
          )}

          {activeTab === 'policy' && (
            <PolicyOptimizer metrics={metrics} />
          )}

          {activeTab === 'dispute' && (
            <DisputeCaseKit onShowToast={setToast} />
          )}

          {activeTab === 'network' && (
            <FraudNetworkGraph />
          )}

          {activeTab === 'evt' && (
            <EVTStressTest />
          )}

          {activeTab === 'developer' && (
            <DeveloperHub />
          )}
        </main>
      </div>

      {/* Forensic Slide-Out Drawer */}
      {selectedTxn && (
        <TransactionDrawer
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}

      {/* Global Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
