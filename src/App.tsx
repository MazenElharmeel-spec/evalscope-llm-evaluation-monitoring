import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Brain,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Database,
  Download,
  FlaskConical,
  Gauge,
  Layers3,
  LayoutDashboard,
  Menu,
  Moon,
  MoreHorizontal,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Section =
  | 'Overview'
  | 'Evaluations'
  | 'Datasets'
  | 'Monitoring'
  | 'Quality gates'
  | 'Settings';
const sections: { name: Section; icon: typeof LayoutDashboard }[] = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Evaluations', icon: FlaskConical },
  { name: 'Datasets', icon: Database },
  { name: 'Monitoring', icon: Activity },
  { name: 'Quality gates', icon: ShieldCheck },
  { name: 'Settings', icon: Settings },
];

const qualityData = [
  { day: 'May 14', sol: 0.91, claude: 0.8, gemini: 0.86, deepseek: 0.67 },
  { day: 'May 15', sol: 0.92, claude: 0.82, gemini: 0.87, deepseek: 0.71 },
  { day: 'May 16', sol: 0.88, claude: 0.73, gemini: 0.79, deepseek: 0.68 },
  { day: 'May 17', sol: 0.92, claude: 0.78, gemini: 0.85, deepseek: 0.66 },
  { day: 'May 18', sol: 0.93, claude: 0.77, gemini: 0.87, deepseek: 0.71 },
  { day: 'May 19', sol: 0.96, claude: 0.84, gemini: 0.9, deepseek: 0.77 },
  { day: 'May 20', sol: 0.92, claude: 0.8, gemini: 0.88, deepseek: 0.7 },
  { day: 'May 21', sol: 0.94, claude: 0.8, gemini: 0.89, deepseek: 0.72 },
];
const categories = [
  { name: 'Reasoning', count: 342 },
  { name: 'Knowledge', count: 287 },
  { name: 'Math', count: 156 },
  { name: 'Coding', count: 142 },
  { name: 'Instruction Following', count: 118 },
  { name: 'Summarization', count: 82 },
  { name: 'Creative Writing', count: 61 },
  { name: 'Safety', count: 58 },
];
const models = [
  {
    name: 'GPT-6.1 Sol',
    badge: '◎',
    quality: 0.88,
    pass: '85.2%',
    latency: '2.31s',
    cost: '$0.032',
    color: 'green',
  },
  {
    name: 'Claude Sonnet 5.5',
    badge: '▣',
    quality: 0.84,
    pass: '79.1%',
    latency: '2.45s',
    cost: '$0.028',
    color: 'blue',
  },
  {
    name: 'Gemini 3.8 Flash',
    badge: '◉',
    quality: 0.76,
    pass: '72.3%',
    latency: '1.62s',
    cost: '$0.002',
    color: 'amber',
  },
  {
    name: 'DeepSeek V4.1 Flash',
    badge: '▰',
    quality: 0.72,
    pass: '68.7%',
    latency: '1.74s',
    cost: '$0.006',
    color: 'amber',
  },
];
const radarData = [
  { metric: 'Correctness', sol: 91, claude: 83, gemini: 75 },
  { metric: 'Completeness', sol: 88, claude: 84, gemini: 73 },
  { metric: 'Coherence', sol: 93, claude: 86, gemini: 77 },
  { metric: 'Helpfulness', sol: 89, claude: 82, gemini: 75 },
  { metric: 'Safety', sol: 94, claude: 88, gemini: 80 },
  { metric: 'Faithfulness', sol: 87, claude: 81, gemini: 72 },
];
const alerts = [
  {
    type: 'danger',
    title: 'Quality drop detected for GPT-6.1 Sol',
    detail: 'Overall Quality decreased by 6.2%',
    date: 'Nov 06, 2026',
    time: '10:15 AM',
  },
  {
    type: 'warning',
    title: 'Increased latency for Claude Sonnet 5.5',
    detail: 'P95 latency is 18% higher than usual',
    date: 'Nov 06, 2026',
    time: '09:42 AM',
  },
  {
    type: 'warning',
    title: 'Drift detected in Knowledge category',
    detail: 'Data distribution has shifted significantly',
    date: 'Nov 05, 2026',
    time: '11:07 PM',
  },
  {
    type: 'info',
    title: 'New evaluation run completed',
    detail: '"Nightly Eval - Nov 05" completed successfully',
    date: 'Nov 05, 2026',
    time: '10:30 PM',
  },
];

