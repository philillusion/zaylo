import express from 'express';
import cors from 'cors';
import jsforce from 'jsforce';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const conn = new jsforce.Connection({
  loginUrl: process.env.SF_INSTANCE_URL || 'https://login.salesforce.com'
});

async function connectToSalesforce() {
  try {
    await conn.login(
      process.env.SF_USERNAME,
      process.env.SF_PASSWORD + (process.env.SF_SECURITY_TOKEN || '')
    );
    console.log('✅ Connected to Salesforce');
  } catch (err) {
    console.error('❌ Salesforce login failed:', err.message);
  }
}

// Field mappings for each object - CORRECTED for custom objects
const objectFields = {
  Account: 'Id, Name, Industry, Phone, Type, Website, BillingCity, BillingState, CreatedDate',
  Contact: 'Id, FirstName, LastName, Email, Phone, Title, Department, AccountId, CreatedDate',
  Lead: 'Id, FirstName, LastName, Company, Email, Phone, Status, Industry, CreatedDate',
  Case: 'Id, Subject, Status, Priority, Type, Origin, AccountId, ContactId, CreatedDate',
  Opportunity: 'Id, Name, StageName, Amount, CloseDate, Probability, Type, AccountId, CreatedDate',
  Contract: 'Id, AccountId, Status, StartDate, ContractTerm, CreatedDate',
  Campaign: 'Id, Name, Type, Status, StartDate, EndDate, CreatedDate',
  Asset: 'Id, Name, SerialNumber, InstallDate, Status, Product2Id, AccountId, CreatedDate',
  WorkOrder: 'Id, WorkOrderNumber, Subject, Status, Priority, AccountId, AssetId, CreatedDate',
  Product2: 'Id, Name, ProductCode, Family, IsActive, Description, CreatedDate',
  Order: 'Id, OrderNumber, Status, TotalAmount, EffectiveDate, AccountId, BillingCity, ShippingCity, CreatedDate',
  Quote: 'Id, Name, Status, GrandTotal, ExpirationDate, OpportunityId, AccountId, CreatedDate',

  // Custom objects - with proper field API names
  Invoice__c: 'Id, Name, Invoice_Number__c, Status__c, Total_Amount__c, Invoice_Date__c, Due_Date__c, Order__c, Account__c, CreatedDate',
  Payment__c: 'Id, Name, Amount__c, Payment_Date__c, Payment_Method__c, Status__c, Invoice__c, CreatedDate',
  Inventory__c: 'Id, Name, Product__c, Warehouse_Location__c, Quantity_Available__c, Unit_Cost__c, CreatedDate',
  Shipment__c: 'Id, Name, Order__c, Tracking_Number__c, Carrier__c, Status__c, Shipped_Date__c, CreatedDate'
};

// ⚠️ IMPORTANT: Health endpoint MUST come BEFORE generic :object routes!
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    connected: !!conn.accessToken,
    timestamp: new Date().toISOString()
  });
});

