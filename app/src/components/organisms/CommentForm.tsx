// src/components/organisms/CommentForm.tsx
import { useState, useId } from "react";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import CommentButtons from "@/components/molecules/CommentButtons";

type Props = {
  onSubmit: (userName: string, comment: string) => void;
  onCancel: () => void;
};

const CommentForm = ({ onSubmit, onCancel }: Props) => {
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");

  const userNameId = useId();
  const commentId = useId();

  const handleSubmit = () => {
    if (userName.trim() && comment.trim()) {
      onSubmit(userName, comment);
      setUserName("");
      setComment("");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        コメントを投稿
      </h3>
      <Input
        id={`username-${userNameId}`}
        label="ユーザー名"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="ユーザ名"
      />
      <Textarea
        id={`comment-${commentId}`}
        label="コメント"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="コメントを入力"
      />
      <CommentButtons onSubmit={handleSubmit} onCancel={onCancel} />
    </div>
  );
};

export default CommentForm;
