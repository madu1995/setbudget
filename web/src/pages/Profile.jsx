import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 40px;

  @media (max-width: 600px) {
    padding: 20px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: ${props => props.theme.radius.md};
  padding: 30px;
  box-shadow: ${props => props.theme.shadows.base};
  border: 1px solid ${props => props.theme.colors.border};
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  margin: 0 auto 20px auto;
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.secondary};
  margin-top: 0;
`;

const SubText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
`;

export default function Profile() {
  return (
    <PageContainer>
        <Card>
            <Avatar>SB</Avatar>
            <Title>User Profile</Title>
            <SubText>Manage your account settings, default currencies, and application preferences here in the future.</SubText>
        </Card>
    </PageContainer>
  );
}
