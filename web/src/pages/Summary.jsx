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
    participants, expenses,
    tasks, pendingBills, borrowedItems, publicDonations,
    updateTaskStatus, payPendingBill, returnBorrowedItem,
    addTask, addPendingBill, addBorrowedItem, addPublicDonation
  } = useBudget();

  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    memberContributions: true,
    publicDonations: true,
    shopBills: true,
    borrowedItems: true,
    tasks: true,
    leftoverAssets: true,
    generalExpenses: true
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
      const reportTitle = activeEvent.eventType === 'community_project' ? 'Project Financial Report' : 'Event Settlement Report';
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.text(`${reportTitle}: ${activeEvent.name}`, 14, 20);

      // Sub-details
      doc.setFontSize(9);
      doc.setTextColor(108, 117, 125);
      let yPos = 26;

      if (activeEvent.startDate) {
        const dateStr = new Date(activeEvent.startDate).toLocaleDateString() +
          (activeEvent.endDate ? ` - ${new Date(activeEvent.endDate).toLocaleDateString()}` : '');
        doc.text(`Event Date: ${dateStr}`, 14, yPos);
        yPos += 5;
      }
      if (activeEvent.location) {
        doc.text(`Location: ${activeEvent.location}`, 14, yPos);
        yPos += 5;
      }
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yPos);
      yPos += 8;

      const checkAddPage = (neededSpace = 25) => {
        if (yPos + neededSpace > 280) {
          doc.addPage();
          yPos = 20;
        }
      };

      if (activeEvent.eventType === 'community_project') {
        const memberContribTotal = participants.reduce((acc, p) => acc + (p.directContribution || 0), 0);
        const publicDonationsTotal = publicDonations.reduce((acc, pd) => acc + (pd.amount || 0), 0);
        const totalIncome = memberContribTotal + publicDonationsTotal;
        const totalExpenses = summaryData?.totalExpenses !== undefined ? summaryData.totalExpenses : expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
        const netBalance = totalIncome - totalExpenses;

        // Financial Summary Box / Header
        checkAddPage(45);
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('Financial Summary', 14, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(`* Member Contributions Total: LKR ${fmt(memberContribTotal)}`, 18, yPos); yPos += 5;
        doc.text(`* Public Donations Total: LKR ${fmt(publicDonationsTotal)}`, 18, yPos); yPos += 5;

        doc.setFont(undefined, 'bold');
        doc.setTextColor(21, 128, 61);
        doc.text(`Total Income: LKR ${fmt(totalIncome)}`, 18, yPos); yPos += 6;

        doc.setFont(undefined, 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(`Total Expenses (Expenses + Paid Bills + Rental Fees): LKR ${fmt(totalExpenses)}`, 18, yPos); yPos += 6;

        doc.setFont(undefined, 'bold');
        if (netBalance >= 0) {
          doc.setTextColor(21, 128, 61);
        } else {
          doc.setTextColor(220, 38, 38);
        }
        doc.text(`Net Balance: LKR ${fmt(netBalance)}`, 18, yPos);
        yPos += 10;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0);

        // 1. Member Contributions Table
        if (pdfOptions.memberContributions && participants.length > 0) {
          checkAddPage(30);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text('Member Contributions (Participants)', 14, yPos);
          yPos += 4;
          doc.setFont(undefined, 'normal');

          const memberRows = participants.map(p => {
            const materialsStr = p.materialsContributed && p.materialsContributed.length > 0
              ? p.materialsContributed.map(m => `${m.itemName}${m.quantity ? ` (${m.quantity})` : ''}`).join(', ')
              : 'None';
            return [
              p.name,
              p.directContribution > 0 ? `LKR ${fmt(p.directContribution)}` : 'LKR 0',
              materialsStr
            ];
          });

          autoTable(doc, {
            head: [['Member Name', 'Direct Cash Contribution', 'Materials Contributed']],
            body: memberRows,
            startY: yPos,
            theme: 'striped',
            headStyles: { fillColor: [21, 128, 61], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9 }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }

        // 2. Public Donations Table
        if (pdfOptions.publicDonations && publicDonations.length > 0) {
          checkAddPage(30);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text('Public Donations (External / Till / Box)', 14, yPos);
          yPos += 4;
          doc.setFont(undefined, 'normal');

          const donationRows = publicDonations.map(d => [
            d.donorName || 'Anonymous',
            `LKR ${fmt(d.amount)}`,
            d.dateReceived ? new Date(d.dateReceived).toLocaleDateString() : 'N/A'
          ]);

          autoTable(doc, {
            head: [['Donor Name', 'Amount', 'Date Received']],
            body: donationRows,
            startY: yPos,
            theme: 'striped',
            headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9 }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }

        // 3. Shop Bills Table
        if (pdfOptions.shopBills && pendingBills.length > 0) {
          checkAddPage(30);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text('Shop Bills (Vendor Details & Status)', 14, yPos);
          yPos += 4;
          doc.setFont(undefined, 'normal');

          const billRows = pendingBills.map(b => [
            b.vendorName,
            b.description || '-',
            `LKR ${fmt(b.amount)}`,
            b.isPaid ? 'Paid' : 'Pending'
          ]);

          autoTable(doc, {
            head: [['Vendor Name', 'Description', 'Amount', 'Settlement Status']],
            body: billRows,
            startY: yPos,
            theme: 'striped',
            headStyles: { fillColor: [217, 119, 6], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9 }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }

        // 4. Borrowed Items Table
        if (pdfOptions.borrowedItems && borrowedItems.length > 0) {
          checkAddPage(30);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text('Borrowed Items & Rental Fees', 14, yPos);
          yPos += 4;
          doc.setFont(undefined, 'normal');

          const itemRows = borrowedItems.map(i => [
            i.itemName,
            i.borrowedFrom || '-',
            i.takenBy || '-',
            i.rentalFee > 0 ? `LKR ${fmt(i.rentalFee)}` : 'Free / No Fee',
            i.isReturned ? 'Returned' : 'Not Returned'
          ]);

          autoTable(doc, {
            head: [['Item Name', 'Lender / Borrowed From', 'Taken By', 'Rental Fee', 'Status']],
            body: itemRows,
            startY: yPos,
            theme: 'striped',
            headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9 }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }

        // 5. Task Management Table
        if (pdfOptions.tasks && tasks.length > 0) {
          checkAddPage(30);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text('Task Management Log', 14, yPos);
          yPos += 4;
          doc.setFont(undefined, 'normal');

          const taskRows = tasks.map(t => [
            t.taskName,
            t.assignedLead || 'Unassigned',
            (t.status || 'pending').replace('_', ' ').toUpperCase()
          ]);

          autoTable(doc, {
            head: [['Task Name', 'Assigned Lead', 'Status']],
            body: taskRows,
            startY: yPos,
            theme: 'striped',
            headStyles: { fillColor: [55, 65, 81], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9 }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }

        // 6. Leftover / Reusable Assets Table
        if (pdfOptions.leftoverAssets) {
          const materialRows = [];
          participants.forEach(p => {
            if (p.materialsContributed && p.materialsContributed.length > 0) {
              p.materialsContributed.forEach(m => {
                materialRows.push([m.itemName, p.name, m.quantity || '-', m.notes || '-']);
              });
            }
          });

          if (materialRows.length > 0) {
            checkAddPage(30);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(17, 24, 39);
            doc.text('Leftover / Reusable Materials & Assets', 14, yPos);
            yPos += 4;
            doc.setFont(undefined, 'normal');

            autoTable(doc, {
              head: [['Item Name', 'Contributor / Source', 'Quantity', 'Notes']],
              body: materialRows,
              startY: yPos,
              theme: 'striped',
              headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold' },
              styles: { fontSize: 9 }
            });
            yPos = doc.lastAutoTable.finalY + 10;
          }
        }

        // 7. General Expenses Log Table
        if (pdfOptions.generalExpenses && expenses.length > 0) {
          checkAddPage(30);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text('General Expenses Log', 14, yPos);
          yPos += 4;
          doc.setFont(undefined, 'normal');

          const expenseRows = expenses.map(e => {
            const payer = e.paidBy === 'FUND'
              ? 'Common Fund'
              : (participants.find(p => p._id === e.paidBy)?.name || e.paidBy || '-');
            return [
              e.description,
              payer,
              `LKR ${fmt(e.amount)}`,
              e.date ? new Date(e.date).toLocaleDateString() : 'N/A'
            ];
          });

          autoTable(doc, {
            head: [['Description', 'Paid By', 'Amount', 'Date']],
            body: expenseRows,
            startY: yPos,
            theme: 'striped',
            headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9 }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }

      } else {
        // Standard Trip/Party Mode PDF Generation
        checkAddPage(40);
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('Financial Summary', 14, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(`Total Event Expense: LKR ${fmt(summaryData.totalSpent)}`, 18, yPos); yPos += 5;
        doc.text(`Total Expected Fund: LKR ${fmt(summaryData.totalExpected)}`, 18, yPos); yPos += 5;
        doc.text(`Deficit/Overrun: LKR ${fmt(summaryData.deficit)}`, 18, yPos); yPos += 5;
        doc.text(`Deficit Share (per-person): LKR ${fmt(summaryData.deficitShare)}`, 18, yPos); yPos += 10;

        // Balances Table
        if (pdfOptions.memberContributions) {
          checkAddPage(30);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text('Participant Balances & Settlement Breakdown', 14, yPos);
          yPos += 4;
          doc.setFont(undefined, 'normal');

          const tableColumn = ['Participant', 'Target', 'Deposit', 'Paid', 'Liability', 'Balance'];
          const tableRows = (summaryData.balances || []).map(b => {
            let balanceText = 'Settled';
            if (b.balance > 0.01) balanceText = `Owes LKR ${fmt(b.balance)}`;
            else if (b.balance < -0.01) balanceText = `Refund LKR ${fmt(Math.abs(b.balance))}`;
            return [b.name, `LKR ${fmt(b.baseFee)}`, `LKR ${fmt(b.initialDeposit)}`, `LKR ${fmt(b.totalPaid)}`, `LKR ${fmt(b.liability)}`, balanceText];
          });
          autoTable(doc, { head: [tableColumn], body: tableRows, startY: yPos, theme: 'striped' });
          yPos = doc.lastAutoTable.finalY + 10;
        }

        // General Expenses Table
        if (pdfOptions.generalExpenses && expenses.length > 0) {
          checkAddPage(30);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text('General Expenses Log', 14, yPos);
          yPos += 4;
          doc.setFont(undefined, 'normal');

          const expenseRows = expenses.map(e => {
            const payer = e.paidBy === 'FUND'
              ? 'Common Fund'
              : (participants.find(p => p._id === e.paidBy)?.name || e.paidBy || '-');
            return [
              e.description,
              payer,
              `LKR ${fmt(e.amount)}`,
              e.date ? new Date(e.date).toLocaleDateString() : 'N/A'
            ];
          });

          autoTable(doc, {
            head: [['Description', 'Paid By', 'Amount', 'Date']],
            body: expenseRows,
            startY: yPos,
            theme: 'striped',
            headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9 }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }
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
        <ModalOverlay onClick={() => setShowPDFModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Configure PDF Report</h3>
              <button onClick={() => setShowPDFModal(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '16px' }}>
              Select the sections to include in the generated PDF report:
            </p>

            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.memberContributions} onChange={e => setPdfOptions({...pdfOptions, memberContributions: e.target.checked})} />
              Include Member Contributions (Participants)
            </CheckboxRow>
            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.publicDonations} onChange={e => setPdfOptions({...pdfOptions, publicDonations: e.target.checked})} />
              Include Public Donations (External / Till / Box)
            </CheckboxRow>
            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.shopBills} onChange={e => setPdfOptions({...pdfOptions, shopBills: e.target.checked})} />
              Include Shop Bills (Vendor details & Status)
            </CheckboxRow>
            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.borrowedItems} onChange={e => setPdfOptions({...pdfOptions, borrowedItems: e.target.checked})} />
              Include Borrowed Items & Rental Fees
            </CheckboxRow>
            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.tasks} onChange={e => setPdfOptions({...pdfOptions, tasks: e.target.checked})} />
              Include Task Management Log
            </CheckboxRow>
            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.leftoverAssets} onChange={e => setPdfOptions({...pdfOptions, leftoverAssets: e.target.checked})} />
              Include Leftover / Reusable Assets
            </CheckboxRow>
            <CheckboxRow>
              <input type="checkbox" checked={pdfOptions.generalExpenses} onChange={e => setPdfOptions({...pdfOptions, generalExpenses: e.target.checked})} />
              Include General Expenses Log
            </CheckboxRow>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <ActionButton style={{ flex: 1, marginTop: 0 }} onClick={generatePDF}>Generate PDF</ActionButton>
              <button 
                onClick={() => setShowPDFModal(false)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #4B5563', color: '#E5E7EB', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

    </PageContainer>
  );
}
