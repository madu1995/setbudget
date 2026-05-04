import React, { useState } from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';
import AddParticipantModal from './AddParticipantModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AttendeeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
`;

const AttendeeChip = styled.div`
  background-color: ${props => props.theme.colors.card};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.round};
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: ${props => props.theme.shadows.base};
`;

const Avatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color || '#E0E0E0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Name = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  flex: 1;
`;

const BalanceTag = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${props => props.status === 'owed' ? '#EBF5FF' : props.status === 'owes' ? '#FEE2E2' : '#F3F4F6'};
  color: ${props => props.status === 'owed' ? '#007BFF' : props.status === 'owes' ? '#DC2626' : '#6B7280'};
`;

const ModeTag = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${props => props.isFixed ? '#FFF3CD' : '#E2E3E5'};
  color: ${props => props.isFixed ? '#856404' : '#383D41'};
  margin-top: 4px;
`;

const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
`;

const EditBtn = styled.button`
  background: transparent;
  border: none;
  color: #6B7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #F3F4F6;
    color: #111827;
  }
`;

const AddBtn = styled.button`
  background-color: transparent;
  border: 1px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radius.round};
  padding: 10px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover { background-color: #F0F7FF; }
`;

const avatarColors = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#917FB3', '#F29727'];

export default function ParticipantList() {
  const { participants, addParticipant, updateParticipant, activeEvent, settlementReport } = useBudget();
  const { isModerator } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participantToEdit, setParticipantToEdit] = useState(null);

  const handleAddParticipant = async (name, phone, paymentMode, fixedAmount) => {
    await addParticipant(name, phone, paymentMode, fixedAmount);
  };

  const handleUpdateParticipant = async (id, data) => {
    await updateParticipant(id, data);
  };

  const handleEditClick = (p) => {
    setParticipantToEdit(p);
    setIsModalOpen(true);
  };

  if (!activeEvent) return null;

  return (
    <Container>
      <AttendeeGrid>
        {participants.map((p, idx) => {
          // Find balance from settlement report
          const pReport = settlementReport?.balances?.find(b => b._id === p._id);
          let balanceTag = null;
          
          if (pReport) {
            if (pReport.balance > 0.01) {
              balanceTag = <BalanceTag status="owed">+LKR {pReport.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</BalanceTag>;
            } else if (pReport.balance < -0.01) {
              balanceTag = <BalanceTag status="owes">Owes LKR {Math.abs(pReport.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}</BalanceTag>;
            } else {
              balanceTag = <BalanceTag status="settled">Settled</BalanceTag>;
            }
          }

          return (
            <AttendeeChip key={p._id}>
              <Avatar color={avatarColors[idx % avatarColors.length]}>
                {p.name.charAt(0)}
              </Avatar>
              <DetailsWrapper>
                <Name>{p.name}</Name>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {balanceTag}
                </div>
              </DetailsWrapper>
              
              {isModerator(activeEvent) && (
                <EditBtn onClick={() => handleEditClick(p)}>✎</EditBtn>
              )}
            </AttendeeChip>
          );
        })}
      </AttendeeGrid>
      
      {isModerator(activeEvent) && (
        <>
          <AddBtn onClick={() => { setParticipantToEdit(null); setIsModalOpen(true); }}>
            <span>+</span> Add Participant
          </AddBtn>

          <AddParticipantModal 
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); setParticipantToEdit(null); }} 
            onParticipantAdded={handleAddParticipant} 
            onParticipantUpdated={handleUpdateParticipant}
            participantToEdit={participantToEdit}
          />
        </>
      )}
    </Container>
  );
}
