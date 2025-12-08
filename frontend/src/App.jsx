import { useState, useEffect } from 'react';
import { Menu, Home, Building2, Users, Target, FileText, DollarSign, Search, Bell, Settings, ChevronDown, Plus, X, Check, AlertCircle, Loader2 } from 'lucide-react';

const API = 'http://localhost:3001/api';

const navItems = [
  { id: 'Home', icon: Home, label: 'Home' },
  { id: 'Account', icon: Building2, label: 'Accounts' },
  { id: 'Contact', icon: Users, label: 'Contacts' },
  { id: 'Lead', icon: Target, label: 'Leads' },
  { id: 'Case', icon: FileText, label: 'Cases' },
  { id: 'Opportunity', icon: DollarSign, label: 'Opportunities' },
  { id: 'Contract', icon: FileText, label: 'Contracts' },
];

const formConfigs = {
  Account: [
    { name: 'Name', label: 'Account Name', required: true },
    { name: 'Industry', label: 'Industry' },
    { name: 'Phone', label: 'Phone', type: 'tel' },
  ],
  Contact: [
    { name: 'FirstName', label: 'First Name' },
    { name: 'LastName', label: 'Last Name', required: true },
    { name: 'Email', label: 'Email', type: 'email' },
    { name: 'Phone', label: 'Phone', type: 'tel' },
  ],
  Lead: [
    { name: 'FirstName', label: 'First Name' },
    { name: 'LastName', label: 'Last Name', required: true },
    { name: 'Company', label: 'Company', required: true },
    { name: 'Email', label: 'Email', type: 'email' },
  ],
  Case: [
    { name: 'Subject', label: 'Subject', required: true },
    { name: 'Status', label: 'Status', type: 'select', options: ['New', 'Working', 'Escalated', 'Closed'] },
    { name: 'Priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
  ],
  Opportunity: [
    { name: 'Name', label: 'Opportunity Name', required: true },
    { name: 'StageName', label: 'Stage', required: true, type: 'select', options: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
    { name: 'Amount', label: 'Amount', type: 'number' },
    { name: 'CloseDate', label: 'Close Date', type: 'date', required: true },
  ],
  Contract: [
    { name: 'AccountId', label: 'Account ID', required: true },
    { name: 'Status', label: 'Status', type: 'select', options: ['Draft', 'In Approval Process', 'Activated', 'Expired'] },
    { name: 'StartDate', label: 'Contract Start Date', type: 'date', required: true },
    { name: 'ContractTerm', label: 'Contract Term (months)', type: 'number', required: true },
    { name: 'OwnerExpirationNotice', label: 'Owner Expiration Notice (days)', type: 'number' },
  ],
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingRecords, setFetchingRecords] = useState(false);
  const [stats] = useState({ accounts: 7, contacts: 3, leads: 4, cases: 10 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (activeTab !== 'Home') fetchRecords();
  }, [activeTab]);

  const fetchRecords = async () => {
    setFetchingRecords(true);
    try {
      const res = await fetch(`${API}/${activeTab}`);
      const data = await res.json();
      if (data.success) setRecords(data.records);
    } catch (err) {
      setToast({ message: 'Failed to fetch records', type: 'error' });
    } finally {
      setFetchingRecords(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/${activeTab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `${activeTab} created successfully!`, type: 'success' });
        setFormData({});
        setShowForm(false);
        fetchRecords();
      } else {
        setToast({ message: data.error || 'Failed to create record', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err.message || 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-slide { animation: slideIn 0.3s ease; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        button:hover { opacity: 0.9; }
        input:focus, select:focus { outline: 2px solid #8b5cf6; outline-offset: 2px; }
      `}</style>
      
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} setFormData={setFormData} setShowForm={setShowForm} />
      
      <main style={{ paddingTop: '80px', marginLeft: sidebarOpen ? '256px' : '80px', transition: 'margin-left 0.3s' }}>
        <div style={{ padding: '32px' }}>
          {activeTab === 'Home' ? (
            <HomeView stats={stats} />
          ) : (
            <ObjectView objectName={activeTab} records={records} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} loading={loading} fetchingRecords={fetchingRecords} showForm={showForm} setShowForm={setShowForm} />
          )}
        </div>
      </main>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = type === 'success' ? Check : AlertCircle;
  const bg = type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

  return (
    <div className="animate-slide" style={{ position: 'fixed', top: '96px', right: '24px', zIndex: 50, minWidth: '320px', padding: '16px 24px', borderRadius: '16px', background: bg, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} />
      </div>
      <p style={{ flex: 1, margin: 0, fontWeight: 500 }}>{message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
        <X size={20} />
      </button>
    </div>
  );
}

function Header({ sidebarOpen, setSidebarOpen }) {
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '80px', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(51, 65, 85, 0.5)', zIndex: 40 }}>
      <div style={{ height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '8px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '8px' }}>
            <Menu size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>L</span>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>LagosMart Retail</h1>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Powered By MicroAgent CRM</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
            <input type="text" placeholder="Search..." style={{ paddingLeft: '40px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '999px', fontSize: '14px', color: '#fff', width: '250px' }} />
          </div>
          
          <button style={{ position: 'relative', padding: '8px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '8px' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid rgba(51, 65, 85, 0.5)' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>B</span>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', margin: 0 }}>Babatope Olajide</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Administrator</p>
            </div>
            <ChevronDown size={16} color="#94a3b8" />
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ sidebarOpen, activeTab, setActiveTab, setFormData, setShowForm }) {
  return (
    <aside style={{ position: 'fixed', left: 0, top: '80px', bottom: 0, width: sidebarOpen ? '256px' : '80px', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(51, 65, 85, 0.5)', transition: 'width 0.3s', zIndex: 30 }}>
      <nav style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const gradients = {
            Home: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            Account: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            Contact: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            Lead: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            Case: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
            Opportunity: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
            Contract: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          };
          
          return (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setFormData({}); setShowForm(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', fontWeight: 500, background: isActive ? gradients[item.id] : 'transparent', color: isActive ? '#fff' : '#94a3b8', boxShadow: isActive ? '0 4px 12px rgba(139, 92, 246, 0.4)' : 'none' }}>
              <Icon size={20} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      {sidebarOpen && (
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', borderRadius: '12px', cursor: 'pointer', background: 'transparent', color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      )}
    </aside>
  );
}

function HomeView({ stats }) {
  const statCards = [
    { label: 'Total Accounts', value: stats.accounts, icon: Building2, color: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' },
    { label: 'Active Contacts', value: stats.contacts, icon: Users, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { label: 'New Leads', value: stats.leads, icon: Target, color: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' },
    { label: 'Open Cases', value: stats.cases, icon: FileText, color: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Hey, Babatope Welcome to LagosMart Retail</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Here's what's happening with your business today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500, margin: 0 }}>{stat.label}</p>
                <div style={{ width: '48px', height: '48px', background: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  <Icon size={24} color="#fff" />
                </div>
              </div>
              <h3 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', margin: '0 0 8px 0' }}>{stat.value}</h3>
              <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 500, margin: 0 }}>↑ +100% from last month</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} color="#fff" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Case Insights</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Critical Cases</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>0</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} color="#fff" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Lead Performance</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Qualified Leads</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectView({ objectName, records, formData, setFormData, handleSubmit, loading, fetchingRecords, showForm, setShowForm }) {
  const fields = formConfigs[objectName] || [];
  const navItem = navItems.find(i => i.id === objectName);
  const Icon = navItem?.icon || Building2;
  const gradients = {
    Account: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    Contact: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    Lead: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    Case: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    Opportunity: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
    Contract: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: gradients[objectName], borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              <Icon size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>{objectName}s</h1>
          </div>
          <p style={{ color: '#94a3b8', margin: 0 }}>Manage your {objectName.toLowerCase()} records</p>
        </div>
        
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={20} />
          New {objectName}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 2fr' : '1fr', gap: '24px' }}>
        {showForm && (
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px', position: 'sticky', top: '96px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Create {objectName}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {fields.map((field) => (
                <div key={field.name}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                    {field.label}{field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select value={formData[field.name] || ''} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} style={{ width: '100%', padding: '10px 16px', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}>
                      <option value="">-- Select --</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input type={field.type || 'text'} value={formData[field.name] || ''} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} style={{ width: '100%', padding: '10px 16px', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', color: '#fff', fontSize: '14px' }} />
                  )}
                </div>
              ))}
              
              <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
                {loading ? <><Loader2 className="animate-pulse" size={20} /> Saving...</> : <><Check size={20} /> Save {objectName}</>}
              </button>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Recent {objectName}s</h2>
          
          {fetchingRecords ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', padding: '16px', height: '120px' }}></div>
              ))}
            </div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Icon size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', margin: '0 0 4px 0' }}>No records found</p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Create your first {objectName.toLowerCase()} to get started</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {records.map((rec) => (
                <div key={rec.Id} style={{ backgroundColor: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: gradients[objectName], borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color="#fff" />
                    </div>
                  </div>
                  {fields.slice(0, 3).map((f) => (
                    <div key={f.name} style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px 0' }}>{f.label}</p>
                      <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rec[f.name] || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}