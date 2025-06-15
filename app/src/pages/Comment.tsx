// pages/CommentPage.tsx
import CommentForm from '@/components/organisms/CommentForm';

const CommentPage = () => {
  const handleCommentSubmit = (user: string, comment: string) => {
    console.log("送信:", { user, comment });
    // API叩くなど
  };

  const handleCancel = () => {
    console.log("キャンセル");
    // モーダル閉じるなど
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <CommentForm onSubmit={handleCommentSubmit} onCancel={handleCancel} />
    </div>
  );
};

export default CommentPage;
