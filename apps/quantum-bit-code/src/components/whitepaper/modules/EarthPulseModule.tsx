import { Globe, Brain, Shield, Radio, Thermometer, Activity, Eye, Zap, Code, Lightbulb, Building2, TrendingUp, Satellite, CloudRain, AlertTriangle, Database } from "lucide-react";

const EarthPulseModule = () => {
  return (
    <article className="whitepaper-module" id="earthpulse-module">
      {/* Module Header */}
      <header className="mb-8 pb-6 border-b border-border">
        <p className="text-quantum-green font-mono text-sm tracking-widest uppercase mb-2">Module 4</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          EarthPulse: The Intelligence Layer
        </h1>
        <p className="text-lg text-muted-foreground">
          A comprehensive environmental awareness system that provides real-time intelligence about 
          the physical signal environment—monitoring electromagnetic conditions, seismic activity, 
          and atmospheric states to optimize routing and detect anomalies.
        </p>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span>Version 2.0</span>
          <span>•</span>
          <span>Classification: UNCLASSIFIED // FOUO</span>
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Executive Summary</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          EarthPulse is the intelligence and situational awareness layer of the QBC ecosystem. It 
          continuously monitors the physical environment across which MESH 34 signals propagate, 
          providing the data necessary for optimal routing decisions, threat detection, and 
          predictive maintenance.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          By understanding the state of the physical world—from solar weather to seismic activity 
          to atmospheric conditions—EarthPulse enables the QBC system to make intelligent decisions 
          that maximize reliability, security, and performance.
        </p>
      </section>

      {/* TECHNICAL PERSPECTIVE */}
      <section className="mb-12 p-6 bg-quantum-green/5 border border-quantum-green/20 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-quantum-green/10 flex items-center justify-center">
            <Code className="w-6 h-6 text-quantum-green" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Technical Perspective</h2>
            <p className="text-sm text-quantum-green">For Systems Engineers & Data Scientists</p>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          Data Integration Architecture
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          EarthPulse aggregates data from multiple heterogeneous sources into a unified 
          environmental state model:
        </p>

        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground overflow-x-auto">
          <pre>{`┌─────────────────────────────────────────────────────────────┐
│                    EARTHPULSE DATA PIPELINE                  │
├─────────────────────────────────────────────────────────────┤
│  Sources:                                                    │
│  ├─ NOAA Space Weather Prediction Center (1-min updates)    │
│  ├─ USGS Earthquake Hazards Program (real-time)             │
│  ├─ ESA Space Weather Service (5-min updates)               │
│  ├─ GOES Satellite Imagery (15-min updates)                 │
│  ├─ Global Ionosphere Radio Observatory (continuous)        │
│  └─ Private Sensor Networks (configurable)                  │
│                                                              │
│  Processing:                                                 │
│  ├─ Ingestion Layer (Apache Kafka)                          │
│  ├─ Stream Processing (Apache Flink)                        │
│  ├─ Feature Extraction (TensorFlow/PyTorch)                 │
│  ├─ Prediction Models (LSTM + Transformer ensemble)         │
│  └─ State Store (Redis + TimescaleDB)                       │
│                                                              │
│  Output: EnvironmentalStateVector @ 1Hz refresh             │
└─────────────────────────────────────────────────────────────┘`}</pre>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Predictive Models</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          EarthPulse employs specialized ML models for different prediction horizons:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-bold text-foreground">Phenomenon</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Model Type</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Horizon</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Accuracy</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">Ionospheric TEC</td>
                <td className="py-2 px-3">LSTM Ensemble</td>
                <td className="py-2 px-3">1-24 hours</td>
                <td className="py-2 px-3">94.2%</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">Geomagnetic Storms</td>
                <td className="py-2 px-3">Transformer + Physics</td>
                <td className="py-2 px-3">24-72 hours</td>
                <td className="py-2 px-3">87.5%</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">Tropospheric Ducting</td>
                <td className="py-2 px-3">CNN + Weather Model</td>
                <td className="py-2 px-3">1-12 hours</td>
                <td className="py-2 px-3">91.8%</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Seismic Propagation</td>
                <td className="py-2 px-3">Graph Neural Network</td>
                <td className="py-2 px-3">Real-time</td>
                <td className="py-2 px-3">96.1%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">API Endpoints</h4>
        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground">
          <pre>{`GET /api/earthpulse/state
  → Current global environmental state vector

GET /api/earthpulse/forecast?lat=X&lon=Y&hours=24
  → Location-specific propagation forecast

GET /api/earthpulse/anomalies?since=timestamp
  → Detected anomalies since timestamp

POST /api/earthpulse/route-quality
  Body: { path: [[lat,lon], ...], medium: "atmosphere" }
  → Quality assessment for proposed signal route

WebSocket /ws/earthpulse/stream
  → Real-time environmental updates (1Hz)`}</pre>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Anomaly Detection Engine</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          EarthPulse distinguishes between natural environmental variations and potential 
          adversarial actions using a multi-stage detection pipeline:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">Stage 1 - Statistical:</strong> Z-score deviation from rolling baseline (threshold: 3σ)</li>
          <li><strong className="text-foreground">Stage 2 - Contextual:</strong> Correlation with expected natural phenomena (solar activity, weather)</li>
          <li><strong className="text-foreground">Stage 3 - Behavioral:</strong> Comparison against known attack signatures</li>
          <li><strong className="text-foreground">Stage 4 - Multi-sensor:</strong> Cross-validation across independent sensor networks</li>
        </ul>
      </section>

      {/* LAYMAN PERSPECTIVE */}
      <section className="mb-12 p-6 bg-secondary/20 border border-secondary/30 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Everyday Understanding</h2>
            <p className="text-sm text-muted-foreground">Plain English Explanation</p>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          What Is EarthPulse, Really?
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Think of EarthPulse as the "weather forecast" for radio signals and communications. Just 
          like you check the weather before planning outdoor activities, MESH 34 checks EarthPulse 
          before deciding how to send your message.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          But EarthPulse monitors much more than just weather. It watches:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li><strong className="text-foreground">Space weather:</strong> Solar flares and magnetic storms that can disrupt satellites and radio</li>
          <li><strong className="text-foreground">Earth's crust:</strong> Earthquakes and geological activity that affect underground signals</li>
          <li><strong className="text-foreground">The atmosphere:</strong> Conditions that help or hurt radio wave propagation</li>
          <li><strong className="text-foreground">The oceans:</strong> Temperature layers that affect underwater sound transmission</li>
        </ul>

        <h4 className="text-lg font-bold text-foreground mb-2">Think of It Like This:</h4>
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Regular GPS/Phone:</strong> "Hmm, no signal here. Oh well."
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              <strong className="text-foreground">With EarthPulse:</strong> "Solar activity is disrupting 
              satellites right now, but the ionosphere over the Pacific is stable—let's bounce the 
              signal off the atmosphere instead. Also, there's a temperature inversion in the 
              troposphere that will help extend range by 40%."
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Real-World Examples:</h4>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">During a solar storm:</strong> EarthPulse detects the 
            incoming disturbance hours in advance and automatically reroutes critical communications 
            through underground paths</li>
          <li><strong className="text-foreground">After an earthquake:</strong> EarthPulse immediately 
            maps which underground signal paths are still intact and which are damaged</li>
          <li><strong className="text-foreground">When someone tries to jam signals:</strong> EarthPulse 
            recognizes this isn't natural interference and alerts the system to switch to a different 
            frequency or medium</li>
        </ul>
      </section>

      {/* CORPORATE PERSPECTIVE */}
      <section className="mb-12 p-6 bg-accent/10 border border-accent/20 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Corporate & Strategic Value</h2>
            <p className="text-sm text-muted-foreground">Business Case & ROI Analysis</p>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          Predictive Intelligence for Critical Operations
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Space weather and environmental disruptions cause an estimated $2-3 billion in annual 
          damages to communication infrastructure, power grids, and satellite operations. EarthPulse 
          transforms organizations from reactive to proactive in managing these risks.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-3">Industry Applications</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Satellite className="w-6 h-6 text-quantum-green mb-2" />
            <h5 className="font-bold text-foreground mb-1">Satellite Operators</h5>
            <p className="text-sm text-muted-foreground">
              Predict solar radiation events and protect spacecraft. Optimize ground station 
              handoffs based on atmospheric conditions.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Zap className="w-6 h-6 text-quantum-green mb-2" />
            <h5 className="font-bold text-foreground mb-1">Power Grid Operators</h5>
            <p className="text-sm text-muted-foreground">
              Geomagnetic storm warnings enable protective measures before induced currents 
              damage transformers.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Radio className="w-6 h-6 text-quantum-green mb-2" />
            <h5 className="font-bold text-foreground mb-1">Telecommunications</h5>
            <p className="text-sm text-muted-foreground">
              Predict HF propagation windows for intercontinental links. Avoid outages 
              through proactive frequency management.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Activity className="w-6 h-6 text-quantum-green mb-2" />
            <h5 className="font-bold text-foreground mb-1">Aviation</h5>
            <p className="text-sm text-muted-foreground">
              GNSS accuracy predictions for precision approaches. HF reliability for 
              oceanic flights.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">Competitive Intelligence Benefits</h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-foreground">Capability</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Without EarthPulse</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">With EarthPulse</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Storm preparation time</td>
                <td className="py-3 px-4">Minutes (if at all)</td>
                <td className="py-3 px-4">24-72 hours advance warning</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Communication reliability</td>
                <td className="py-3 px-4">Reactive troubleshooting</td>
                <td className="py-3 px-4">Proactive optimization</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Jamming detection</td>
                <td className="py-3 px-4">Minutes to hours</td>
                <td className="py-3 px-4">&lt;100ms automated response</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Situational awareness</td>
                <td className="py-3 px-4">Fragmented data sources</td>
                <td className="py-3 px-4">Unified real-time picture</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">Data Monetization Opportunities</h4>
        <p className="text-muted-foreground leading-relaxed">
          Organizations with EarthPulse access can offer premium services to customers requiring 
          high-reliability communications, predictive maintenance scheduling, and insurance 
          risk assessment.
        </p>
      </section>

      {/* Core Capabilities */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
          <Globe className="w-6 h-6 text-quantum-green" />
          Core Capabilities
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-quantum-green/10 border border-quantum-green/30 rounded-lg">
            <Brain className="w-6 h-6 text-quantum-green shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Environmental Awareness</h4>
              <p className="text-sm text-muted-foreground">
                Continuous monitoring of all factors that affect signal propagation across MESH 34 
                media: ionospheric conditions, geomagnetic activity, seismic waves, oceanic 
                temperature gradients, and atmospheric turbulence.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-quantum-green/10 border border-quantum-green/30 rounded-lg">
            <Shield className="w-6 h-6 text-quantum-green shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Threat Detection</h4>
              <p className="text-sm text-muted-foreground">
                Identification of jamming attempts, interception activities, and manipulation 
                attacks through analysis of signal anomalies that don't match predicted 
                environmental conditions.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-quantum-green/10 border border-quantum-green/30 rounded-lg">
            <Activity className="w-6 h-6 text-quantum-green shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Predictive Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Machine learning models that predict future propagation conditions, enabling 
                proactive route optimization before conditions degrade. Predictions are updated 
                continuously based on real-time sensor data.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-quantum-green/10 border border-quantum-green/30 rounded-lg">
            <Radio className="w-6 h-6 text-quantum-green shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Spectrum Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Wide-band monitoring of electromagnetic spectrum usage, identifying interference 
                sources, available frequency windows, and potential covert channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Monitoring Domains */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Monitoring Domains</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          EarthPulse integrates data from multiple sensor networks and monitoring systems:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-quantum-green" />
              <h4 className="font-display font-bold text-foreground">Space Weather</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Solar flare activity and CME predictions</li>
              <li>• Geomagnetic storm indices (Kp, Dst)</li>
              <li>• Ionospheric electron density maps</li>
              <li>• Solar wind speed and density</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-6 h-6 text-quantum-green" />
              <h4 className="font-display font-bold text-foreground">Seismic Activity</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Global seismograph network integration</li>
              <li>• Crustal stress monitoring</li>
              <li>• Volcanic activity tracking</li>
              <li>• Subsurface wave propagation modeling</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Thermometer className="w-6 h-6 text-quantum-green" />
              <h4 className="font-display font-bold text-foreground">Atmospheric Conditions</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Tropospheric ducting indices</li>
              <li>• Humidity and precipitation data</li>
              <li>• Temperature inversion layers</li>
              <li>• Wind shear and turbulence</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-6 h-6 text-quantum-green" />
              <h4 className="font-display font-bold text-foreground">Oceanic Monitoring</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• SOFAR channel condition assessment</li>
              <li>• Thermocline depth and gradient</li>
              <li>• Current and eddy mapping</li>
              <li>• Acoustic noise floor measurement</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Technical Specifications</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-foreground">Parameter</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Specification</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Sensor Data Sources</td>
                <td className="py-3 px-4">NOAA, USGS, ESA, GOES, Ground Networks</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Update Frequency</td>
                <td className="py-3 px-4">1-60 seconds (parameter dependent)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Prediction Horizon</td>
                <td className="py-3 px-4">Minutes to 72 hours (model dependent)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Anomaly Detection Latency</td>
                <td className="py-3 px-4">&lt;100ms (local processing)</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Data Retention</td>
                <td className="py-3 px-4">90 days (compressed) + historical baselines</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
};

export default EarthPulseModule;