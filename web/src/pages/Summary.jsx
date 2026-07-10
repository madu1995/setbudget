import React, { useState } from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PageContainer = styled.div`
  padding: 40px;
  @media (max-width: 600px) { padding: 20px; }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 10px;
`;

const SubTitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 30px;
  font-size: 1.1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 20px;
  margin-top: 40px;
`;

const Card = styled.div`
  background: white;
  border-radius: ${props => props.theme.radius.md};
  padding: 24px;
  box-shadow: ${props => props.theme.shadows.base};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 20px;
`;

const FundCard = styled(Card)`
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #93c5fd;
`;

const StatGrid = styled.div`
  display: flex;
  justify-content: space-around;
  text-align: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${props => props.fundColor ? '#1d4ed8' : '#6B7280'};
  font-weight: 600;
`;

const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${props => props.fundColor ? '#1e40af' : 'inherit'};
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #F8F9FA;
  border-radius: ${props => props.theme.radius.sm};
  border-left: 4px solid #007BFF;
`;

const Payer = styled.span`font-weight: 700; color: #DC2626;`;
const Receiver = styled.span`font-weight: 700; color: #007BFF;`;

const Amount = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.secondary};
`;

const ActionButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: ${props => props.theme.radius.sm};
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  &:hover { background-color: #0056b3; }
`;

const Select = styled.select`
  padding: 10px 15px;
  border-radius: ${props => props.theme.radius.sm};
  border: 1px solid ${props => props.theme.colors.border};
  background-color: white;
  color: ${props => props.theme.colors.secondary};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  margin-bottom: 20px;
  min-width: 250px;
  &:focus { border-color: ${props => props.theme.colors.primary}; }
`;

const Th = styled.th`padding: 12px; text-align: left; font-weight: 700; font-size: 0.85rem; color: #374151;`;
const Td = styled.td`padding: 12px; font-size: 0.9rem;`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${props => {
    if (props.status === 'completed') return '#dcfce7';
    if (props.status === 'in_progress') return '#fef9c3';
    return '#f3f4f6';
  }};
  color: ${props => {
    if (props.status === 'completed') return '#166534';
    if (props.status === 'in_progress') return '#854d0e';
    return '#374151';
  }};
`;

const FormRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
`;

// PDF Modal Styles
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContent = styled.div`
  background-color: #121212; color: #fff; padding: 24px; border-radius: 12px;
  width: 100%; max-width: 400px; border: 1px solid #333;
`;
const CheckboxRow = styled.label`
  display: flex; align-items: center; gap: 10px; margin-bottom: 15px; cursor: pointer;
`;

