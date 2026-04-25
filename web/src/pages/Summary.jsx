import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
`;

const PlaceholderIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.secondary};
  font-size: 1.8rem;
  margin-bottom: 15px;
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  max-width: 500px;
  line-height: 1.6;
`;

export default function Summary() {
  return (
    <PageContainer>
      <PlaceholderIcon>📊</PlaceholderIcon>
      <Title>Global Summary</Title>
      <Description>
        This page will aggregate spending data across all your events and trips to provide insights, charts, and comprehensive expense breakdowns. Coming soon!
      </Description>
    </PageContainer>
  );
}
