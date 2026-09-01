import React, { useState, useEffect, useCallback } from 'react';
import './styles/stitch-tokens.css';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import KPISection from './components/dashboard/KPISection';
import RiskStratification from './components/dashboard/RiskStratification';
import HourlyHeatmap from './components/dashboard/HourlyHeatmap';
import LiveFeed from './components/sentinel/LiveFeed';
import ExplainabilityModal from './components/inspector/ExplainabilityModal';
import PolicyCostLab from './components/policy/PolicyCostLab';
import EvidenceResponder from './components/evidence/EvidenceResponder';
import { fetchDashboard, fetchMetrics, fetchRecentAlerts } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inspectItem, setInspectItem] = useState(null);

  const loadAllData = useCallback(async (isSilent = false) => {
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
    } catch (err) {
      console.error('Data sync failed:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const tabTitles = {
    dashboard: 'Executive Risk Overview',
    sentinel: 'Live Transaction Sentinel Stream',
    inspector: 'AI Threat Scorer & Feature Attribution',
    policy: 'Cost-Aware Policy & Decision Threshold Lab',
    evidence: 'Automated Chargeback Evidence Rebuttal Kit',
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--stitch-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--stitch-accent-primary)',
          animation: 'stitch-spin 0.8s linear infinite',
          marginBottom: 16
        }}></div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Initializing AI Risk Sentinel...</div>
        <div style={{ fontSize: 12, color: 'var(--stitch-text-muted)', marginTop: 4 }}>Loading EVT GPD tail models & inference pipeline</div>
      </div>
    );
  }

  return (
    <div className="stitch-app-layout">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Operational Shell */}
      <div className="stitch-main-shell">
        <Header
          isRefreshing={refreshing}
          onRefresh={() => loadAllData(false)}
          activeTabName={tabTitles[activeTab] || 'Console'}
        />

        <main className="stitch-content-area">
          {activeTab === 'dashboard' && (
            <>
              <KPISection summary={dashboard?.summary} metrics={metrics} />
              <RiskStratification
                lossBreakdown={dashboard?.loss_breakdown}
                riskDistribution={dashboard?.risk_distribution}
                categoryRisk={dashboard?.category_risk}
              />
              <HourlyHeatmap
                hourlyPattern={dashboard?.hourly_pattern}
                categoryRisk={dashboard?.category_risk}
              />
            </>
          )}

          {activeTab === 'sentinel' && (
            <LiveFeed
              onInspectTransaction={(txn) => {
                setActiveTab('inspector');
              }}
            />
          )}

          {activeTab === 'inspector' && (
            <ExplainabilityModal initialTxn={inspectItem} />
          )}

          {activeTab === 'policy' && (
            <PolicyCostLab metrics={metrics} />
          )}

          {activeTab === 'evidence' && (
            <EvidenceResponder />
          )}
        </main>
      </div>
    </div>
  );
}
