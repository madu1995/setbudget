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

export default function SummaryCard() {
  const { activeEvent, totals } = useBudget();

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
    </BlueCard>
  );
}
