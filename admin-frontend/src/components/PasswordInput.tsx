import { useState, type InputHTMLAttributes } from 'react';

export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return <div className="password-field"><input {...props} type={visible ? 'text' : 'password'} /><button type="button" className={`password-toggle ${visible ? 'visible' : ''}`} onClick={() => setVisible(value => !value)} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} title={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}><span aria-hidden="true">👁</span></button></div>;
}