export default function Summary() {
  const { 
    events, activeEvent, selectEvent, summaryData,
    tasks, pendingBills, borrowedItems, publicDonations,
    updateTaskStatus, payPendingBill, returnBorrowedItem,
    addTask, addPendingBill, addBorrowedItem, addPublicDonation
  } = useBudget();

  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    financialContributors: true,
    publicDonations: true,
    leftoverAssets: true,
    settledExpenses: true
  });

  // Forms State
  const [taskForm, setTaskForm] = useState({ taskName: '', assignedLead: '' });
  const [billForm, setBillForm] = useState({ vendorName: '', description: '', amount: '' });
  const [itemForm, setItemForm] = useState({ itemName: '', borrowedFrom: '', takenBy: '', rentalFee: '' });
  const [donationForm, setDonationForm] = useState({ donorName: '', amount: '' });

  const fmt = (n) => (n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

  const handleCreateTask = () => {
    if (taskForm.taskName) {
      addTask(taskForm);
      setTaskForm({ taskName: '', assignedLead: '' });
    }
  };

  const handleCreateBill = () => {
    if (billForm.vendorName && billForm.amount) {
      addPendingBill(billForm);
      setBillForm({ vendorName: '', description: '', amount: '' });
    }
  };

  const handleCreateItem = () => {
    if (itemForm.itemName) {
      addBorrowedItem(itemForm);
      setItemForm({ itemName: '', borrowedFrom: '', takenBy: '', rentalFee: '' });
    }
  };

  const handleCreateDonation = () => {
    if (donationForm.amount) {
      addPublicDonation(donationForm);
      setDonationForm({ donorName: '', amount: '' });
    }
  };

  const generatePDF = () => {
    if (!activeEvent || !summaryData) return;

    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`${activeEvent.eventType === 'community_project' ? 'Project Report' : 'Settlement Report'}: ${activeEvent.name}`, 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      let yPos = 28;

      if (activeEvent.startDate) {
        const dateStr = new Date(activeEvent.startDate).toLocaleDateString() +
          (activeEvent.endDate ? ` - ${new Date(activeEvent.endDate).toLocaleDateString()}` : '');
        doc.text(`Date: ${dateStr}`, 14, yPos); yPos += 6;
      }
      if (activeEvent.location) {
        doc.text(`Location: ${activeEvent.location}`, 14, yPos); yPos += 6;
      }
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yPos); yPos += 10;

      doc.setTextColor(0);

      if (activeEvent.eventType === 'community_project') {
        doc.setFontSize(14);
        doc.text('Financial Summary', 14, yPos); yPos += 8;
        doc.setFontSize(11);
        doc.text(`Total Income: LKR ${fmt(summaryData.totalIncome)}`, 14, yPos); yPos += 6;
        doc.text(`Total Expenses: LKR ${fmt(summaryData.totalExpenses)}`, 14, yPos); yPos += 6;
        doc.text(`Net Association Balance: LKR ${fmt(summaryData.netAssociationBalance)}`, 14, yPos); yPos += 10;

        if (pdfOptions.financialContributors && summaryData.financialContributors.length > 0) {
          doc.setFontSize(14);
          doc.text('Financial Contributors', 14, yPos); yPos += 6;
          const rows = summaryData.financialContributors.map(c => [c.name, c.type, `LKR ${fmt(c.amount)}`]);
          autoTable(doc, { head: [['Name', 'Type', 'Amount']], body: rows, startY: yPos });
          yPos = doc.lastAutoTable.finalY + 10;
        }

        if (pdfOptions.leftoverAssets && summaryData.nonFinancialContributors.length > 0) {
          doc.setFontSize(14);
          doc.text('Materials & Assets Contributed', 14, yPos); yPos += 6;
          const rows = [];
          summaryData.nonFinancialContributors.forEach(c => {
            c.materials.forEach(m => rows.push([c.name, m.itemName, m.quantity]));
          });
          autoTable(doc, { head: [['Contributor', 'Item', 'Quantity']], body: rows, startY: yPos });
          yPos = doc.lastAutoTable.finalY + 10;
        }

      } else {
        // Standard Trip/Party Mode PDF Generation
        doc.setFontSize(12);
        doc.text(`Total Event Expense: LKR ${fmt(summaryData.totalSpent)}`, 14, yPos); yPos += 6;
        doc.text(`Total Expected Fund: LKR ${fmt(summaryData.totalExpected)}`, 14, yPos); yPos += 6;
        doc.text(`Deficit/Overrun: LKR ${fmt(summaryData.deficit)}`, 14, yPos); yPos += 6;
        doc.text(`Deficit Share (per-person): LKR ${fmt(summaryData.deficitShare)}`, 14, yPos); yPos += 10;

        // Balances Table
        const tableColumn = ['Participant', 'Target', 'Deposit', 'Paid', 'Liability', 'Balance'];
        const tableRows = (summaryData.balances || []).map(b => {
          let balanceText = 'Settled';
          if (b.balance > 0.01) balanceText = `Owes LKR ${fmt(b.balance)}`;
          else if (b.balance < -0.01) balanceText = `Refund LKR ${fmt(Math.abs(b.balance))}`;
          return [b.name, `LKR ${fmt(b.baseFee)}`, `LKR ${fmt(b.initialDeposit)}`, `LKR ${fmt(b.totalPaid)}`, `LKR ${fmt(b.liability)}`, balanceText];
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: yPos });
      }

      doc.save(`${activeEvent.name.replace(/\s+/g, '_')}_Report.pdf`);
      setShowPDFModal(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('There was an error generating the PDF.');
    }
  };

  const fs = summaryData?.fundSummary;
  const hasFund = fs && fs.totalCollected > 0;

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <Title>Event Summary</Title>
          <SubTitle>View financial breakdowns and manage the event</SubTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: '600' }}>Select Event</label>
            <Select value={activeEvent?._id || ''} onChange={(e) => selectEvent(e.target.value)}>
              <option value="" disabled>-- Select an Event --</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>{event.name}</option>
              ))}
            </Select>
          </div>
        </div>
        {activeEvent && <ActionButton onClick={() => setShowPDFModal(true)}>Download Report (PDF)</ActionButton>}
      </div>

      {!activeEvent || !summaryData ? (
        <Card style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
          <h3>No event selected.</h3>
          <p>Please select an event from the dropdown above.</p>
        </Card>
      ) : activeEvent.eventType === 'community_project' ? (
        <>
          {/* Community Project Dashboard */}
          <Card>
            <StatGrid>
              <StatItem>
                <StatLabel>Total Income (Donations)</StatLabel>
                <StatValue style={{ color: '#15803d' }}>LKR {fmt(summaryData.totalIncome)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Total Expenses</StatLabel>
                <StatValue style={{ color: '#dc2626' }}>LKR {fmt(summaryData.totalExpenses)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Net Balance</StatLabel>
                <StatValue style={{ color: summaryData.netAssociationBalance >= 0 ? '#15803d' : '#dc2626' }}>
                  LKR {fmt(summaryData.netAssociationBalance)}
                </StatValue>
              </StatItem>
            </StatGrid>
          </Card>

          <SectionTitle>📋 Task Management</SectionTitle>
          <Card>
            <FormRow>
              <Input placeholder="Task Name" value={taskForm.taskName} onChange={e => setTaskForm({...taskForm, taskName: e.target.value})} />
              <Input placeholder="Assigned Lead" value={taskForm.assignedLead} onChange={e => setTaskForm({...taskForm, assignedLead: e.target.value})} />
              <ActionButton style={{ marginTop: 0 }} onClick={handleCreateTask}>Add Task</ActionButton>
            </FormRow>
            <table style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
              <thead><tr><Th>Task</Th><Th>Lead</Th><Th>Status</Th><Th>Action</Th></tr></thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t._id}>
                    <Td>{t.taskName}</Td>
                    <Td>{t.assignedLead}</Td>
                    <Td><Badge status={t.status}>{t.status.replace('_', ' ')}</Badge></Td>
                    <Td>
                      <select value={t.status} onChange={e => updateTaskStatus(t._id, e.target.value)} style={{ padding: '4px' }}>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <SectionTitle>🛒 Pending Shop Bills</SectionTitle>
          <Card>
            <FormRow>
              <Input placeholder="Vendor (e.g. Saman Hardware)" value={billForm.vendorName} onChange={e => setBillForm({...billForm, vendorName: e.target.value})} />
              <Input placeholder="Description" value={billForm.description} onChange={e => setBillForm({...billForm, description: e.target.value})} />
              <Input type="number" placeholder="Amount" value={billForm.amount} onChange={e => setBillForm({...billForm, amount: e.target.value})} />
              <ActionButton style={{ marginTop: 0 }} onClick={handleCreateBill}>Add Bill</ActionButton>
            </FormRow>
            <table style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
              <thead><tr><Th>Vendor</Th><Th>Description</Th><Th>Amount</Th><Th>Status</Th><Th>Action</Th></tr></thead>
              <tbody>
                {pendingBills.map(b => (
                  <tr key={b._id}>
                    <Td>{b.vendorName}</Td>
                    <Td>{b.description}</Td>
                    <Td>LKR {fmt(b.amount)}</Td>
                    <Td><Badge status={b.isPaid ? 'completed' : 'pending'}>{b.isPaid ? 'Paid' : 'Unpaid'}</Badge></Td>
                    <Td>
                      {!b.isPaid && <button onClick={() => payPendingBill(b._id)} style={{ padding: '5px 10px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Mark as Paid</button>}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <SectionTitle>🔧 Borrowed Items</SectionTitle>
          <Card>
            <FormRow>
              <Input placeholder="Item Name" value={itemForm.itemName} onChange={e => setItemForm({...itemForm, itemName: e.target.value})} />
              <Input placeholder="Borrowed From" value={itemForm.borrowedFrom} onChange={e => setItemForm({...itemForm, borrowedFrom: e.target.value})} />
              <Input placeholder="Taken By" value={itemForm.takenBy} onChange={e => setItemForm({...itemForm, takenBy: e.target.value})} />
              <Input type="number" placeholder="Rental Fee" value={itemForm.rentalFee} onChange={e => setItemForm({...itemForm, rentalFee: e.target.value})} />
              <ActionButton style={{ marginTop: 0 }} onClick={handleCreateItem}>Add Item</ActionButton>
            </FormRow>
            <table style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
              <thead><tr><Th>Item</Th><Th>From</Th><Th>Taken By</Th><Th>Rental</Th><Th>Status</Th><Th>Action</Th></tr></thead>
              <tbody>
                {borrowedItems.map(i => (
                  <tr key={i._id}>
                    <Td>{i.itemName}</Td>
                    <Td>{i.borrowedFrom}</Td>
                    <Td>{i.takenBy}</Td>
                    <Td>LKR {fmt(i.rentalFee)}</Td>
                    <Td><Badge status={i.isReturned ? 'completed' : 'pending'}>{i.isReturned ? 'Returned' : 'Not Returned'}</Badge></Td>
                    <Td>
                      {!i.isReturned && <button onClick={() => returnBorrowedItem(i._id)} style={{ padding: '5px 10px', background: '#15803d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Mark Returned</button>}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <SectionTitle>💸 Public Donations (Till/Box)</SectionTitle>
          <Card>
            <FormRow>
              <Input placeholder="Donor Name (optional)" value={donationForm.donorName} onChange={e => setDonationForm({...donationForm, donorName: e.target.value})} />
              <Input type="number" placeholder="Amount" value={donationForm.amount} onChange={e => setDonationForm({...donationForm, amount: e.target.value})} />
              <ActionButton style={{ marginTop: 0 }} onClick={handleCreateDonation}>Add Donation</ActionButton>
            </FormRow>
            <table style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
              <thead><tr><Th>Donor</Th><Th>Amount</Th><Th>Date</Th></tr></thead>
              <tbody>
                {publicDonations.map(d => (
                  <tr key={d._id}>
                    <Td>{d.donorName || 'Anonymous'}</Td>
                    <Td>LKR {fmt(d.amount)}</Td>
                    <Td>{new Date(d.dateReceived).toLocaleDateString()}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      ) : (
        <>
          {/* Trip / Party Dashboard */}
          <Card>
            <StatGrid>
              <StatItem>
                <StatLabel>Total Actual Expense</StatLabel>
                <StatValue>LKR {fmt(summaryData.totalSpent)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Total Expected Fund</StatLabel>
                <StatValue>LKR {fmt(summaryData.totalExpected)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel style={{ color: summaryData.deficit > 0 ? '#DC2626' : '#15803d' }}>
                  {summaryData.deficit > 0 ? 'Deficit / Overrun' : 'Surplus'}
                </StatLabel>
                <StatValue style={{ color: summaryData.deficit > 0 ? '#DC2626' : '#15803d' }}>
                  LKR {fmt(Math.abs(summaryData.deficit))}
                </StatValue>
              </StatItem>
            </StatGrid>
          </Card>

          <SectionTitle>Participant Breakdown</SectionTitle>
          <Card style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E0E0E0', backgroundColor: '#F9FAFB' }}>
                  <Th>Name</Th>
                  <Th>Target Contribution</Th>
                  <Th>💰 Deposit</Th>
                  <Th>Personal Paid</Th>
                  <Th>Total Paid</Th>
                  <Th>Liability</Th>
                  <Th>Balance</Th>
                </tr>
              </thead>
              <tbody>
                {summaryData.balances && summaryData.balances.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <Td style={{ fontWeight: '600' }}>{b.name}</Td>
                    <Td>LKR {fmt(b.baseFee)}</Td>
                    <Td style={{ color: '#1d4ed8', fontWeight: '600' }}>LKR {fmt(b.initialDeposit)}</Td>
                    <Td>LKR {fmt(b.personalPaid)}</Td>
                    <Td style={{ fontWeight: '600' }}>LKR {fmt(b.totalPaid)}</Td>
                    <Td>LKR {fmt(b.liability)}</Td>
                    <Td style={{ fontWeight: 'bold', color: b.balance > 0 ? '#DC2626' : (b.balance < 0 ? '#15803d' : '#6B7280') }}>
                      {b.balance > 0.01 ? `Owes LKR ${fmt(b.balance)}` : (b.balance < -0.01 ? `Refund LKR ${fmt(Math.abs(b.balance))}` : 'Settled')}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {showPDFModal && (
        <ModalOverlay>
          <ModalContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Configure Report</h3>
              <button onClick={() => setShowPDFModal(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            
            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.financialContributors} onChange={e => setPdfOptions({...pdfOptions, financialContributors: e.target.checked})} />
              Include Financial Contributors List (Members)
            </CheckboxRow>
            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.publicDonations} onChange={e => setPdfOptions({...pdfOptions, publicDonations: e.target.checked})} />
              Include Public Donations List (External/Till money)
            </CheckboxRow>
            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.leftoverAssets} onChange={e => setPdfOptions({...pdfOptions, leftoverAssets: e.target.checked})} />
              Include Leftover/Reusable Assets
            </CheckboxRow>
            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.settledExpenses} onChange={e => setPdfOptions({...pdfOptions, settledExpenses: e.target.checked})} />
              Include Fully Settled Expenses
            </CheckboxRow>

            <ActionButton style={{ width: '100%' }} onClick={generatePDF}>Generate PDF</ActionButton>
          </ModalContent>
        </ModalOverlay>
      )}

    </PageContainer>
  );
}
