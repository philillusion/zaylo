import { useState, useEffect } from 'react';
import Chatbot from './Chatbot';  // Add this line
import { Menu, Home, MessageCircle, Building2, Users, Target, FileText, DollarSign, Search, Bell, Settings, ChevronDown, Plus, X, Check, AlertCircle, Loader2, Upload, Eye, Edit, Trash2, LogOut, Download, ChevronRight, ArrowLeft, ExternalLink, Package, Warehouse, ShoppingCart, Truck, Receipt, CreditCard, ShoppingBag, Briefcase, Calendar, Activity } from 'lucide-react';
// ========================================
// EMBEDDED CONFIGURATION (No separate file needed!)
// ========================================

// Navigation items
const navItems = [
  { id: 'Home', icon: Home, label: 'Home' },
  { id: 'Chatbot', icon: MessageCircle, label: 'Chat', category: 'AI' }, // Add this line
  { id: 'Account', icon: Building2, label: 'Accounts' },
  { id: 'Contact', icon: Users, label: 'Contacts' },
  { id: 'Lead', icon: Target, label: 'Leads' },
  { id: 'Opportunity', icon: DollarSign, label: 'Opportunities' },
  { id: 'Quote', icon: FileText, label: 'Quotes' },
  { id: 'Campaign', icon: Activity, label: 'Campaigns' },
  { id: 'Case', icon: FileText, label: 'Cases' },
  { id: 'Contract', icon: Briefcase, label: 'Contracts' },
  { id: 'Asset', icon: Package, label: 'Assets' },
  { id: 'WorkOrder', icon: Activity, label: 'Work Orders' },
  { id: 'Product2', icon: Package, label: 'Products' },
  { id: 'Order', icon: ShoppingCart, label: 'Orders' },
  { id: 'Invoice__c', icon: Receipt, label: 'Invoices' },
  { id: 'Payment__c', icon: CreditCard, label: 'Payments' },
  { id: 'Inventory__c', icon: Warehouse, label: 'Inventory' },
  { id: 'Shipment__c', icon: Truck, label: 'Shipments' },
];

// Relationships
const relationships = {
  Account: [
    { object: 'Contact', field: 'AccountId', label: 'Contacts' },
    { object: 'Opportunity', field: 'AccountId', label: 'Opportunities' },
    { object: 'Case', field: 'AccountId', label: 'Cases' },
    { object: 'Contract', field: 'AccountId', label: 'Contracts' },
  ],
  Contact: [
    { object: 'Account', field: 'AccountId', label: 'Account', single: true },
    { object: 'Case', field: 'ContactId', label: 'Cases' },
    { object: 'Opportunity', field: 'ContactId', label: 'Opportunities' },
  ],
};

// Form configurations
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
    { name: 'StartDate', label: 'Start Date', type: 'date', required: true },
    { name: 'ContractTerm', label: 'Contract Term (months)', type: 'number', required: true },
  ],
  Product2: [
    { name: 'Name', label: 'Product Name', required: true },
    { name: 'ProductCode', label: 'Product Code' },
    { name: 'IsActive', label: 'Is Active', type: 'checkbox' },
  ],
  Order: [
    { name: 'AccountId', label: 'Account ID', required: true },
    { name: 'EffectiveDate', label: 'Order Date', type: 'date', required: true },
    { name: 'Status', label: 'Status', type: 'select', options: ['Draft', 'Activated'] },
  ],
  Invoice__c: [
    { name: 'Invoice_Number__c', label: 'Invoice Number', required: true },
    { name: 'Total_Amount__c', label: 'Total Amount', type: 'number' },
    { name: 'Status__c', label: 'Status', type: 'select', options: ['Draft', 'Sent', 'Paid', 'Overdue'] },
  ],
  Payment__c: [
    { name: 'Amount__c', label: 'Amount', type: 'number', required: true },
    { name: 'Payment_Date__c', label: 'Payment Date', type: 'date' },
    { name: 'Payment_Method__c', label: 'Payment Method', type: 'select', options: ['Cash', 'Credit Card', 'Bank Transfer'] },
  ],
  Inventory__c: [
    { name: 'Product__c', label: 'Product ID', required: true },
    { name: 'Quantity_Available__c', label: 'Quantity Available', type: 'number' },
    { name: 'Warehouse_Location__c', label: 'Warehouse Location' },
  ],
  Shipment__c: [
    { name: 'Order__c', label: 'Order ID', required: true },
    { name: 'Tracking_Number__c', label: 'Tracking Number' },
    { name: 'Status__c', label: 'Status', type: 'select', options: ['Pending', 'In Transit', 'Delivered'] },
  ],
};



