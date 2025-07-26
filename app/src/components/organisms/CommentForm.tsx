// src/components/organisms/CommentForm.tsx
import { useState } from "react";
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

  const handleSubmit = () => {
    if (userName.trim() && comment.trim()) {
      onSubmit(userName, comment);
      setUserName("");
      setComment("");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded">
      <Input
        id="user-name"
        label="ユーザー名"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="ユーザー名を入力"
      />
      <Textarea
        id="comment"
        label="コメント"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="コメントを入力してください"
      />
      <CommentButtons onSubmit={handleSubmit} onCancel={onCancel} />
    </div>
  );
};

export default CommentForm;
