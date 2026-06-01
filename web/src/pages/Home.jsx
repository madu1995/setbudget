import React from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';
import SummaryCard from '../components/SummaryCard';
import ParticipantList from '../components/ParticipantList';
import ExpenseForm from '../components/ExpenseForm';

const DashboardArea = styled.div`
  padding: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;

  @media (max-width: 600px) {
    padding: 20px;
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: ${props => props.theme.colors.secondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default function Home() {
  const { activeEvent, totals, loading } = useBudget();
  const { isModerator } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', padding: '0 20px' }}>
        <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #007BFF', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2 style={{ color: '#111827' }}>Waking up server...</h2>
        <p style={{ color: '#6B7280' }}>Please wait a moment while we load your data. This can take a few seconds.</p>
      </div>
    );
  }

  if (!activeEvent) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: '#6c757d', padding: '0 20px' }}>
        <h2>No active events selected.</h2>
        <p>Please create or select an event using the sidebar to manage participants and expenses.</p>
      </div>
    );
  }

  return (
    <DashboardArea>
      <div>
        <SectionTitle>Event Summary</SectionTitle>
        <SummaryCard />
        <SectionTitle>Attendees ({totals.participantCount})</SectionTitle>
        <ParticipantList />
      </div>
      
      {isModerator(activeEvent) && (
        <div>
          <SectionTitle>Add Expense</SectionTitle>
          <ExpenseForm mode="add" />
        </div>
      )}

      <div>
        <SectionTitle>Recent Expenses</SectionTitle>
        <ExpenseForm mode="list" />
      </div>
    </DashboardArea>
  );
}
