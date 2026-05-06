import React from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ... (styled components remain the same until exportToPDF)

const PageContainer = styled.div`
  padding: 40px;

  @media (max-width: 600px) {
    padding: 20px;
  }
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

const Payer = styled.span`
  font-weight: 700;
  color: #DC2626;
`;

const Receiver = styled.span`
  font-weight: 700;
  color: #007BFF;
`;

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

  &:hover {
    background-color: #0056b3;
  }
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

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

export default function Summary() {
  const { events, activeEvent, selectEvent, settlementReport } = useBudget();

  const exportToPDF = () => {
    if (!activeEvent || !settlementReport) return;

    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text(`Settlement Report: ${activeEvent.name}`, 14, 22);
      
      // Date and Location
      doc.setFontSize(10);
      doc.setTextColor(100);
      let yPos = 28;
      
      if (activeEvent.startDate) {
        const dateStr = new Date(activeEvent.startDate).toLocaleDateString() + 
                        (activeEvent.endDate ? ` - ${new Date(activeEvent.endDate).toLocaleDateString()}` : '');
        doc.text(`Date: ${dateStr}`, 14, yPos);
        yPos += 6;
      }
      
      if (activeEvent.location) {
        doc.text(`Location: ${activeEvent.location}`, 14, yPos);
        yPos += 6;
      }
      
      // High level stats
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text(`Total Event Expense: LKR ${settlementReport.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 14, yPos + 4);
      doc.text(`Per-Person Share: LKR ${settlementReport.share.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 14, yPos + 12);

      // Balances Table
      const tableColumn = ["Participant", "Mode", "Total Paid", "Share", "Balance"];
      const tableRows = [];

      if (settlementReport.balances) {
        settlementReport.balances.forEach(b => {
          let balanceText = "Settled";
          if (b.balance > 0.01) balanceText = `+LKR ${b.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
          else if (b.balance < -0.01) balanceText = `Owes LKR ${Math.abs(b.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
          
          const rowData = [
            b.name,
            b.paymentMode === 'Fixed Amount' ? `Fixed (LKR ${b.fixedAmount})` : 'Full',
            `LKR ${b.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            `LKR ${b.share.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            balanceText
          ];
          tableRows.push(rowData);
        });
      }

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos + 20,
      });

      // Transactions Section
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 50;
      doc.setFontSize(16);
      doc.text("How to Settle", 14, finalY + 15);

      if (settlementReport.transactions && settlementReport.transactions.length > 0) {
        const transColumn = ["From (Payer)", "To (Receiver)", "Amount"];
        const transRows = [];

        settlementReport.transactions.forEach(t => {
          transRows.push([
            t.from,
            t.to,
            `LKR ${t.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
          ]);
        });

        autoTable(doc, {
          head: [transColumn],
          body: transRows,
          startY: finalY + 20,
          headStyles: { fillColor: [0, 123, 255] } // Primary blue
        });
      } else {
        doc.setFontSize(12);
        doc.text("All debts are settled! No transactions needed.", 14, finalY + 25);
      }

      doc.save(`${activeEvent.name.replace(/\s+/g, '_')}_Settlement_Report.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("There was an error generating the PDF. Please try again.");
    }
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <Title>Settlement Report</Title>
          <SubTitle>View financial breakdowns and settle debts</SubTitle>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: '600' }}>Select Event</label>
            <Select 
              value={activeEvent?._id || ''} 
              onChange={(e) => selectEvent(e.target.value)}
            >
              <option value="" disabled>-- Select an Event --</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
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
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Total Event Expense</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LKR {settlementReport.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Standard Share (Full)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LKR {settlementReport.share.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </div>
          </Card>
          
          <SectionTitle>Participant Breakdown</SectionTitle>
          <Card style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Mode</th>
                  <th style={{ padding: '12px' }}>Paid</th>
                  <th style={{ padding: '12px' }}>Assigned Share</th>
                  <th style={{ padding: '12px' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {settlementReport.balances.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{b.name}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        backgroundColor: b.paymentMode === 'Fixed Amount' ? '#FFF3CD' : '#E2E3E5',
                        color: b.paymentMode === 'Fixed Amount' ? '#856404' : '#383D41',
                        fontWeight: 'bold'
                      }}>
                        {b.paymentMode === 'Fixed Amount' ? 'Fixed' : 'Full'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>LKR {b.totalPaid.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>LKR {b.share.toLocaleString()}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: b.balance >= 0 ? '#007BFF' : '#DC2626' }}>
                      {b.balance >= 0 ? `+LKR ${b.balance.toLocaleString()}` : `-LKR ${Math.abs(b.balance).toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <SectionTitle>How to Settle 🤝</SectionTitle>
          
          {settlementReport.transactions && settlementReport.transactions.length > 0 ? (
            <TransactionList>
              {settlementReport.transactions.map((t, idx) => (
                <TransactionItem key={idx}>
                  <div style={{ fontSize: '1.1rem' }}>
                    <Payer>{t.from}</Payer> needs to pay <Receiver>{t.to}</Receiver>
                  </div>
                  <Amount>LKR {t.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Amount>
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
