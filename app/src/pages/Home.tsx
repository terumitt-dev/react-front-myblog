// src/pages/Home.tsx
import CommentForm from '@/components/organisms/CommentForm';

const dummyComments = [
  { id: 1, author: 'terumitt', content: 'これはテストコメントです。' },
  { id: 2, author: 'ゴ・Lila', content: 'ReactのUIいい感じですね！' },
];

export default function Home() {
  return (
    <div className="p-4 space-y-4">
      <CommentForm />
      <div className="space-y-2">
        {dummyComments.map((comment) => (
          <div key={comment.id} className="border p-2 rounded">
            <p className="font-bold">{comment.author}</p>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
