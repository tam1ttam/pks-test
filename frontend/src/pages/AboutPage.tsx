import { useEffect } from 'react';

const README_URL = 'https://github.com/tam1ttam/pks-test#readme';

export default function AboutPage() {
  useEffect(() => { window.location.replace(README_URL); }, []);
  return <main className="about-redirect">
    <p>Đang mở README của dự án…</p>
    <a href={README_URL}>Mở README</a>
  </main>;
}
