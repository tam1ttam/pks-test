import { useId, useState, type InputHTMLAttributes } from 'react';
export default function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId(); const password = props.type === 'password'; const [visible, setVisible] = useState(false);
  return <div className="field"><label htmlFor={id}>{label}</label><div className={password ? 'password-field' : undefined}><input id={id} {...props} type={password && visible ? 'text' : props.type} />{password && <button type="button" className={`password-toggle ${visible ? 'visible' : ''}`} onClick={() => setVisible(value => !value)} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} title={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}><span aria-hidden="true">👁</span></button>}</div></div>;
}
