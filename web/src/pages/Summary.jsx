import React from 'react';
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

export default function Summary() {
  const { events, activeEvent, selectEvent, settlementReport } = useBudget();

  const fmt = (n) => (n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

  const exportToPDF = () => {
    if (!activeEvent || !settlementReport) return;

    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`Settlement Report: ${activeEvent.name}`, 14, 22);

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

      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text(`Total Event Expense: LKR ${fmt(settlementReport.totalSpent)}`, 14, yPos + 4);
      doc.text(`Total Expected Fund: LKR ${fmt(settlementReport.totalExpected)}`, 14, yPos + 12);
      doc.text(`Deficit/Overrun: LKR ${fmt(settlementReport.deficit)}`, 14, yPos + 20);
      doc.text(`Deficit Share (per-person): LKR ${fmt(settlementReport.deficitShare)}`, 14, yPos + 28);
      yPos += 10;

      // Fund Summary block
      if (settlementReport.fundSummary) {
        const fs = settlementReport.fundSummary;
        yPos += 28;
        doc.setFontSize(14);
        doc.text('Common Fund Summary', 14, yPos);
        doc.setFontSize(11);
        doc.text(`  Total Collected: LKR ${fmt(fs.totalCollected)}`, 14, yPos + 8);
        doc.text(`  Spent from Fund: LKR ${fmt(fs.totalSpentFromFund)}`, 14, yPos + 16);
        doc.text(`  Remaining Balance: LKR ${fmt(fs.remainingBalance)}`, 14, yPos + 24);
        yPos += 30;
      }

      // Balances Table
      const tableColumn = ['Participant', 'Target Contribution', 'Deposit', 'Personal Paid', 'Total Paid', 'Liability', 'Balance'];
      const tableRows = (settlementReport.balances || []).map(b => {
        let balanceText = 'Settled';
        if (b.balance > 0.01) balanceText = `Owes LKR ${fmt(b.balance)}`;
        else if (b.balance < -0.01) balanceText = `Refund LKR ${fmt(Math.abs(b.balance))}`;
        return [
          b.name,
          `LKR ${fmt(b.baseFee)}`,
          `LKR ${fmt(b.initialDeposit)}`,
          `LKR ${fmt(b.personalPaid)}`,
          `LKR ${fmt(b.totalPaid)}`,
          `LKR ${fmt(b.liability)}`,
          balanceText,
        ];
      });

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: yPos + 10 });

      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 80;
      doc.setFontSize(16);
      doc.text('How to Settle', 14, finalY + 15);

      if (settlementReport.transactions && settlementReport.transactions.length > 0) {
        const transRows = settlementReport.transactions.map(t => [
          t.from, t.to, `LKR ${fmt(t.amount)}`
        ]);
        autoTable(doc, {
          head: [['From (Payer)', 'To (Receiver)', 'Amount']],
          body: transRows,
          startY: finalY + 20,
          headStyles: { fillColor: [0, 123, 255] }
        });
      } else {
        doc.setFontSize(12);
        doc.text('All debts are settled! No transactions needed.', 14, finalY + 25);
      }

      doc.save(`${activeEvent.name.replace(/\s+/g, '_')}_Settlement_Report.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('There was an error generating the PDF. Please try again.');
    }
  };

  const fs = settlementReport?.fundSummary;
  const hasFund = fs && fs.totalCollected > 0;

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <Title>Settlement Report</Title>
          <SubTitle>View financial breakdowns and settle debts</SubTitle>
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
        {activeEvent && <ActionButton onClick={exportToPDF}>Download Report (PDF)</ActionButton>}
      </div>

      {!activeEvent || !settlementReport ? (
        <Card style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
          <h3>No event selected.</h3>
          <p>Please select an event from the dropdown above to see the breakdown.</p>
        </Card>
      ) : (
        <>
          {/* Overall Stats */}
          <Card>
            <StatGrid>
              <StatItem>
                <StatLabel>Total Actual Expense</StatLabel>
                <StatValue>LKR {fmt(settlementReport.totalSpent)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Total Expected Fund</StatLabel>
                <StatValue>LKR {fmt(settlementReport.totalExpected)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel style={{ color: settlementReport.deficit > 0 ? '#DC2626' : '#15803d' }}>
                  {settlementReport.deficit > 0 ? 'Deficit / Overrun' : 'Surplus'}
                </StatLabel>
                <StatValue style={{ color: settlementReport.deficit > 0 ? '#DC2626' : '#15803d' }}>
                  LKR {fmt(Math.abs(settlementReport.deficit))}
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Deficit Share</StatLabel>
                <StatValue>LKR {fmt(settlementReport.deficitShare)}</StatValue>
              </StatItem>
            </StatGrid>
          </Card>

          {/* Fund Summary — only visible if any deposits exist */}
          {hasFund && (
            <>
              <SectionTitle>💰 Common Fund Summary</SectionTitle>
              <FundCard>
                <StatGrid>
                  <StatItem>
                    <StatLabel fundColor>Total Collected</StatLabel>
                    <StatValue fundColor>LKR {fmt(fs.totalCollected)}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel fundColor>Spent from Fund</StatLabel>
                    <StatValue fundColor>LKR {fmt(fs.totalSpentFromFund)}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel fundColor>Remaining Balance</StatLabel>
                    <StatValue
                      fundColor
                      style={{ color: fs.remainingBalance >= 0 ? '#15803d' : '#dc2626' }}
                    >
                      LKR {fmt(fs.remainingBalance)}
                    </StatValue>
                  </StatItem>
                </StatGrid>
              </FundCard>
            </>
          )}

          {/* Participant Breakdown */}
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
                {settlementReport.balances.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <Td style={{ fontWeight: '600' }}>{b.name}</Td>
                    <Td>LKR {fmt(b.baseFee)}</Td>
                    <Td style={{ color: '#1d4ed8', fontWeight: '600' }}>
                      LKR {fmt(b.initialDeposit)}
                    </Td>
                    <Td>LKR {fmt(b.personalPaid)}</Td>
                    <Td style={{ fontWeight: '600' }}>LKR {fmt(b.totalPaid)}</Td>
                    <Td>LKR {fmt(b.liability)}</Td>
                    <Td style={{ fontWeight: 'bold', color: b.balance > 0 ? '#DC2626' : (b.balance < 0 ? '#15803d' : '#6B7280') }}>
                      {b.balance > 0.01
                        ? `Owes LKR ${fmt(b.balance)}`
                        : (b.balance < -0.01 ? `Refund LKR ${fmt(Math.abs(b.balance))}` : 'Settled')}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Settlement Transactions */}
          <SectionTitle>How to Settle 🤝</SectionTitle>

          {settlementReport.transactions && settlementReport.transactions.length > 0 ? (
            <TransactionList>
              {settlementReport.transactions.map((t, idx) => (
                <TransactionItem key={idx}>
                  <div style={{ fontSize: '1.1rem' }}>
                    <Payer>{t.from}</Payer> needs to pay <Receiver>{t.to}</Receiver>
                  </div>
                  <Amount>LKR {fmt(t.amount)}</Amount>
                </TransactionItem>
              ))}
            </TransactionList>
          ) : (
            <Card style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
              <h3>All debts are settled!</h3>
              <p>No transactions are needed to settle this event.</p>
            </Card>
          )}
        </>
      )}
    </PageContainer>
  );
}
