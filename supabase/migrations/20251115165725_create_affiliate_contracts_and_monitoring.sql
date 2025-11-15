/*
  # Create Affiliate Contract Analysis and Monitoring System

  ## New Tables

  1. **affiliate_contracts**
     - Stores detailed contract terms and AI analysis
     - Links to tech_stacks table
     - Tracks commission structure, payment terms, restrictions
     - Stores AI agent recommendations

  2. **affiliate_performance_metrics**
     - Tracks performance data over time
     - Clicks, conversions, revenue, commissions
     - Links to contracts and tech stacks

  3. **affiliate_monitoring_alerts**
     - AI-generated alerts and recommendations
     - Compliance issues, performance anomalies
     - Action items for user

  ## Purpose
  Enable elite AI agent to analyze affiliate contracts, extract key terms,
  monitor performance, and provide expert recommendations for optimization.
*/

-- Create affiliate_contracts table
CREATE TABLE IF NOT EXISTS affiliate_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_stack_id uuid REFERENCES tech_stacks(id) ON DELETE CASCADE,
  
  -- Contract Details
  contract_text text,
  contract_url text,
  affiliate_network text,
  tracking_id text,
  
  -- Commission Structure (AI extracted)
  commission_type text,
  commission_rate_primary text,
  commission_rate_recurring text,
  commission_tiers jsonb DEFAULT '[]'::jsonb,
  cookie_duration_days integer,
  
  -- Payment Terms (AI extracted)
  payment_frequency text,
  payment_threshold numeric(10,2),
  payment_methods text[],
  payout_delay_days integer,
  
  -- Restrictions & Requirements (AI extracted)
  geographic_restrictions text[],
  traffic_restrictions text[],
  promotional_restrictions text[],
  compliance_requirements text[],
  prohibited_keywords text[],
  
  -- AI Analysis
  ai_analysis_summary text,
  ai_rating numeric(3,2),
  ai_pros text[],
  ai_cons text[],
  ai_recommendations text[],
  ai_risk_level text CHECK (ai_risk_level IN ('low', 'medium', 'high')),
  
  -- Monitoring Setup
  performance_benchmarks jsonb DEFAULT '{}'::jsonb,
  alert_thresholds jsonb DEFAULT '{}'::jsonb,
  monitoring_frequency text DEFAULT 'daily',
  
  -- Status
  contract_status text DEFAULT 'active' CHECK (contract_status IN ('active', 'under_review', 'paused', 'terminated')),
  analyzed_at timestamptz,
  last_reviewed_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create affiliate_performance_metrics table
CREATE TABLE IF NOT EXISTS affiliate_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_stack_id uuid REFERENCES tech_stacks(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES affiliate_contracts(id) ON DELETE CASCADE,
  
  -- Time Period
  metric_date date NOT NULL,
  metric_period text DEFAULT 'daily' CHECK (metric_period IN ('daily', 'weekly', 'monthly')),
  
  -- Performance Data
  clicks integer DEFAULT 0,
  unique_clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  conversion_rate numeric(5,2),
  revenue numeric(10,2) DEFAULT 0,
  commission_earned numeric(10,2) DEFAULT 0,
  
  -- Engagement Metrics
  avg_time_on_site integer,
  bounce_rate numeric(5,2),
  pages_per_visit numeric(5,2),
  
  -- Traffic Sources
  traffic_sources jsonb DEFAULT '{}'::jsonb,
  
  -- AI Insights
  ai_performance_score numeric(3,2),
  ai_insights text[],
  anomalies_detected text[],
  
  created_at timestamptz DEFAULT now()
);

-- Create affiliate_monitoring_alerts table
CREATE TABLE IF NOT EXISTS affiliate_monitoring_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_stack_id uuid REFERENCES tech_stacks(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES affiliate_contracts(id) ON DELETE CASCADE,
  
  -- Alert Details
  alert_type text CHECK (alert_type IN ('performance', 'compliance', 'payment', 'contract_change', 'optimization')),
  severity text CHECK (severity IN ('info', 'warning', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  
  -- AI Recommendations
  ai_recommendations text[],
  suggested_actions text[],
  estimated_impact text,
  
  -- Status
  status text DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE affiliate_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_contracts
CREATE POLICY "Users can view own affiliate contracts"
  ON affiliate_contracts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tech_stacks
      WHERE tech_stacks.id = affiliate_contracts.tech_stack_id
    )
  );

CREATE POLICY "Users can insert own affiliate contracts"
  ON affiliate_contracts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tech_stacks
      WHERE tech_stacks.id = affiliate_contracts.tech_stack_id
    )
  );

CREATE POLICY "Users can update own affiliate contracts"
  ON affiliate_contracts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tech_stacks
      WHERE tech_stacks.id = affiliate_contracts.tech_stack_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tech_stacks
      WHERE tech_stacks.id = affiliate_contracts.tech_stack_id
    )
  );

-- RLS Policies for affiliate_performance_metrics
CREATE POLICY "Users can view own performance metrics"
  ON affiliate_performance_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tech_stacks
      WHERE tech_stacks.id = affiliate_performance_metrics.tech_stack_id
    )
  );

CREATE POLICY "Users can insert own performance metrics"
  ON affiliate_performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tech_stacks
      WHERE tech_stacks.id = affiliate_performance_metrics.tech_stack_id
    )
  );

-- RLS Policies for affiliate_monitoring_alerts
CREATE POLICY "Users can view own monitoring alerts"
  ON affiliate_monitoring_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tech_stacks
      WHERE tech_stacks.id = affiliate_monitoring_alerts.tech_stack_id
    )
  );

CREATE POLICY "Users can update own monitoring alerts"
  ON affiliate_monitoring_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tech_stacks
      WHERE tech_stacks.id = affiliate_monitoring_alerts.tech_stack_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tech_stacks
      WHERE tech_stacks.id = affiliate_monitoring_alerts.tech_stack_id
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_contracts_tech_stack ON affiliate_contracts(tech_stack_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_contracts_status ON affiliate_contracts(contract_status);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_tech_stack ON affiliate_performance_metrics(tech_stack_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON affiliate_performance_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_tech_stack ON affiliate_monitoring_alerts(tech_stack_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_status ON affiliate_monitoring_alerts(status);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_severity ON affiliate_monitoring_alerts(severity);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for affiliate_contracts
DROP TRIGGER IF EXISTS update_affiliate_contracts_updated_at ON affiliate_contracts;
CREATE TRIGGER update_affiliate_contracts_updated_at
  BEFORE UPDATE ON affiliate_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE affiliate_contracts IS 'Stores affiliate contract terms analyzed by AI agent';
COMMENT ON TABLE affiliate_performance_metrics IS 'Tracks affiliate performance metrics over time';
COMMENT ON TABLE affiliate_monitoring_alerts IS 'AI-generated alerts and recommendations for affiliate optimization';
COMMENT ON COLUMN affiliate_contracts.ai_rating IS 'AI rating of contract quality from 0-10';
COMMENT ON COLUMN affiliate_contracts.ai_risk_level IS 'AI-assessed risk level: low, medium, or high';