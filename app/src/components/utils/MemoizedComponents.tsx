// app/src/components/utils/MemoizedComponents.tsx
import { memo } from "react";
import CategoryButtons from "@/components/organisms/CategoryButtons";
import CommentForm from "@/components/organisms/CommentForm";
import Header from "@/components/organisms/Header";

// カテゴリボタンのメモ化版
export const MemoizedCategoryButtons = memo(CategoryButtons);

// コメントフォームのメモ化版
export const MemoizedCommentForm = memo(CommentForm);

// ヘッダーのメモ化版
export const MemoizedHeader = memo(Header);

// 記事カードのメモ化版
interface ArticleCardProps {
  id: number;
  title: string;
  category: string;
  content?: string;
  createdAt?: string;
  showContent?: boolean;
}

export const MemoizedArticleCard = memo(
  ({
    id,
    title,
    category,
    content,
    createdAt,
    showContent = false,
  }: ArticleCardProps) => (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold break-words mb-2 text-gray-900 dark:text-white">
          {title}
        </h2>
        {showContent && content && (
          <p className="text-gray-700 dark:text-gray-300 mb-4 break-words">
            {content.slice(0, 100)}...
          </p>
        )}
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>カテゴリー: {category}</span>
          {createdAt && <span>{new Date(createdAt).toLocaleDateString()}</span>}
        </div>
      </div>
    </article>
  ),
);

// 投稿リストのメモ化版
interface PostListProps {
  posts: Array<{
    id: number;
    title: string;
    category: string;
    content?: string;
    createdAt?: string;
  }>;
  showContent?: boolean;
}

export const MemoizedPostList = memo(
  ({ posts, showContent = false }: PostListProps) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <MemoizedArticleCard
          key={post.id}
          {...post}
          showContent={showContent}
        />
      ))}
    </div>
  ),
);
