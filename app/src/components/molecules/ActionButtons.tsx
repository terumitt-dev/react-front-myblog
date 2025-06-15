// TOPに戻るリンクボタン（react-router-dom の Link）
import { Link } from 'react-router-dom';
import Button from '@/components/atoms/Button';

const BackToTopButton = () => (
  <Link to="/">
    <Button label="TOPに戻る" />
  </Link>
);

// コメント確定ボタン
const SubmitCommentButton = ({ onSubmit }: { onSubmit: () => void }) => (
  <Button label="コメントを確定する" onClick={onSubmit} variant="primary" />
);

// ログアウトボタン
const LogoutButton = ({ onLogout }: { onLogout: () => void }) => (
  <Button label="ログアウト" onClick={onLogout} variant="danger" />
);
