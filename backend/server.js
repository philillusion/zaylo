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

// Field mappings for each object
const objectFields = {
  Account: 'Id, Name, Industry, Phone, CreatedDate',
  Contact: 'Id, FirstName, LastName, Email, Phone, CreatedDate',
  Lead: 'Id, FirstName, LastName, Company, Email, Status, CreatedDate',
  Case: 'Id, Subject, Status, Priority, CreatedDate',
  Opportunity: 'Id, Name, StageName, Amount, CloseDate, CreatedDate',
  Contract: 'Id, AccountId, Status, StartDate, ContractTerm, OwnerExpirationNotice, CreatedDate'
};

// Create record
app.post('/api/:object', async (req, res) => {
  try {
    const { object } = req.params;
    const result = await conn.sobject(object).create(req.body);
    if (result.success) {
      res.json({ success: true, id: result.id });
    } else {
      res.status(400).json({ success: false, errors: result.errors });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get recent records
app.get('/api/:object', async (req, res) => {
  try {
    const { object } = req.params;
    const fields = objectFields[object] || 'Id, Name, CreatedDate';
    const records = await conn.sobject(object)
      .select(fields)
      .limit(10)
      .sort({ CreatedDate: -1 })
      .execute();
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', connected: !!conn.accessToken });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await connectToSalesforce();
});