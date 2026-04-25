import React from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';
import { useNavigate } from 'react-router-dom';
import AddEventModal from '../components/AddEventModal';

const PageContainer = styled.div`
  padding: 40px;

  @media (max-width: 600px) {
    padding: 20px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 30px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const EventCard = styled.div`
  background: white;
  border-radius: ${props => props.theme.radius.md};
  padding: 24px;
  box-shadow: ${props => props.theme.shadows.base};
  border: 1px solid ${props => props.theme.colors.border};
`;

const EventName = styled.h3`
  margin: 0 0 10px 0;
  color: ${props => props.theme.colors.primary};
  display: flex;
  justify-content: space-between;
`;

const StatusTag = styled.span`
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 50px;
  background: ${props => props.active ? '#EBF5FF' : '#F1F5F9'};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-weight: 600;
`;

const ViewBtn = styled.button`
  background: white;
  border: 1px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  padding: 8px 16px;
  border-radius: ${props => props.theme.radius.sm};
  width: 100%;
  margin-top: 15px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #F0F7FF;
  }
`;

export default function Events() {
  const { events, selectEvent, fetchEvents } = useBudget();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleManage = (id) => {
      selectEvent(id);
      navigate('/');
  };

  const handleEventAdded = (newEvent) => {
      fetchEvents(); // Refresh the list
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <Title style={{ marginBottom: 0 }}>All Events</Title>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            backgroundColor: '#007BFF', color: 'white', padding: '10px 20px', 
            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          + New Event
        </button>
      </div>

      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onEventAdded={handleEventAdded} 
      />

      {events.length === 0 ? (
          <p style={{ color: '#6B7280' }}>You have not created any events yet.</p>
      ) : (
        <Grid>
            {events.map((e) => (
                <EventCard key={e._id}>
                    <EventName>
                        {e.name}
                        <StatusTag active={e.isActive}>{e.isActive ? 'Active' : 'Archived'}</StatusTag>
                    </EventName>
                    <div style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '8px' }}>
                        Budget: LKR {e.totalBudget > 0 ? e.totalBudget.toLocaleString() : 'Not Set'}
                    </div>
                    <ViewBtn onClick={() => handleManage(e._id)}>Manage Event</ViewBtn>
                </EventCard>
            ))}
        </Grid>
      )}
    </PageContainer>
  );
}
