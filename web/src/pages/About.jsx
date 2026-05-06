import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageCircle, ChevronLeft, ShieldCheck, PieChart, Zap, Layout } from 'lucide-react';

const AboutContainer = styled.div`
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 20px;
  }
`;



const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const AppName = styled.h1`
  font-size: 2.5rem;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 8px;
`;

const Tagline = styled.p`
  font-size: 1.1rem;
  color: #6B7280;
  margin-bottom: 12px;
`;

const VersionBadge = styled.span`
  background: #EBF5FF;
  color: #007BFF;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
`;

const DevCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: ${props => props.theme.shadows.card};
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  gap: 40px;
  align-items: center;
  margin-bottom: 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 30px;
  }
`;

const DevImage = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
`;

const DevInfo = styled.div`
  flex: 1;
`;

const DevName = styled.h2`
  font-size: 1.75rem;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 12px;
`;

const DevBio = styled.p`
  color: #4B5563;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    justify-items: center;
  }
`;

const ContactButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  width: 100%;
  max-width: 250px;

  &.whatsapp {
    background-color: #25D366;
    color: white;
    &:hover { background-color: #128C7E; }
  }

  &.facebook {
    background-color: #1877F2;
    color: white;
    &:hover { background-color: #0d65d9; }
  }

  &.email {
    background-color: #F3F4F6;
    color: #374151;
    &:hover { background-color: #E5E7EB; }
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
`;

const FeatureCard = styled.div`
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: #F0F7FF;
  color: #007BFF;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.secondary};
`;

const FeatureDesc = styled.p`
  font-size: 0.9rem;
  color: #6B7280;
  line-height: 1.5;
`;

export default function About() {
  const navigate = useNavigate();

  return (
    <AboutContainer>
      <HeaderSection>
        <AppName>Set Budget</AppName>
        <Tagline>Simplify group expenses with fairness and transparency.</Tagline>
        <VersionBadge>v1.0.0</VersionBadge>
      </HeaderSection>

      <DevCard>
        <DevImage src="/developer-photo.png" alt="A. Thilina R Madushanka" />
        <DevInfo>
          <DevName>A. Thilina R Madushanka</DevName>
          <DevBio>
            A passionate developer dedicated to building practical solutions for everyday problems. 
            Focused on creating seamless, user-centric experiences that bring clarity to complex tasks.
          </DevBio>
          <ContactGrid>
            <ContactButton href="https://wa.me/94711344010" target="_blank" className="whatsapp">
              <MessageCircle size={18} /> WhatsApp Me
            </ContactButton>
            <ContactButton href="https://www.facebook.com/share/1BpCsxz9nK/" target="_blank" className="facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              Follow on Facebook
            </ContactButton>
            <ContactButton href="mailto:thilina.r.madushanka@gmail.com" className="email">
              <Mail size={18} /> Email Me
            </ContactButton>
          </ContactGrid>
        </DevInfo>
      </DevCard>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#121212' }}>Key Features</h2>
      <FeatureGrid>
        <FeatureCard>
          <IconWrapper><PieChart size={24} /></IconWrapper>
          <FeatureTitle>Mixed Splitting Engine</FeatureTitle>
          <FeatureDesc>Support for "Full Share" payers and "Fixed Amount" payers (e.g., non-drinkers or guests) for ultimate fairness.</FeatureDesc>
        </FeatureCard>
        
        <FeatureCard>
          <IconWrapper><ShieldCheck size={24} /></IconWrapper>
          <FeatureTitle>Role-Based Management</FeatureTitle>
          <FeatureDesc>Secure Admin and Moderator controls to ensure event data is managed by the right people.</FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <IconWrapper><Zap size={24} /></IconWrapper>
          <FeatureTitle>Real-time Settlements</FeatureTitle>
          <FeatureDesc>Instant calculation of who owes whom, generated automatically as you add expenses.</FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <IconWrapper><Layout size={24} /></IconWrapper>
          <FeatureTitle>Modern Interface</FeatureTitle>
          <FeatureDesc>A clean, dark-themed UI designed for maximum readability and a premium look and feel.</FeatureDesc>
        </FeatureCard>
      </FeatureGrid>

      <div style={{ marginTop: '60px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>
        &copy; {new Date().getFullYear()} Set Budget. All rights reserved.
      </div>
    </AboutContainer>
  );
}