function CountUp({ value, duration = 850 }: { value: string; duration?: number }) {
  const match = value.match(/^([^\d]*)([\d][\d,]*(?:\.\d+)?)(.*)$/);
  const parsedValue = match ? Number(match[2].replaceAll(',', '')) : null;
  const decimals = match?.[2].split('.')[1]?.length ?? 0;
  const prefix = match?.[1] ?? '';
  const suffix = match?.[3] ?? '';
  const format = (amount: number) =>
    `${prefix}${amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  const [shown, setShown] = useState(() => (parsedValue === null ? value : format(0)));

  useEffect(() => {
    if (parsedValue === null) {
      setShown(value);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return;
    }

    let frame = 0;
    let start: number | undefined;
    const animate = (now: number) => {
      start ??= now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setShown(progress === 1 ? value : format(parsedValue * eased));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [value, parsedValue, duration]);

  return <>{shown}</>;
}

function Sparkline({ color, index }: { color: string; index: number }) {
  const paths = [
    'M2 26 L18 20 L34 24 L50 13 L66 19 L82 8 L98 15 L114 6 L130 14 L146 4',
    'M2 23 L18 18 L34 24 L50 14 L66 22 L82 10 L98 19 L114 5 L130 11 L146 3',
    'M2 18 L18 14 L34 23 L50 12 L66 18 L82 7 L98 15 L114 4 L130 10 L146 1',
    'M2 12 L18 18 L34 9 L50 21 L66 11 L82 16 L98 6 L114 18 L130 3 L146 12',
    'M2 20 L18 16 L34 22 L50 8 L66 17 L82 9 L98 19 L114 6 L130 2 L146 1',
    'M2 20 L18 8 L34 14 L50 19 L66 6 L82 12 L98 21 L114 9 L130 1 L146 10',
  ];
  return (
    <svg className="sparkline" viewBox="0 0 148 32" aria-hidden="true">
      <path
        d={paths[index]}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={`${paths[index]} L146 32 L2 32 Z`} fill={color} opacity=".1" />
    </svg>
  );
}

function MetricCard({
  title,
  value,
  change,
  index,
}: {
  title: string;
  value: string;
  change: string;
  index: number;
}) {
  const colors = ['#59dc9e', '#66a8ff', '#a17bff', '#f0c448', '#59d2e0', '#dd7db2'];
  const positive = !change.startsWith('-');
  return (
    <article className="metric-card panel">
      <div className="metric-heading">
        {title}
        <CircleHelp size={14} />
      </div>
      <div className="metric-value-row">
        <strong className={index === 0 ? 'quality-value' : ''}>
          <CountUp value={value} />
        </strong>
        <Sparkline color={colors[index]} index={index} />
      </div>
      <div className="metric-change">
        <span className={positive ? 'up' : 'down'}>
          {positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
          {change}
        </span>
        <span>vs last 7 days</span>
      </div>
    </article>
  );
}

function App() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'glossy'>(() => {
    const saved = window.localStorage.getItem('evalscope-theme');
    return saved === 'light' || saved === 'glossy' ? saved : 'dark';
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [section, setSection] = useState<Section>('Overview');
  const [range, setRange] = useState('Last 7 days');
  const [metric, setMetric] = useState('Overall Quality');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showRun, setShowRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState('');
  const [categoryCount, setCategoryCount] = useState('Top 8');
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('evalscope-theme', theme);
  }, [theme]);

  const visibleCategories = useMemo(() => {
    const filtered = categories.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
    return categoryCount === 'Top 5' ? filtered.slice(0, 5) : filtered;
  }, [categoryCount, search]);
  const chartData = useMemo(() => {
    const offset =
      metric === 'Faithfulness'
        ? 0.025
        : metric === 'Answer relevancy'
          ? -0.018
          : metric === 'Context precision'
            ? -0.055
            : 0;
    const quarterLabels = [
      'Mar 01',
      'Mar 13',
      'Mar 25',
      'Apr 06',
      'Apr 18',
      'Apr 30',
      'May 12',
      'May 20',
    ];
    return qualityData.map((point, index) => ({
      ...point,
      day:
        range === 'Last 30 days'
          ? `May ${String(1 + index * 3).padStart(2, '0')}`
          : range === 'Last 90 days'
            ? quarterLabels[index]
            : point.day,
      sol: Math.min(0.99, Math.max(0.5, point.sol + offset)),
      claude: Math.min(0.99, Math.max(0.5, point.claude + offset)),
      gemini: Math.min(0.99, Math.max(0.5, point.gemini + offset)),
      deepseek: Math.min(0.99, Math.max(0.5, point.deepseek + offset)),
    }));
  }, [metric, range]);

  const triggerRun = () => {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setShowRun(false);
      setToast('Evaluation started · run #eval-1249 queued');
      window.setTimeout(() => setToast(''), 4000);
    }, 900);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Brain size={21} />
          </div>
          <span>
            eval<span className="brand-accent">scope</span>
          </span>
          <button className="icon-button sidebar-collapse" aria-label="Collapse sidebar">
            <Menu size={17} />
          </button>
        </div>
        <button className="project-picker">
          <span className="project-dot">A</span>
          <span className="project-info">
            <b>Acme AI</b>
            <small>Enterprise plan</small>
          </span>
          <ChevronDown size={16} />
        </button>
        <div className="side-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {sections.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setSection(name)}
              className={`nav-item ${section === name ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{name}</span>
              {name === 'Monitoring' && <span className="nav-count">3</span>}
            </button>
          ))}
        </nav>
        <div className="side-spacer" />
        <div className="plan-card">
          <div className="plan-icon">
            <Sparkles size={15} />
          </div>
          <b>Pro plan</b>
          <span>You've used 68% of your monthly evaluations.</span>
          <div className="progress-track">
            <i />
          </div>
          <button onClick={() => setToast('Plan details are up to date')}>
            Manage plan <ArrowRight size={13} />
          </button>
        </div>
        <button className="user-menu">
          <div className="avatar">JD</div>
          <span>
            <b>Jordan Davis</b>
            <small>jordan@acme.ai</small>
          </span>
          <MoreHorizontal size={17} />
        </button>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Acme AI</span>
            <span className="crumb-sep">/</span>
            <b>{section}</b>
          </div>
          <div className="top-actions">
            <button className="search-box">
              <Search size={15} />
              <span>Search anything...</span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="theme-picker">
              <button
                className="icon-button theme-button"
                aria-label="Choose appearance"
                aria-haspopup="menu"
                aria-expanded={showThemeMenu}
                title="Choose appearance"
                onClick={() => setShowThemeMenu(!showThemeMenu)}
              >
                {theme === 'dark' ? (
                  <Moon size={17} />
                ) : theme === 'light' ? (
                  <Sun size={17} />
                ) : (
                  <Sparkles size={17} />
                )}
              </button>
              {showThemeMenu && (
                <div className="theme-menu" role="menu" aria-label="Appearance">
                  <span className="theme-menu-title">Appearance</span>
                  {(['dark', 'light', 'glossy'] as const).map((option) => (
                    <button
                      key={option}
                      role="menuitemradio"
                      aria-checked={theme === option}
                      className={`theme-option ${theme === option ? 'selected' : ''}`}
                      onClick={() => {
                        setTheme(option);
                        setShowThemeMenu(false);
                      }}
                    >
                      {option === 'dark' ? (
                        <Moon size={15} />
                      ) : option === 'light' ? (
                        <Sun size={15} />
                      ) : (
                        <Sparkles size={15} />
                      )}
                      <span>{option[0].toUpperCase() + option.slice(1)}</span>
                      {theme === option && <Check className="theme-check" size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => setToast('You are all caught up')}
            >
              <Bell size={18} />
              <i />
            </button>
            <div className="top-avatar">JD</div>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="live-dot" /> LIVE OVERVIEW <span className="eyebrow-sep">·</span>{' '}
                Updated just now
              </div>
              <h1>{section === 'Overview' ? 'LLM Performance' : section}</h1>
              <p>
                {section === 'Overview'
                  ? 'Track quality, cost, and reliability across your models.'
                  : section === 'Evaluations'
                    ? 'Review evaluation runs, compare models, and launch new experiments.'
                    : section === 'Datasets'
                      ? 'Manage versioned datasets and review evaluation cases.'
                      : section === 'Monitoring'
                        ? 'Watch production quality, latency, and drift as they happen.'
                        : section === 'Quality gates'
                          ? 'Set guardrails and review model release decisions.'
                          : 'Configure your project, models, and evaluation defaults.'}
              </p>
            </div>
            <div className="heading-actions">
              <button className="button secondary range-button">
                <Clock3 size={15} />
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  aria-label="Date range"
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
                <ChevronDown size={14} />
              </button>
              <button className="button primary" onClick={() => setShowRun(true)}>
                <Play size={14} fill="currentColor" /> Run evaluation
              </button>
            </div>
          </div>
          {section === 'Overview' ? (
            <>
              <div className="metric-grid">
                <MetricCard title="Overall Quality (Avg)" value="0.82" change="4.3%" index={0} />
                <MetricCard title="Total Evaluations" value="1,248" change="12.6%" index={1} />
                <MetricCard title="Pass Rate" value="78.6%" change="3.7pp" index={2} />
                <MetricCard title="Avg Latency (P95)" value="2.34s" change="-8.1%" index={3} />
                <MetricCard title="Total Tokens" value="24.6M" change="18.9%" index={4} />
                <MetricCard title="Total Cost" value="$5,734" change="15.4%" index={5} />
              </div>
              <div className="chart-grid">
                <section className="panel chart-panel quality-panel">
                  <div className="panel-head">
                    <div>
                      <h2>
                        Quality over time <CircleHelp size={14} />
                      </h2>
                      <span className="panel-subtitle">
                        {metric} scores · {range.toLowerCase()}
                      </span>
                    </div>
                    <div className="chart-actions">
                      <button className="button chart-toggle">
                        <span
                          className={chartType === 'line' ? 'chosen' : ''}
                          onClick={() => setChartType('line')}
                        >
                          Line
                        </span>
                        <span
                          className={chartType === 'area' ? 'chosen' : ''}
                          onClick={() => setChartType('area')}
                        >
                          Area
                        </span>
                      </button>
                      <button className="icon-button" aria-label="More chart options">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="chart-filters">
                    <label>
                      Metric{' '}
                      <select value={metric} onChange={(e) => setMetric(e.target.value)}>
                        <option>Overall Quality</option>
                        <option>Faithfulness</option>
                        <option>Answer relevancy</option>
                        <option>Context precision</option>
                      </select>
                    </label>
                  </div>
                  <div className="legend">
                    <span>
                      <i className="lg green" />
                      GPT-6.1 Sol
                    </span>
                    <span>
                      <i className="lg purple" />
                      Claude Sonnet 5.5
                    </span>
                    <span>
                      <i className="lg cyan" />
                      Gemini 3.8 Flash
                    </span>
                    <span>
                      <i className="lg yellow" />
                      DeepSeek V4.1 Flash
                    </span>
                    <span>
                      <i className="lg target" />
                      Target (0.80)
                    </span>
                  </div>
                  <div className="quality-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'line' ? (
                        <LineChart
                          data={chartData}
                          margin={{ top: 8, right: 5, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid stroke="#29313e" vertical={false} />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8993a4', fontSize: 11 }}
                            dy={9}
                          />
                          <YAxis
                            domain={[0.5, 1]}
                            ticks={[0.5, 0.6, 0.7, 0.8, 0.9, 1]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8993a4', fontSize: 11 }}
                            tickFormatter={(v) => Number(v).toFixed(2)}
                          />
                          <Tooltip
                            contentStyle={{
                              background: '#1a202b',
                              border: '1px solid #303a49',
                              borderRadius: 8,
                              color: '#f4f6fb',
                              fontSize: 12,
                            }}
                          />
                          <Line
                            dataKey="sol"
                            name="GPT-6.1 Sol"
                            stroke="#59dc9e"
                            strokeWidth={2.4}
                            dot={{ r: 3, strokeWidth: 0, fill: '#59dc9e' }}
                          />
                          <Line
                            dataKey="claude"
                            name="Claude Sonnet 5.5"
                            stroke="#a17bff"
                            strokeWidth={2.1}
                            dot={{ r: 2.8, strokeWidth: 0, fill: '#a17bff' }}
                          />
                          <Line
                            dataKey="gemini"
                            name="Gemini 3.8 Flash"
                            stroke="#55a7f4"
                            strokeWidth={2.1}
                            dot={{ r: 2.8, strokeWidth: 0, fill: '#55a7f4' }}
                          />
                          <Line
                            dataKey="deepseek"
                            name="DeepSeek V4.1 Flash"
                            stroke="#f0c448"
                            strokeWidth={2.1}
                            dot={{ r: 2.8, strokeWidth: 0, fill: '#f0c448' }}
                          />
                          <Line
                            dataKey={() => 0.8}
                            name="Target (0.80)"
                            stroke="#8d95a3"
                            strokeDasharray="6 5"
                            strokeWidth={1.4}
                            dot={false}
                          />
                        </LineChart>
                      ) : (
                        <AreaChart
                          data={chartData}
                          margin={{ top: 8, right: 5, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid stroke="#29313e" vertical={false} />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8993a4', fontSize: 11 }}
                            dy={9}
                          />
                          <YAxis
                            domain={[0.5, 1]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8993a4', fontSize: 11 }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: '#1a202b',
                              border: '1px solid #303a4a',
                              borderRadius: 8,
                              color: '#f4f6fb',
                              fontSize: 12,
                            }}
                          />
                          <Area
                            dataKey="sol"
                            name="GPT-6.1 Sol"
                            stroke="#59dc9e"
                            fill="#59dc9e"
                            fillOpacity={0.14}
                          />
                          <Area
                            dataKey="claude"
                            name="Claude Sonnet 5.5"
                            stroke="#a17bff"
                            fill="#a17bff"
                            fillOpacity={0.1}
                          />
                          <Area
                            dataKey="gemini"
                            name="Gemini 3.8 Flash"
                            stroke="#55a7f4"
                            fill="#55a7f4"
                            fillOpacity={0.1}
                          />
                          <Area
                            dataKey="deepseek"
                            name="DeepSeek V4.1 Flash"
                            stroke="#f0c448"
                            fill="#f0c448"
                            fillOpacity={0.1}
                          />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </section>
                <section className="panel chart-panel category-panel">
                  <div className="panel-head">
                    <div>
                      <h2>
                        Evaluations by category <CircleHelp size={14} />
                      </h2>
                      <span className="panel-subtitle">
                        Case distribution in the selected period
                      </span>
                    </div>
                    <div className="chart-actions">
                      <select
                        className="top-select"
                        value={categoryCount}
                        onChange={(e) => setCategoryCount(e.target.value)}
                        aria-label="Category count"
                      >
                        <option>Top 8</option>
                        <option>Top 5</option>
                      </select>
                      <button className="icon-button" aria-label="More chart options">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="category-search">
                    <Search size={14} />
                    <input
                      placeholder="Filter categories"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="category-list">
                    {visibleCategories.map((cat) => (
                      <div className="category-row" key={cat.name}>
                        <span className="category-name">{cat.name}</span>
                        <div className="category-bar">
                          <i style={{ width: `${(cat.count / 342) * 100}%` }} />
                        </div>
                        <b>{cat.count}</b>
                      </div>
                    ))}
                  </div>
                  <div className="category-axis">
                    <span>0</span>
                    <span>100</span>
                    <span>200</span>
                    <span>300</span>
                    <span>400</span>
                  </div>
                  <div className="axis-caption">Evaluations</div>
                </section>
              </div>
              <div className="bottom-grid">
                <section className="panel model-panel">
                  <div className="panel-head">
                    <div>
                      <h2>
                        Model comparison <span className="muted">/ Overall quality</span>
                        <CircleHelp size={14} />
                      </h2>
                      <span className="panel-subtitle">
                        Average performance across 1,248 evaluations
                      </span>
                    </div>
                    <button className="icon-button" aria-label="More comparison options">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Model</th>
                          <th>Overall quality</th>
                          <th>Pass rate</th>
                          <th>P95 latency</th>
                          <th>Cost / 1K tokens</th>
                        </tr>
                      </thead>
                      <tbody>
                        {models.map((model) => (
                          <tr key={model.name}>
                            <td>
                              <span className={`model-symbol ${model.color}`}>{model.badge}</span>
                              {model.name}
                            </td>
                            <td className={model.quality > 0.8 ? 'good-score' : 'mid-score'}>
                              {model.quality.toFixed(2)}
                            </td>
                            <td className={model.quality > 0.8 ? 'good-score' : 'mid-score'}>
                              {model.pass}
                            </td>
                            <td>{model.latency}</td>
                            <td>{model.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button className="text-link" onClick={() => setSection('Evaluations')}>
                    View all models <ArrowRight size={15} />
                  </button>
                </section>
                <section className="panel radar-panel">
                  <div className="panel-head">
                    <div>
                      <h2>
                        Quality by dimension <CircleHelp size={14} />
                      </h2>
                      <span className="panel-subtitle">Score breakdown by model</span>
                    </div>
                    <button className="icon-button" aria-label="More dimension options">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  <div className="radar-legend">
                    <span>
                      <i className="lg green" />
                      GPT-6.1 Sol
                    </span>
                    <span>
                      <i className="lg blue" />
                      Claude Sonnet 5.5
                    </span>
                    <span>
                      <i className="lg purple" />
                      Gemini 3.8 Flash
                    </span>
                  </div>
                  <div className="radar-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius="72%">
                        <PolarGrid stroke="#303846" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#a8b0bd', fontSize: 10 }} />
                        <Radar
                          name="GPT-6.1 Sol"
                          dataKey="sol"
                          stroke="#59dc9e"
                          fill="#59dc9e"
                          fillOpacity={0.11}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Claude Sonnet 5.5"
                          dataKey="claude"
                          stroke="#55a7f4"
                          fill="#55a7f4"
                          fillOpacity={0.08}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Gemini 3.8 Flash"
                          dataKey="gemini"
                          stroke="#a17bff"
                          fill="#a17bff"
                          fillOpacity={0.08}
                          strokeWidth={2}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#1a202b',
                            border: '1px solid #303a4a',
                            borderRadius: 8,
                            color: '#f4f6fb',
                            fontSize: 12,
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
                <section className="panel alerts-panel">
                  <div className="panel-head">
                    <div>
                      <h2>
                        Recent alerts <span className="alert-count">3</span>
                      </h2>
                      <span className="panel-subtitle">Signals that may need your attention</span>
                    </div>
                    <button className="text-link compact" onClick={() => setSection('Monitoring')}>
                      View all <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="alert-list">
                    {alerts.map((alert) => (
                      <div className="alert-row" key={alert.title}>
                        <div className={`alert-icon ${alert.type}`}>
                          {alert.type === 'danger' ? (
                            <AlertTriangle size={16} />
                          ) : alert.type === 'info' ? (
                            <Activity size={16} />
                          ) : (
                            <AlertTriangle size={16} />
                          )}
                        </div>
                        <div className="alert-copy">
                          <b>{alert.title}</b>
                          <span>{alert.detail}</span>
                        </div>
                        <time>
                          {alert.date}
                          <small>{alert.time}</small>
                        </time>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <div className="footer-note">
                <span>
                  <Check size={13} /> All systems operational
                </span>
                <span>Data refreshes every 5 minutes</span>
                <a href="#docs">
                  Documentation <ArrowRight size={12} />
                </a>
              </div>
            </>
          ) : (
            <SectionPage section={section} setSection={setSection} onRun={() => setShowRun(true)} />
          )}
        </div>
      </main>
      {showRun && (
        <div className="modal-backdrop" onClick={() => !running && setShowRun(false)}>
          <section className="run-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-icon">
                <FlaskConical size={19} />
              </div>
              <button className="icon-button" aria-label="Close" onClick={() => setShowRun(false)}>
                <X size={18} />
              </button>
            </div>
            <h2>Run an evaluation</h2>
            <p>Start a new model evaluation against a versioned dataset.</p>
            <label>
              Dataset version
              <select defaultValue="Golden set · v1.4">
                <option>Golden set · v1.4</option>
                <option>Support QA · v2.1</option>
                <option>RAG regression suite · v3.0</option>
              </select>
            </label>
            <label>
              Models to evaluate
              <select defaultValue="All active models">
                <option>All active models</option>
                <option>GPT-6.1 Sol</option>
                <option>Claude Sonnet 5.5</option>
                <option>Gemini 3.8 Flash</option>
                <option>DeepSeek V4.1 Flash</option>
              </select>
            </label>
            <div className="run-summary">
              <div>
                <Layers3 size={15} /> 240 cases
              </div>
              <div>
                <Gauge size={15} /> 5 metrics
              </div>
              <div>
                <Command size={15} /> Demo mode
              </div>
            </div>
            <button className="button primary modal-run" disabled={running} onClick={triggerRun}>
              {running ? (
                <>
                  <span className="spinner" /> Queuing evaluation...
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" /> Start evaluation
                </>
              )}
            </button>
            <div className="modal-foot">
              Estimated runtime <b>~2 min</b>
              <span>·</span> Estimated cost <b>$0.00</b>
            </div>
          </section>
        </div>
      )}
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
          <button aria-label="Dismiss notification" onClick={() => setToast('')}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function SectionPage({
  section,
  setSection,
  onRun,
}: {
  section: Section;
  setSection: (section: Section) => void;
  onRun: () => void;
}) {
  const rows =
    section === 'Evaluations'
      ? [
          [
            'Nightly Eval — May 20',
            'Golden set · v1.4',
            'GPT-6.1 Sol, Claude Sonnet 5.5',
            'Completed',
            '0.86',
          ],
          ['RAG regression suite', 'RAG suite · v3.0', 'GPT-6.1 Sol', 'Completed', '0.82'],
          ['Prompt variants — v12', 'Support QA · v2.1', 'Claude Sonnet 5.5', 'Completed', '0.79'],
          ['Baseline comparison', 'Golden set · v1.4', 'Gemini 3.8 Flash', 'Failed gate', '0.68'],
        ]
      : section === 'Datasets'
        ? [
            ['Golden set', 'v1.4 · 240 cases', 'Updated May 18', 'Active', '4 categories'],
            ['Support QA', 'v2.1 · 186 cases', 'Updated May 16', 'Active', '8 categories'],
            ['RAG regression suite', 'v3.0 · 96 cases', 'Updated May 12', 'Active', '6 categories'],
            ['Safety red-team', 'v1.2 · 48 cases', 'Updated May 08', 'Review', '3 categories'],
          ]
        : section === 'Quality gates'
          ? [
              [
                'Production release gate',
                'Overall quality ≥ 0.80',
                'Latency P95 ≤ 3.0s',
                'Passing',
                '12/12 runs',
              ],
              [
                'Safety regression gate',
                'Unsafe answer rate = 0',
                'Refusal accuracy ≥ 0.95',
                'Passing',
                '12/12 runs',
              ],
              ['Cost budget', 'Cost / request ≤ $0.05', 'Window: 7 days', 'Passing', '12/12 runs'],
              [
                'RAG recall guardrail',
                'Recall@5 ≥ 0.82',
                'Regression ≤ 2%',
                'Needs review',
                '10/12 runs',
              ],
            ]
          : section === 'Monitoring'
            ? [
                [
                  'Production quality',
                  '0.84 avg · 24h',
                  '+2.1% vs prior',
                  'Healthy',
                  '18.4k traces',
                ],
                ['P95 latency', '2.42s · 24h', '+18% vs baseline', 'Warning', '18.4k traces'],
                ['Knowledge drift', '0.19 PSI · 7d', 'Threshold: 0.15', 'Triggered', '3 alerts'],
                ['Error rate', '0.42% · 24h', '-0.08% vs prior', 'Healthy', '18.4k traces'],
              ]
            : [
                [
                  'Default evaluator',
                  'Native metrics + RAGAS',
                  '5 metrics enabled',
                  'Configured',
                  'v1.8',
                ],
                ['Judge model', 'GPT-6.1 Sol', 'Temperature 0', 'Configured', 'Cached'],
                [
                  'Pricing table',
                  'OpenAI · Anthropic',
                  'Last reviewed May 01',
                  'Current',
                  '2024.05',
                ],
                ['API keys', '2 active keys', 'Last rotated 12 days ago', 'Secure', '•••• 9f2a'],
              ];
  const headers =
    section === 'Evaluations'
      ? ['Run', 'Dataset', 'Models', 'Status', 'Quality']
      : section === 'Datasets'
        ? ['Dataset', 'Version', 'Last updated', 'Status', 'Coverage']
        : section === 'Quality gates'
          ? ['Gate rule', 'Quality threshold', 'Performance budget', 'Status', 'Recent runs']
          : section === 'Monitoring'
            ? ['Signal', 'Current value', 'Trend / threshold', 'Status', 'Volume']
            : ['Setting', 'Configuration', 'Details', 'Status', 'Value'];
  return (
    <div className="section-content">
      <div className="section-cards">
        <article className="panel mini-stat">
          <span>
            {section === 'Evaluations'
              ? 'Total runs'
              : section === 'Datasets'
                ? 'Active datasets'
                : section === 'Monitoring'
                  ? 'Traces today'
                  : section === 'Quality gates'
                    ? 'Passing gates'
                    : 'Configured'}
          </span>
          <b>
            {section === 'Evaluations'
              ? '1,248'
              : section === 'Datasets'
                ? '12'
                : section === 'Monitoring'
                  ? '18,420'
                  : section === 'Quality gates'
                    ? '8 / 9'
                    : '12'}
          </b>
          <small>
            <ArrowUpRight size={13} /> 12.6% this week
          </small>
        </article>
        <article className="panel mini-stat">
          <span>
            {section === 'Evaluations'
              ? 'Average quality'
              : section === 'Datasets'
                ? 'Total cases'
                : section === 'Monitoring'
                  ? 'Quality score'
                  : section === 'Quality gates'
                    ? 'Blocked releases'
                    : 'Project status'}
          </span>
          <b>
            {section === 'Evaluations'
              ? '0.82'
              : section === 'Datasets'
                ? '1,842'
                : section === 'Monitoring'
                  ? '0.84'
                  : section === 'Quality gates'
                    ? '2'
                    : 'Healthy'}
          </b>
          <small>
            <Check size={13} /> Updated just now
          </small>
        </article>
        <article className="panel mini-stat">
          <span>
            {section === 'Evaluations'
              ? 'Avg run time'
              : section === 'Datasets'
                ? 'Cases awaiting review'
                : section === 'Monitoring'
                  ? 'Active alerts'
                  : section === 'Quality gates'
                    ? 'Gate reliability'
                    : 'Last activity'}
          </span>
          <b>
            {section === 'Evaluations'
              ? '1m 42s'
              : section === 'Datasets'
                ? '24'
                : section === 'Monitoring'
                  ? '3'
                  : section === 'Quality gates'
                    ? '98.4%'
                    : '2m ago'}
          </b>
          <small>
            <Activity size={13} /> Within expected range
          </small>
        </article>
      </div>
      <section className="panel data-panel">
        <div className="panel-head">
          <div>
            <h2>
              {section === 'Evaluations'
                ? 'Recent evaluation runs'
                : section === 'Datasets'
                  ? 'Your datasets'
                  : section === 'Monitoring'
                    ? 'Live signals'
                    : section === 'Quality gates'
                      ? 'Active gate rules'
                      : 'Project configuration'}
            </h2>
            <span className="panel-subtitle">
              {section === 'Evaluations'
                ? 'Track status and review run results'
                : section === 'Datasets'
                  ? 'Browse datasets and manage version history'
                  : section === 'Monitoring'
                    ? 'Production health across your monitored applications'
                    : section === 'Quality gates'
                      ? 'Quality, performance, and cost guardrails'
                      : 'Manage models, judges, pricing, and project access'}
            </span>
          </div>
          <div className="data-actions">
            <button className="button secondary">
              <Download size={14} /> Export
            </button>
            <button
              className="button primary"
              onClick={() => (section === 'Evaluations' ? onRun() : setSection(section))}
            >
              <Play size={14} />{' '}
              {section === 'Evaluations'
                ? 'New evaluation'
                : section === 'Datasets'
                  ? 'Create dataset'
                  : section === 'Monitoring'
                    ? 'Add monitor'
                    : section === 'Quality gates'
                      ? 'Add gate rule'
                      : 'Edit settings'}
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td
                      key={cell}
                      className={
                        i === 3
                          ? `status-cell ${cell.toLowerCase().replaceAll(' ', '-')}`
                          : i === 4 && cell.startsWith('0.')
                            ? 'good-score'
                            : undefined
                      }
                    >
                      {cell}
                    </td>
                  ))}
                  <td>
                    <button
                      className="icon-button row-more"
                      aria-label={`More options for ${row[0]}`}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>
            Showing 4 of {section === 'Evaluations' ? '1,248' : section === 'Datasets' ? '12' : '9'}{' '}
            results
          </span>
          <div>
            <button disabled>Previous</button>
            <button>
              Next <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>
      <section className="panel getting-started">
        <div className="getting-icon">
          <Sparkles size={18} />
        </div>
        <div>
          <b>Make your next release more reliable</b>
          <p>
            Run a golden-set evaluation before shipping a prompt or model change. Your baseline and
            gate rules are already configured.
          </p>
        </div>
        <button className="button secondary" onClick={() => setSection('Evaluations')}>
          Explore evaluations <ArrowRight size={14} />
        </button>
      </section>
    </div>
  );
}

export default App;
