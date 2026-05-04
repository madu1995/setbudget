import React from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';

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

export default function Summary() {
  const { activeEvent, settlementReport } = useBudget();

  if (!activeEvent || !settlementReport) {
    return (
      <PageContainer>
        <Title>Settlement Report</Title>
        <SubTitle>Select an active event from the sidebar to view the report.</SubTitle>
      </PageContainer>
    );
  }

  const { transactions, balances, totalSpent, share } = settlementReport;

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title>Settlement Report</Title>
          <SubTitle>Financial breakdown for {activeEvent.name}</SubTitle>
        </div>
        <ActionButton>Download Report (PDF)</ActionButton>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Total Event Expense</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LKR {totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Per-Person Share</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LKR {share.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      </Card>

      <SectionTitle>How to Settle 🤝</SectionTitle>
      
      {transactions && transactions.length > 0 ? (
        <TransactionList>
          {transactions.map((t, idx) => (
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

    </PageContainer>
  );
}
