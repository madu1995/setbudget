import React from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';

const BlueCard = styled.div`
  background-color: ${props => props.theme.colors.cardBlue};
  color: white;
  border-radius: ${props => props.theme.radius.md};
  padding: 40px 30px;
  box-shadow: ${props => props.theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 24px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.4rem;
  font-weight: 700;
`;

const MetricsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 12px;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const MetricLabel = styled.span`
  font-weight: 500;
  opacity: 0.9;
`;

const MetricValue = styled.span`
  font-weight: 700;
  font-size: 1.2rem;
`;

export default function SummaryCard() {
  const { activeEvent, totals } = useBudget();

  if (!activeEvent) return null;

  return (
    <BlueCard>
      <CardHeader>
        {activeEvent.name} 🌿
      </CardHeader>
      <MetricsContainer>
        <MetricRow>
          <MetricLabel>Total Budget</MetricLabel>
          <MetricValue>LKR {totals.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</MetricValue>
        </MetricRow>
        <MetricRow>
          <MetricLabel>Total Spent</MetricLabel>
          <MetricValue>LKR {totals.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</MetricValue>
        </MetricRow>
        <MetricRow>
          <MetricLabel>Participants</MetricLabel>
          <MetricValue>{totals.participantCount}</MetricValue>
        </MetricRow>
      </MetricsContainer>
    </BlueCard>
  );
}
