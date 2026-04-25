import React, { useState } from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';

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
  const { participants, addParticipant, activeEvent } = useBudget();

  const handleAdd = () => {
    const name = prompt('Enter Attendee Name:');
    if (name) addParticipant(name);
  };

  if (!activeEvent) return null;

  return (
    <Container>
      <AttendeeGrid>
        {participants.map((p, idx) => (
          <AttendeeChip key={p._id}>
            <Avatar color={avatarColors[idx % avatarColors.length]}>
              {p.name.charAt(0)}
            </Avatar>
            <Name>{p.name}</Name>
          </AttendeeChip>
        ))}
      </AttendeeGrid>
      <AddBtn onClick={handleAdd}>
        <span>+</span> Add Participant
      </AddBtn>
    </Container>
  );
}
