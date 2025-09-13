// src/components/organisms/CommentForm.tsx
import { useState, useId } from "react";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import CommentButtons from "@/components/molecules/CommentButtons";

type Props = {
  onSubmit: (userName: string, comment: string) => void;
  onCancel: () => void;
  disabled?: boolean;
};

const CommentForm = ({ onSubmit, onCancel, disabled = false }: Props) => {
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");

  const userNameId = useId();
  const commentId = useId();

  const handleSubmit = () => {
    if (userName.trim() && comment.trim() && !disabled) {
      onSubmit(userName, comment);
      setUserName("");
      setComment("");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
      <Input
        id={`username-${userNameId}`}
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="ユーザ名"
        disabled={disabled}
      />
      <Textarea
        id={`comment-${commentId}`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="コメントを入力"
        disabled={disabled}
        rows={4}
      />
      <CommentButtons
        onSubmit={handleSubmit}
        onCancel={onCancel}
        disabled={disabled}
      />
    </div>
  );
};

export default CommentForm;
