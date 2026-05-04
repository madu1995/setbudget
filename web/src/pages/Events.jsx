import React, { useState } from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddEventModal from '../components/AddEventModal';
import ManageModeratorsModal from '../components/ManageModeratorsModal';

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
  display: flex;
  flex-direction: column;
  height: 100%;
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

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: absolute;
  right: 24px;
  top: 55px;
`;

const ActionBtn = styled.button`
  background: white;
  border: 2px solid ${props => props.color};
  color: ${props => props.color};
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.color};
    color: white;
  }
`;

export default function Events() {
  const { events, selectEvent, fetchEvents, searchQuery, deleteEvent } = useBudget();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manageModEventId, setManageModEventId] = useState(null);

  const handleManage = (id) => {
      selectEvent(id);
      navigate('/');
  };

  const handleEventAdded = (newEvent) => {
      fetchEvents(); // Refresh the list
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will remove all associated participants and expenses.`)) {
      await deleteEvent(id);
      fetchEvents();
    }
  };

  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <Title style={{ marginBottom: 0 }}>All Events</Title>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: '#007BFF', color: 'white', padding: '10px 20px', 
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            + New Event
          </button>
        )}
      </div>

      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onEventAdded={handleEventAdded} 
      />

      <ManageModeratorsModal 
        isOpen={!!manageModEventId} 
        onClose={() => setManageModEventId(null)} 
        eventId={manageModEventId} 
      />

      {filteredEvents.length === 0 ? (
          <p style={{ color: '#6B7280' }}>
            {searchQuery ? `No events found matching "${searchQuery}"` : "You have not created any events yet."}
          </p>
      ) : (
        <Grid>
            {filteredEvents.map((e) => (
                <EventCard key={e._id} style={{ position: 'relative' }}>
                    <EventName>
                        {e.name}
                        <StatusTag active={e.isActive}>{e.isActive ? 'Active' : 'Archived'}</StatusTag>
                    </EventName>
                    
                    {isAdmin && (
                      <ActionContainer>
                        <ActionBtn color="#007BFF" title="Edit Event" onClick={() => {/* TODO: Implement edit */}}>✎</ActionBtn>
                        <ActionBtn color="#DC2626" title="Delete Event" onClick={() => handleDelete(e._id, e.name)}>🗑</ActionBtn>
                      </ActionContainer>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px' }}>
                      {e.startDate && (
                        <div style={{ color: '#6B7280', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          📅 {new Date(e.startDate).toLocaleDateString()}
                        </div>
                      )}
                      {e.location && (
                        <div style={{ color: '#6B7280', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          📍 {e.location}
                        </div>
                      )}
                      <div style={{ color: '#6B7280', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        👥 {e.participantCount || 0} Participants
                      </div>
                      <div style={{ color: '#1F2937', fontSize: '0.9rem', fontWeight: '600', marginTop: '4px' }}>
                        Budget: LKR {e.totalBudget > 0 ? e.totalBudget.toLocaleString() : 'Not Set'}
                      </div>
                      <div style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '700' }}>
                        Spent: LKR {e.totalSpent ? e.totalSpent.toLocaleString() : '0'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                      <ViewBtn onClick={() => handleManage(e._id)}>Manage Event</ViewBtn>
                      {isAdmin && (
                        <ViewBtn style={{ color: '#DC2626', borderColor: '#DC2626' }} onClick={() => setManageModEventId(e._id)}>
                          Moderators
                        </ViewBtn>
                      )}
                    </div>
                </EventCard>
            ))}
        </Grid>
      )}
    </PageContainer>
  );
}
