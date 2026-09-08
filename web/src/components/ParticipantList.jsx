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
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
`;

const AttendeeChip = styled.div`
  background-color: ${props => props.theme.colors.card};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md || '12px'};
  padding: 10px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  box-shadow: ${props => props.theme.shadows.base};
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${props => props.color || '#E0E0E0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: 2px;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Name = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  flex: 1;
`;

const BalanceTag = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${props => props.status === 'refund' ? '#D1FAE5' : props.status === 'owes' ? '#FEE2E2' : '#F3F4F6'};
  color: ${props => props.status === 'refund' ? '#10B981' : props.status === 'owes' ? '#DC2626' : '#6B7280'};
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
  min-width: 0;
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

  const handleAddParticipant = async (name, phone, paymentMode, fixedAmount, initialDeposit, directContribution, materialsContributed) => {
    await addParticipant(name, phone, paymentMode, fixedAmount, initialDeposit, directContribution, materialsContributed);
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
            if (pReport.balance < -0.01) {
              balanceTag = <BalanceTag status="refund">Refund LKR {Math.abs(pReport.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}</BalanceTag>;
            } else if (pReport.balance > 0.01) {
              balanceTag = <BalanceTag status="owes">Owes LKR {pReport.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</BalanceTag>;
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
                {p.initialDeposit > 0 && (
                  <div style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: '700' }}>
                    💰 Deposit: LKR {p.initialDeposit.toLocaleString()}
                  </div>
                )}
                {p.directContribution > 0 && (
                  <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: '700' }}>
                    🤝 Contribution: LKR {p.directContribution.toLocaleString()}
                  </div>
                )}
                {p.materialsContributed && p.materialsContributed.length > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#6d28d9', marginTop: '2px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '2px' }}>📦 Materials:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {p.materialsContributed.map((m, mIdx) => (
                        <span 
                          key={mIdx} 
                          style={{ 
                            background: '#f5f3ff', 
                            border: '1px solid #ddd6fe', 
                            borderRadius: '4px', 
                            padding: '1px 5px', 
                            fontSize: '0.65rem' 
                          }}
                        >
                          {m.itemName}{m.quantity ? ` (${m.quantity})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {balanceTag}
                  {p.paymentMode === 'Fixed Amount' && (
                    <ModeTag isFixed>Fixed</ModeTag>
                  )}
                </div>
              </DetailsWrapper>
              
              {isModerator(activeEvent) && (
                <EditBtn onClick={() => handleEditClick(p)} title="Edit Participant">✎</EditBtn>
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
