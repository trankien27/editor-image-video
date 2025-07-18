// src/pages/ComingSoonPage.tsx
import React from 'react';
import '../style/ComingSoonPage.css'

interface ComingSoonPageProps {
  title: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title }) => {
  return (
    <div className="coming-soon-page" style={{ textAlign: 'center', marginTop: 50 }}>
      <h2>🚧 {title} – Tính năng đang phát triển</h2>
      <p>Chúng tôi đang hoàn thiện tính năng này. Hãy quay lại sau!</p>
    </div>
  );
};

export default ComingSoonPage;