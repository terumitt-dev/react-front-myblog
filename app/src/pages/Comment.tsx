// pages/CommentPage.tsx
import Layout from '@/components/layouts/Layout'
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
    <Layout>
      <div className="max-w-xl mx-auto mt-10">
        <CommentForm onSubmit={handleCommentSubmit} onCancel={handleCancel} />
      </div>
    </Layout>
  );
};

export default CommentPage;