const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingRecords, setFetchingRecords] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Detail view states
  const [detailView, setDetailView] = useState(null);
  const [relatedRecords, setRelatedRecords] = useState({});
  const [loadingRelated, setLoadingRelated] = useState({});

  // Check authentication on mount
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);

      // Test backend connection
      fetch(`${API}/health`)
        .then(res => res.json())
        .then(data => {
          console.log('✅ Backend health check:', data);
          if (data.status === 'ok') {
            setToast({ message: 'Connected to backend successfully', type: 'success' });
          }
        })
        .catch(err => {
          console.error('❌ Backend health check failed:', err);
          setToast({
            message: 'Cannot connect to backend. Make sure server is running on port 3001',
            type: 'error'
          });
        });
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'Home' && isAuthenticated && !detailView) {
      fetchRecords();
    }
  }, [activeTab, isAuthenticated, detailView]);

  const fetchRecords = async () => {
    setFetchingRecords(true);
    try {
      console.log(`Fetching ${activeTab} records from ${API}/${activeTab}`);
      const res = await fetch(`${API}/${activeTab}`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(`Response for ${activeTab}:`, data);

      if (data.success) {
        setRecords(data.records);
        console.log(`✅ Loaded ${data.records.length} ${activeTab} records`);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error(`❌ Failed to fetch ${activeTab}:`, err);
      setToast({
        message: `Failed to fetch records: ${err.message}. Is backend running on port 3001?`,
        type: 'error'
      });
      setRecords([]);
    } finally {
      setFetchingRecords(false);
    }
  };

  const fetchRelatedRecords = async (objectName, fieldName, fieldValue) => {
    setLoadingRelated(prev => ({ ...prev, [objectName]: true }));
    try {
      console.log(`Fetching ${objectName} where ${fieldName} = ${fieldValue}`);
      const res = await fetch(`${API}/${objectName}?filterField=${fieldName}&filterValue=${fieldValue}`);
      const data = await res.json();
      if (data.success) {
        console.log(`Found ${data.records.length} related ${objectName} records`);
        setRelatedRecords(prev => ({ ...prev, [objectName]: data.records }));
      }
    } catch (err) {
      console.error(`Failed to fetch ${objectName} records`, err);
    } finally {
      setLoadingRelated(prev => ({ ...prev, [objectName]: false }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const isUpdate = formData.Id ? true : false;
      const method = isUpdate ? 'PATCH' : 'POST';
      const url = isUpdate ? `${API}/${activeTab}/${formData.Id}` : `${API}/${activeTab}`;

      // Filter out read-only fields that Salesforce won't accept
      const readOnlyFields = ['Id', 'CreatedDate', 'CreatedById', 'LastModifiedDate', 'LastModifiedById', 'SystemModstamp', 'IsDeleted'];
      const cleanData = Object.keys(formData)
        .filter(key => !readOnlyFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = formData[key];
          return obj;
        }, {});

      console.log('📤 Submitting data:', cleanData);

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `${activeTab} ${isUpdate ? 'updated' : 'created'} successfully!`, type: 'success' });
        setFormData({});
        setShowForm(false);
        fetchRecords();
      } else {
        setToast({ message: data.error || `Failed to ${isUpdate ? 'update' : 'create'} record`, type: 'error' });
      }
    } catch (err) {
      setToast({ message: err.message || 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setFormData(record);
    setShowForm(true);
    setDetailView(null); // Close detail view
    setToast({ message: `Editing ${activeTab}`, type: 'success' });
  };

  const handleDelete = async (recordId, recordName) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab}?\n\n${recordName || recordId}\n\nThis action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/${activeTab}/${recordId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setToast({ message: `${activeTab} deleted successfully!`, type: 'success' });
        fetchRecords();
      } else {
        setToast({ message: data.error || 'Failed to delete record', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err.message || 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    console.log(`📋 Viewing detail for ${activeTab}:`, record);
    setDetailView(record);
    setRelatedRecords({});

    const rels = relationships[activeTab] || [];
    console.log(`Found ${rels.length} relationships for ${activeTab}`);

    rels.forEach(rel => {
      if (!rel.single) {
        console.log(`Fetching related ${rel.object} where ${rel.field} = ${record.Id}`);
        fetchRelatedRecords(rel.object, rel.field, record.Id);
      } else {
        console.log(`Single relationship: ${rel.object} (${rel.field}: ${record[rel.field]})`);
      }
    });
  };

  const handleBackToList = () => {
    setDetailView(null);
    setRelatedRecords({});
    fetchRecords();
  };

  const handleNavigateToRelated = (objectName, recordId = null) => {
    console.log(`Navigating to ${objectName}${recordId ? ` with ID ${recordId}` : ''}`);
    setActiveTab(objectName);
    setDetailView(null);
    setRelatedRecords({});
    setShowForm(false);

    if (recordId) {
      setTimeout(async () => {
        try {
          const res = await fetch(`${API}/${objectName}/${recordId}`);
          const data = await res.json();
          if (data.success && data.record) {
            console.log(`Found record:`, data.record);
            handleViewDetail(data.record);
          } else {
            const allRes = await fetch(`${API}/${objectName}`);
            const allData = await allRes.json();
            if (allData.success) {
              const record = allData.records.find(r => r.Id === recordId);
              if (record) {
                console.log(`Found record in list:`, record);
                handleViewDetail(record);
              } else {
                setToast({ message: `Record not found`, type: 'error' });
              }
            }
          }
        } catch (err) {
          console.error('Error navigating to record:', err);
          setToast({ message: 'Error loading record', type: 'error' });
        }
      }, 100);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    setActiveTab('Home');
    setDetailView(null);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} setToast={setToast} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide { animation: slideIn 0.3s ease; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-fade { animation: fadeIn 0.3s ease; }
        button:hover { opacity: 0.9; }
        input:focus, select:focus, textarea:focus { outline: 2px solid #8b5cf6; outline-offset: 2px; }
        .table-row:hover { background-color: rgba(30, 41, 59, 0.5); }
        textarea { resize: vertical; min-height: 80px; font-family: inherit; }
      `}</style>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {showImportModal && <ImportModal activeTab={activeTab} onClose={() => setShowImportModal(false)} onSuccess={() => { fetchRecords(); setToast({ message: 'Import successful!', type: 'success' }); }} setToast={setToast} />}

      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentUser={currentUser} onLogout={handleLogout} />
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setDetailView(null); setFormData({}); setShowForm(false); }}
      />

      <main style={{ paddingTop: '80px', marginLeft: sidebarOpen ? '256px' : '80px', transition: 'margin-left 0.3s' }}>
        <div style={{ padding: '32px' }}>
          {activeTab === 'Home' ? (
            <DashboardView records={records} setShowImportModal={setShowImportModal} onNavigate={handleNavigateToRelated} />
          ) : activeTab === 'Chatbot' ? (
            <Chatbot />
          ) : detailView ? (
            <DetailView
              objectName={activeTab}
              record={detailView}
              onBack={handleBackToList}
              relatedRecords={relatedRecords}
              loadingRelated={loadingRelated}
              onNavigateToRelated={handleNavigateToRelated}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ) : (
            <ObjectView
              objectName={activeTab}
              records={records}
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              loading={loading}
              fetchingRecords={fetchingRecords}
              showForm={showForm}
              setShowForm={setShowForm}
              setShowImportModal={setShowImportModal}
              onViewDetail={handleViewDetail}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Detail View Component
function DetailView({ objectName, record, onBack, relatedRecords, loadingRelated, onNavigateToRelated, handleEdit, handleDelete }) {
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
    Product2: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    Order: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    Invoice__c: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    Shipment__c: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    Inventory__c: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
  };

  const rels = relationships[objectName] || [];
  const recordName = record.Name || `${record.FirstName || ''} ${record.LastName || ''}`.trim() || record.Subject || record.Id;

  return (
    <div>
      {/* Breadcrumb */}
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '8px', color: '#94a3b8', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginBottom: '24px' }}>
        <ArrowLeft size={16} />
        Back to {objectName}s
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', background: gradients[objectName] || 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <Icon size={32} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>{recordName}</h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>{objectName} • ID: {record.Id}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => handleEdit(record)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#e2e8f0', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            <Edit size={18} />
            Edit
          </button>
          <button onClick={() => handleDelete(record.Id, recordName)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
        {/* Details Panel */}
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px', height: 'fit-content', position: 'sticky', top: '96px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {fields.slice(0, 10).map(field => {
              const value = record[field.name];
              return (
                <div key={field.name}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{field.label}</p>
                  <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0, fontWeight: 500 }}>
                    {value || '-'}
                  </p>
                </div>
              );
            })}
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Created Date</p>
              <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0, fontWeight: 500 }}>
                {record.CreatedDate ? new Date(record.CreatedDate).toLocaleString() : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Related Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {rels.length > 0 ? (
            rels.map(rel => {
              const relRecords = relatedRecords[rel.object] || [];
              const isLoading = loadingRelated[rel.object];
              const relNavItem = navItems.find(i => i.id === rel.object);
              const RelIcon = relNavItem?.icon || Building2;

              // For single relationships (many-to-one)
              if (rel.single) {
                const linkedId = record[rel.field];
                return (
                  <div key={rel.object} style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <RelIcon size={20} color="#94a3b8" />
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>{rel.label}</h3>
                      </div>
                    </div>
                    {linkedId ? (
                      <button onClick={() => onNavigateToRelated(rel.object, linkedId)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '8px', color: '#3b82f6', fontSize: '14px', fontWeight: 500, cursor: 'pointer', width: '100%', justifyContent: 'space-between' }}>
                        <span>View {rel.object}</span>
                        <ExternalLink size={16} />
                      </button>
                    ) : (
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No {rel.label} linked</p>
                    )}
                  </div>
                );
              }

              // For multiple relationships (one-to-many)
              return (
                <div key={rel.object} style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RelIcon size={20} color="#94a3b8" />
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>{rel.label} ({relRecords.length})</h3>
                    </div>
                    <button onClick={() => onNavigateToRelated(rel.object)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      <Plus size={16} />
                      New
                    </button>
                  </div>

                  {isLoading ? (
                    <div style={{ padding: '32px', textAlign: 'center' }}>
                      <Loader2 className="animate-pulse" size={32} color="#8b5cf6" style={{ margin: '0 auto' }} />
                    </div>
                  ) : relRecords.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center' }}>
                      <RelIcon size={32} color="#475569" style={{ margin: '0 auto 12px' }} />
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No {rel.label.toLowerCase()} found</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {relRecords.map((relRec, idx) => {
                        const relRecName = relRec.Name || `${relRec.FirstName || ''} ${relRec.LastName || ''}`.trim() || relRec.Subject || relRec.Id;
                        return (
                          <button key={relRec.Id} onClick={() => onNavigateToRelated(rel.object, relRec.Id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'none', border: 'none', borderBottom: idx < relRecords.length - 1 ? '1px solid rgba(51, 65, 85, 0.3)' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.2s' }} className="table-row">
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 500, color: '#e2e8f0', margin: '0 0 4px 0' }}>{relRecName}</p>
                              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{relRec.Id}</p>
                            </div>
                            <ChevronRight size={16} color="#64748b" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <p style={{ color: '#64748b', margin: 0 }}>No related objects configured</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Login Page Component
function LoginPage({ onLogin, setToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Login attempt:', { email, password });

    if (!email || !password) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    if (!email.includes('@')) {
      setToast({ message: 'Please enter a valid email address', type: 'error' });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const user = {
        name: 'Salesforceconnect',
        email: email,
        role: 'Administrator'
      };

      console.log('Login successful, user:', user);

      onLogin(user);
      setToast({ message: 'Login successful!', type: 'success' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '24px', padding: '48px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '36px' }}>L</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: '0 0 8px 0' }}>Welcome Back</h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Sign in to Zaylo</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="email-input" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                console.log('Email changed:', e.target.value);
                setEmail(e.target.value);
              }}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)'}
            />
          </div>

          <div>
            <label htmlFor="password-input" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
              Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => {
                console.log('Password changed');
                setPassword(e.target.value);
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: loading ? '#64748b' : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onClick={(e) => {
              console.log('Button clicked directly');
              if (loading) {
                e.preventDefault();
              }
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? <><Loader2 className="animate-pulse" size={20} /> Signing in...</> : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => {
              console.log('Quick login clicked');
              setEmail('demo@test.com');
              setPassword('demo123');
              setTimeout(() => {
                handleSubmit({ preventDefault: () => { }, stopPropagation: () => { } });
              }, 100);
            }}
            style={{
              width: '100%',
              padding: '10px 20px',
              background: 'rgba(30, 41, 59, 0.5)',
              color: '#94a3b8',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Quick Demo Login
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
          <p style={{ margin: 0 }}>Demo Mode: Enter any email (e.g., demo@test.com) and any password</p>
        </div>
      </div>
    </div>
  );
}

// Import Modal Component
function ImportModal({ activeTab, onClose, onSuccess, setToast }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setToast({ message: 'Only CSV files are supported', type: 'error' });
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setToast({ message: 'File size must be less than 10MB', type: 'error' });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    setTimeout(() => {
      setUploading(false);
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <div className="animate-fade" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '20px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Import {activeTab}s</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? '#8b5cf6' : 'rgba(51, 65, 85, 0.5)'}`,
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '24px',
            backgroundColor: dragActive ? 'rgba(139, 92, 246, 0.1)' : 'rgba(30, 41, 59, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          <Upload size={48} color={dragActive ? '#8b5cf6' : '#64748b'} style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#e2e8f0', marginBottom: '8px', fontWeight: 500 }}>
            {file ? file.name : 'Drop your CSV file here'}
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>or</p>
          <label style={{ display: 'inline-block', padding: '10px 20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Browse Files
            <input type="file" accept=".csv" onChange={(e) => handleFile(e.target.files[0])} style={{ display: 'none' }} />
          </label>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', margin: '12px 0 0 0' }}>CSV only • Max 10MB</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 24px', backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#e2e8f0', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleUpload} disabled={!file || uploading} style={{ flex: 1, padding: '12px 24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: (!file || uploading) ? 'not-allowed' : 'pointer', opacity: (!file || uploading) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {uploading ? <><Loader2 className="animate-pulse" size={16} /> Uploading...</> : <><Upload size={16} /> Upload</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast Component
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

// Header Component
function Header({ sidebarOpen, setSidebarOpen, currentUser, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '80px', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(51, 65, 85, 0.5)', zIndex: 40 }}>
      <div style={{ height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '8px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '8px' }}>
            <Menu size={24} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>Z</span>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Zaylo</h1>
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

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid rgba(51, 65, 85, 0.5)' }}>
            <button onClick={() => setShowDropdown(!showDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{currentUser?.name?.charAt(0) || 'U'}</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', margin: 0 }}>{currentUser?.name || 'User'}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{currentUser?.role || 'User'}</p>
              </div>
              <ChevronDown size={16} color="#94a3b8" />
            </button>

            {showDropdown && (
              <div className="animate-fade" style={{ position: 'absolute', top: '60px', right: 0, width: '200px', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', padding: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'none', border: 'none', color: '#ef4444', fontSize: '14px', fontWeight: 500, cursor: 'pointer', borderRadius: '8px', textAlign: 'left' }}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Sidebar Component
function Sidebar({ sidebarOpen, activeTab, setActiveTab }) {
  return (
    <aside style={{ position: 'fixed', left: 0, top: '80px', bottom: 0, width: sidebarOpen ? '256px' : '80px', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(51, 65, 85, 0.5)', transition: 'width 0.3s', zIndex: 30, overflowY: 'auto' }}>
      <nav style={{ padding: '16px', paddingBottom: '80px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
            Product2: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            Order: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            Invoice__c: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            Shipment__c: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
            Inventory__c: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
            Payment__c: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            Quote: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            Asset: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            Campaign: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
            WorkOrder: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
          };

          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', fontWeight: 500, background: isActive ? (gradients[item.id] || 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)') : 'transparent', color: isActive ? '#fff' : '#94a3b8', boxShadow: isActive ? '0 4px 12px rgba(139, 92, 246, 0.4)' : 'none' }}>
              <Icon size={20} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      {sidebarOpen && (
        <div style={{ position: 'fixed', bottom: '16px', left: '16px', width: '224px', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', padding: '8px', zIndex: 31 }}>
          <button onClick={() => alert('Settings feature coming soon!')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent', color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      )}
    </aside>
  );
}

// Dashboard View Component
function DashboardView({ records, setShowImportModal, onNavigate }) {
  const [stats, setStats] = useState({ accounts: 0, contacts: 0, leads: 0, cases: 0, opportunities: 0, contracts: 0 });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const objects = ['Account', 'Contact', 'Lead', 'Case', 'Opportunity', 'Contract'];
      const counts = {};
      const activities = [];

      for (const obj of objects) {
        const res = await fetch(`${API}/${obj}`);
        const data = await res.json();
        if (data.success) {
          counts[obj.toLowerCase() + 's'] = data.records.length;
          data.records.slice(0, 3).forEach(record => {
            activities.push({
              type: obj,
              name: record.Name || `${record.FirstName || ''} ${record.LastName || ''}`.trim() || record.Subject || 'Record',
              date: record.CreatedDate,
              id: record.Id
            });
          });
        }
      }

      setStats(counts);
      setRecentActivity(activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  const statCards = [
    { label: 'Total Accounts', value: stats.accounts, icon: Building2, color: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', change: '+12%', objectName: 'Account' },
    { label: 'Active Contacts', value: stats.contacts, icon: Users, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', change: '+8%', objectName: 'Contact' },
    { label: 'New Leads', value: stats.leads, icon: Target, color: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', change: '+24%', objectName: 'Lead' },
    { label: 'Open Cases', value: stats.cases, icon: FileText, color: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)', change: '-5%', objectName: 'Case' },
  ];

  const quickLinks = [
    { label: 'Import Data', icon: Upload, action: () => setShowImportModal(true), color: '#8b5cf6' },
    { label: 'Export Report', icon: Download, action: () => { }, color: '#3b82f6' },
    { label: 'View Analytics', icon: Target, action: () => { }, color: '#10b981' },
    { label: 'Settings', icon: Settings, action: () => { }, color: '#f97316' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Here's what's happening with your business today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith('+');
          return (
            <div key={idx} onClick={() => onNavigate(stat.objectName)} className="animate-fade" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px', transition: 'all 0.3s', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500, margin: 0 }}>{stat.label}</p>
                <div style={{ width: '48px', height: '48px', background: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  <Icon size={24} color="#fff" />
                </div>
              </div>
              <h3 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', margin: '0 0 8px 0' }}>{stat.value}</h3>
              <p style={{ color: isPositive ? '#10b981' : '#ef4444', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                {isPositive ? '↑' : '↓'} {stat.change} from last month
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(30, 41, 59, 0.3)', borderRadius: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500, margin: '0 0 4px 0' }}>{activity.type} Created</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{activity.name}</p>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
            )) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0', margin: 0 }}>No recent activity</p>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>Quick Links</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <button key={idx} onClick={link.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '20px', backgroundColor: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: link.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color="#fff" />
                  </div>
                  <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Object View Component with enhanced list view
function ObjectView({ objectName, records, formData, setFormData, handleSubmit, handleEdit, handleDelete, loading, fetchingRecords, showForm, setShowForm, setShowImportModal, onViewDetail }) {
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
    Product2: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    Order: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    Invoice__c: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    Shipment__c: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    Inventory__c: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
  };

  const [lookupRecords, setLookupRecords] = useState({});

  // Fetch lookup records for relationship fields
  const fetchLookupRecords = async (lookupObject) => {
    if (lookupRecords[lookupObject]) return;

    try {
      const res = await fetch(`${API}/${lookupObject}`);
      const data = await res.json();
      if (data.success) {
        setLookupRecords(prev => ({ ...prev, [lookupObject]: data.records }));
      }
    } catch (err) {
      console.error(`Failed to fetch ${lookupObject}:`, err);
    }
  };

  const renderFormField = (field) => {
    const isLookupField = field.lookup;

    if (field.type === 'select') {
      return (
        <select
          value={formData[field.name] || ''}
          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          style={{ width: '100%', padding: '10px 16px', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
        >
          <option value="">-- Select --</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    } else if (field.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={formData[field.name] || false}
          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
      );
    } else if (isLookupField) {
      return (
        <div style={{ position: 'relative' }}>
          <select
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            onFocus={() => fetchLookupRecords(field.lookup)}
            style={{ width: '100%', padding: '10px 16px', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
          >
            <option value="">-- Select {field.lookup} --</option>
            {(lookupRecords[field.lookup] || []).map((rec) => {
              const displayName = rec.Name || `${rec.FirstName || ''} ${rec.LastName || ''}`.trim() || rec.Id;
              return (
                <option key={rec.Id} value={rec.Id}>
                  {displayName}
                </option>
              );
            })}
          </select>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            {formData[field.name] ? `Linked to ${field.lookup}: ${formData[field.name]}` : `Search and select ${field.lookup}`}
          </div>
        </div>
      );
    } else {
      return (
        <input
          type={field.type || 'text'}
          value={formData[field.name] || ''}
          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          placeholder={field.placeholder}
          style={{ width: '100%', padding: '10px 16px', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
        />
      );
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: gradients[objectName] || 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              <Icon size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>{objectName}s</h1>
          </div>
          <p style={{ color: '#94a3b8', margin: 0 }}>Manage your {objectName.toLowerCase()} records • {records.length} total</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowImportModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#e2e8f0', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            <Upload size={18} />
            Import
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={20} />
            New {objectName}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showForm ? '380px 1fr' : '1fr', gap: '24px' }}>
        {showForm && (
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', padding: '24px', position: 'sticky', top: '96px', height: 'fit-content', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                {formData.Id ? `Edit ${objectName}` : `Create ${objectName}`}
              </h2>
              <button onClick={() => { setShowForm(false); setFormData({}); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {fields.map((field) => (
                <div key={field.name}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                    {field.label}{field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  {renderFormField(field)}
                </div>
              ))}

              <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
                {loading ? (
                  <><Loader2 className="animate-pulse" size={20} /> Saving...</>
                ) : (
                  <><Check size={20} /> {formData.Id ? 'Update' : 'Save'} {objectName}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* List View */}
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', overflow: 'hidden' }}>
          {fetchingRecords ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Loader2 className="animate-pulse" size={48} color="#8b5cf6" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', margin: 0 }}>Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Icon size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', margin: '0 0 4px 0', fontWeight: 500 }}>No records found</p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Create your first {objectName.toLowerCase()} to get started</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}>
                    {fields.slice(0, 4).map((field, idx) => (
                      <th key={idx} style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {field.label}
                      </th>
                    ))}
                    <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, idx) => (
                    <tr key={rec.Id} className="table-row" style={{ borderBottom: idx < records.length - 1 ? '1px solid rgba(51, 65, 85, 0.3)' : 'none', transition: 'background-color 0.2s' }}>
                      {fields.slice(0, 4).map((field, fieldIdx) => (
                        <td key={fieldIdx} style={{ padding: '16px 20px', fontSize: '14px', color: '#e2e8f0' }}>
                          {rec[field.name] || '-'}
                        </td>
                      ))}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => onViewDetail(rec)} style={{ padding: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: '6px', color: '#3b82f6', cursor: 'pointer' }}>
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEdit(rec)} style={{ padding: '6px', backgroundColor: 'rgba(139, 92, 246, 0.1)', border: 'none', borderRadius: '6px', color: '#8b5cf6', cursor: 'pointer' }}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(rec.Id, rec.Name || `${rec.FirstName || ''} ${rec.LastName || ''}`.trim() || rec.Subject)} style={{ padding: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
