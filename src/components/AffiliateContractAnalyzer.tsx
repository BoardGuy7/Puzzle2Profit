import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Brain, AlertCircle, TrendingUp, DollarSign, Shield, CheckCircle, X } from 'lucide-react';

interface Contract {
  id: string;
  tech_stack_id: string;
  contract_text: string;
  contract_url: string;
  affiliate_network: string;
  tracking_id: string;
  commission_type: string;
  commission_rate_primary: string;
  commission_rate_recurring: string;
  cookie_duration_days: number;
  payment_frequency: string;
  payment_threshold: number;
  ai_analysis_summary: string;
  ai_rating: number;
  ai_pros: string[];
  ai_cons: string[];
  ai_recommendations: string[];
  ai_risk_level: string;
  analyzed_at: string;
  tech_stacks?: {
    name: string;
  };
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  ai_recommendations: string[];
  status: string;
  created_at: string;
}

interface Props {
  selectedTechStackId?: string;
}

export default function AffiliateContractAnalyzer({ selectedTechStackId }: Props) {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tech_stack_id: selectedTechStackId || '',
    contract_text: '',
    contract_url: '',
    affiliate_network: '',
    tracking_id: ''
  });

  useEffect(() => {
    if (selectedTechStackId) {
      setFormData(prev => ({ ...prev, tech_stack_id: selectedTechStackId }));
    }
    loadContracts();
    loadAlerts();
  }, [selectedTechStackId]);

  const loadContracts = async () => {
    const { data } = await supabase
      .from('affiliate_contracts')
      .select('*, tech_stacks(name)')
      .order('analyzed_at', { ascending: false });

    if (data) setContracts(data as any);
  };

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('affiliate_monitoring_alerts')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setAlerts(data);
  };

  const analyzeContract = async () => {
    if (!formData.tech_stack_id || !formData.contract_text.trim()) {
      alert('Please select a tech stack and paste contract terms');
      return;
    }

    setAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Not authenticated');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/affiliate-contract-analyzer`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Contract Analyzed Successfully!\n\n` +
          `${result.analysis.summary}\n\n` +
          `AI Rating: ${result.analysis.rating}/10\n` +
          `Risk Level: ${result.analysis.risk_level}\n` +
          `Pros: ${result.analysis.pros_count}\n` +
          `Cons: ${result.analysis.cons_count}\n` +
          `Recommendations: ${result.analysis.recommendations_count}\n` +
          `Action Items: ${result.analysis.action_items_count}`
        );
        setShowAnalyzer(false);
        setFormData({
          tech_stack_id: selectedTechStackId || '',
          contract_text: '',
          contract_url: '',
          affiliate_network: '',
          tracking_id: ''
        });
        loadContracts();
        loadAlerts();
      } else {
        alert('Error: ' + (result.message || result.error));
      }
    } catch (error: any) {
      alert('Failed to analyze contract: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    await supabase
      .from('affiliate_monitoring_alerts')
      .update({ status: 'dismissed' })
      .eq('id', alertId);
    loadAlerts();
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 border border-purple-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-8 h-8 text-purple-300" />
              <h3 className="text-2xl font-bold text-white">Elite AI Affiliate Agent</h3>
            </div>
            <p className="text-purple-200 mb-4">
              Master affiliate marketer with 20+ years experience. Analyzes contracts, extracts terms,
              identifies risks, and provides strategic recommendations.
            </p>
            <button
              onClick={() => setShowAnalyzer(!showAnalyzer)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {showAnalyzer ? 'Close Analyzer' : '📋 Analyze New Contract'}
            </button>
          </div>
        </div>
      </div>

      {/* Contract Analysis Form */}
      {showAnalyzer && (
        <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-purple-700">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submit Contract for Analysis
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Affiliate Network (Optional)
              </label>
              <input
                type="text"
                value={formData.affiliate_network}
                onChange={(e) => setFormData({ ...formData, affiliate_network: e.target.value })}
                placeholder="e.g., ShareASale, CJ Affiliate, Direct"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Contract URL (Optional)
              </label>
              <input
                type="url"
                value={formData.contract_url}
                onChange={(e) => setFormData({ ...formData, contract_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tracking ID / Affiliate ID (Optional)
              </label>
              <input
                type="text"
                value={formData.tracking_id}
                onChange={(e) => setFormData({ ...formData, tracking_id: e.target.value })}
                placeholder="Your unique tracking ID"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Contract Terms / Agreement Text *
              </label>
              <textarea
                value={formData.contract_text}
                onChange={(e) => setFormData({ ...formData, contract_text: e.target.value })}
                placeholder="Paste the full affiliate contract or terms and conditions here... The AI will extract commission rates, payment terms, restrictions, and more."
                rows={12}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-purple-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-2">
                💡 Paste directly from PDF, email, or affiliate portal. The more detail, the better the analysis.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={analyzeContract}
                disabled={analyzing || !formData.contract_text.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Brain className="w-5 h-5" />
                {analyzing ? 'AI Analyzing...' : 'Analyze Contract with AI'}
              </button>
              <button
                onClick={() => setShowAnalyzer(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-yellow-700">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Active Alerts ({alerts.length})
          </h4>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-red-900 bg-opacity-20 border-red-700' :
                  alert.severity === 'warning' ? 'bg-yellow-900 bg-opacity-20 border-yellow-700' :
                  'bg-blue-900 bg-opacity-20 border-blue-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-white mb-1">{alert.title}</h5>
                    <p className="text-sm text-gray-300 mb-2">{alert.description}</p>
                    {alert.ai_recommendations && alert.ai_recommendations.length > 0 && (
                      <p className="text-xs text-gray-400">
                        💡 {alert.ai_recommendations[0]}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-white ml-4"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyzed Contracts */}
      {contracts.length > 0 && (
        <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Analyzed Contracts ({contracts.length})
          </h4>
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700 cursor-pointer hover:border-purple-500 transition-colors"
                onClick={() => setSelectedContract(selectedContract?.id === contract.id ? null : contract)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-semibold text-white mb-1">
                      {contract.tech_stacks?.name || 'Unknown Tool'}
                    </h5>
                    <p className="text-sm text-gray-400">{contract.affiliate_network || 'Direct'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded text-xs font-semibold ${
                      contract.ai_risk_level === 'low' ? 'bg-green-900 bg-opacity-50 text-green-300' :
                      contract.ai_risk_level === 'high' ? 'bg-red-900 bg-opacity-50 text-red-300' :
                      'bg-yellow-900 bg-opacity-50 text-yellow-300'
                    }`}>
                      {contract.ai_risk_level?.toUpperCase()} RISK
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">{contract.ai_rating}</div>
                      <div className="text-xs text-gray-400">/ 10</div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3">{contract.ai_analysis_summary}</p>

                {selectedContract?.id === contract.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                    {/* Commission Structure */}
                    <div>
                      <h6 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Commission Structure
                      </h6>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white ml-2">{contract.commission_type || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Primary Rate:</span>
                          <span className="text-green-400 ml-2 font-semibold">{contract.commission_rate_primary || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Cookie Duration:</span>
                          <span className="text-white ml-2">{contract.cookie_duration_days || 'N/A'} days</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Payment:</span>
                          <span className="text-white ml-2">{contract.payment_frequency || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pros */}
                    {contract.ai_pros && contract.ai_pros.length > 0 && (
                      <div>
                        <h6 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Pros
                        </h6>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                          {contract.ai_pros.map((pro, idx) => (
                            <li key={idx}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cons */}
                    {contract.ai_cons && contract.ai_cons.length > 0 && (
                      <div>
                        <h6 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Cons
                        </h6>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                          {contract.ai_cons.map((con, idx) => (
                            <li key={idx}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {contract.ai_recommendations && contract.ai_recommendations.length > 0 && (
                      <div>
                        <h6 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          AI Recommendations
                        </h6>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                          {contract.ai_recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                      Analyzed: {new Date(contract.analyzed_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {contracts.length === 0 && !showAnalyzer && (
        <div className="text-center py-12 bg-gray-900 bg-opacity-50 rounded-xl border border-gray-800">
          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">No contracts analyzed yet</p>
          <button
            onClick={() => setShowAnalyzer(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Analyze Your First Contract
          </button>
        </div>
      )}
    </div>
  );
}
