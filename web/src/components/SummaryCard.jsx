import React from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';

const BlueCard = styled.div`
  background-color: ${props => props.theme.colors.cardBlue};
  color: white;
  border-radius: ${props => props.theme.radius.md};
  padding: 30px;
  box-shadow: ${props => props.theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 24px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 700;
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatItem = styled.div`
  display: flex;
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
`;

const TableContainer = styled.div`
  margin-top: 20px;
  background-color: white;
  color: #121212;
  border-radius: ${props => props.theme.radius.md};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 15px;
  background-color: #F8F9FA;
  color: #6B7280;
  font-weight: 600;
  border-bottom: 1px solid #E5E7EB;
`;

const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #E5E7EB;
  color: #374151;
`;

const BalanceTd = styled(Td)`
  font-weight: 700;
  color: ${props => props.balance > 0.01 ? '#007BFF' : props.balance < -0.01 ? '#DC2626' : '#6B7280'};
`;

export default function SummaryCard() {
  const { activeEvent, totals, settlementReport } = useBudget();

  if (!activeEvent) return null;

  return (
    <BlueCard>
      <CardHeader>
        {activeEvent.name} 🌿
        <span style={{ fontSize: '0.8rem' }}>▼</span>
      </CardHeader>
      <StatsList>
        <StatItem>Total Budget: LKR {totals.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</StatItem>
        <StatItem>Total Spent: LKR {totals.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</StatItem>
        <StatItem>Participants: {totals.participantCount}</StatItem>
      </StatsList>

      {settlementReport && settlementReport.balances && settlementReport.balances.length > 0 && (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Participant</Th>
                <Th>Total Paid</Th>
                <Th>Share</Th>
                <Th>Balance</Th>
              </tr>
            </thead>
            <tbody>
              {settlementReport.balances.map(b => (
                <tr key={b._id}>
                  <Td>{b.name}</Td>
                  <Td>LKR {b.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Td>
                  <Td>LKR {b.share.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Td>
                  <BalanceTd balance={b.balance}>
                    {b.balance > 0.01 ? `+LKR ${b.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 
                     b.balance < -0.01 ? `Owes LKR ${Math.abs(b.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 
                     'Settled'}
                  </BalanceTd>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </BlueCard>
  );
}