// 🤖 CHATBOT ENDPOINT - Mock AI Response
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string'
      });
    }

    console.log(`💬 Chat message received: "${message}"`);

    // Simulate processing delay (0.5-1.5 seconds for realism)
    const delay = Math.floor(Math.random() * 1000) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate mock response based on message content
    let reply = generateMockResponse(message);

    // Return response
    res.json({
      success: true,
      reply: reply,
      timestamp: new Date().toISOString(),
      conversationId: generateConversationId()
    });

    console.log(`✅ Chat response sent: "${reply.substring(0, 50)}..."`);

  } catch (err) {
    console.error('❌ Chat endpoint error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Helper function to generate contextual mock responses
function generateMockResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
    return "Hello! I'm Slavo, your Salesforce CRM assistant. How can I help you today?";
  }

  // Help requests
  if (lowerMessage.includes('help')) {
    return "I can help you with:\n- Finding records in Salesforce\n- Creating new records\n- Analyzing your data\n- Answering questions about your CRM\n\nWhat would you like to do?";
  }

  // Account queries
  if (lowerMessage.includes('account')) {
    return "I can help you manage accounts. Would you like to:\n- View all accounts\n- Create a new account\n- Search for a specific account\n- See account insights";
  }

  // Contact queries
  if (lowerMessage.includes('contact')) {
    return "I can assist with contacts. You can:\n- View your contacts list\n- Add a new contact\n- Find contacts by account\n- Update contact information";
  }

  // Lead queries
  if (lowerMessage.includes('lead')) {
    return "Let me help you with leads. I can:\n- Show your recent leads\n- Create a new lead\n- Check lead status\n- Convert leads to opportunities";
  }

  // Opportunity queries
  if (lowerMessage.includes('opportunit')) {
    return "I can help with opportunities! Would you like to:\n- View your pipeline\n- Create a new opportunity\n- Check deal stages\n- See revenue forecasts";
  }

  // Case/Support queries
  if (lowerMessage.includes('case') || lowerMessage.includes('support')) {
    return "For support cases, I can:\n- Show open cases\n- Create a new case\n- Check case priority\n- Update case status";
  }

  // Report queries
  if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
    return "I can generate reports on:\n- Sales pipeline\n- Lead conversion\n- Revenue analysis\n- Support metrics\n\nWhich report would you like to see?";
  }

  // Search queries
  if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('show me')) {
    return "I can search across all your Salesforce records. What would you like to find? Please specify the object type (accounts, contacts, leads, etc.) and search criteria.";
  }

  // Create/Add queries
  if (lowerMessage.includes('create') || lowerMessage.includes('add') || lowerMessage.includes('new')) {
    return "I can help you create new records. Which type would you like to add?\n- Account\n- Contact\n- Lead\n- Opportunity\n- Case\n- Product";
  }

  // Data/Stats queries
  if (lowerMessage.includes('how many') || lowerMessage.includes('total') || lowerMessage.includes('count')) {
    return "I can provide statistics on your CRM data. Would you like to know about:\n- Total accounts\n- Active contacts\n- Open opportunities\n- Cases this month";
  }

  // Thank you
  if (lowerMessage.includes('thank')) {
    return "You're welcome! Let me know if you need anything else.";
  }

  // Goodbye
  if (lowerMessage.match(/^(bye|goodbye|see you|exit)/)) {
    return "Goodbye! Feel free to come back anytime you need assistance with your CRM.";
  }

  // Default response for unrecognized queries
  const defaultResponses = [
    "I'm Slavo, your Salesforce assistant. I can help you manage accounts, contacts, leads, opportunities, and more. What would you like to do?",
    "I understand you're asking about Salesforce CRM. Could you please be more specific? For example, ask about accounts, contacts, leads, or reports.",
    "I'm here to help! I can assist with viewing records, creating new entries, generating reports, and answering questions about your CRM data. What do you need?",
    "That's an interesting question! As your CRM assistant, I specialize in helping with Salesforce operations. Try asking about specific records or actions you'd like to perform."
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Helper function to generate conversation ID
function generateConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create record
app.post('/api/:object', async (req, res) => {
  try {
    const { object } = req.params;
    console.log(`Creating ${object}:`, req.body);
    const result = await conn.sobject(object).create(req.body);
    if (result.success) {
      res.json({ success: true, id: result.id });
    } else {
      res.status(400).json({ success: false, errors: result.errors });
    }
  } catch (err) {
    console.error(`Error creating ${req.params.object}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get recent records
app.get('/api/:object', async (req, res) => {
  try {
    const { object } = req.params;
    const fields = objectFields[object] || 'Id, Name, CreatedDate';
    console.log(`Fetching ${object} records with fields: ${fields}`);

    const records = await conn.sobject(object)
      .select(fields)
      .limit(100)
      .sort({ CreatedDate: -1 })
      .execute();

    console.log(`✅ Found ${records.length} ${object} records`);
    res.json({ success: true, records });
  } catch (err) {
    console.error(`Error fetching ${req.params.object}:`, err);
    res.status(500).json({
      success: false,
      error: err.message,
      details: `Failed to fetch ${req.params.object}. Make sure the object exists in your Salesforce org.`
    });
  }
});

// Get single record by ID
app.get('/api/:object/:id', async (req, res) => {
  try {
    const { object, id } = req.params;
    const fields = objectFields[object] || 'Id, Name, CreatedDate';
    console.log(`Fetching ${object} record ${id}...`);
    const record = await conn.sobject(object).retrieve(id);
    console.log(`✅ Found ${object} record`);
    res.json({ success: true, record });
  } catch (err) {
    console.error(`Error fetching ${req.params.object}/${req.params.id}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update record
app.patch('/api/:object/:id', async (req, res) => {
  try {
    const { object, id } = req.params;
    console.log(`Updating ${object} ${id}:`, req.body);

    // Remove all read-only fields from update payload
    const readOnlyFields = ['Id', 'CreatedDate', 'CreatedById', 'LastModifiedDate', 'LastModifiedById', 'SystemModstamp', 'IsDeleted'];
    const updateData = { ...req.body };
    readOnlyFields.forEach(field => delete updateData[field]);

    console.log(`Cleaned data for update:`, updateData);

    const result = await conn.sobject(object).update({
      Id: id,
      ...updateData
    });

    if (result.success) {
      console.log(`✅ Updated ${object} ${id}`);
      res.json({ success: true, id: result.id });
    } else {
      console.error(`Failed to update ${object} ${id}:`, result.errors);
      res.status(400).json({ success: false, errors: result.errors });
    }
  } catch (err) {
    console.error(`Error updating ${req.params.object}/${req.params.id}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete record
app.delete('/api/:object/:id', async (req, res) => {
  try {
    const { object, id } = req.params;
    console.log(`Deleting ${object} ${id}...`);
    const result = await conn.sobject(object).destroy(id);

    if (result.success) {
      console.log(`✅ Deleted ${object} ${id}`);
      res.json({ success: true, id: result.id });
    } else {
      console.error(`Failed to delete ${object} ${id}:`, result.errors);
      res.status(400).json({ success: false, errors: result.errors });
    }
  } catch (err) {
    console.error(`Error deleting ${req.params.object}/${req.params.id}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chatbot endpoint: http://localhost:${PORT}/api/chat`);
  await connectToSalesforce();
});