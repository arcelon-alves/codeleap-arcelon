import { FormEvent, useMemo, useState } from "react";
import type { Post } from "../types/post";
import { formatRelativeTime } from "../utils/time";

type PostCardProps = {
  post: Post;
  canManage: boolean;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
};

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 21c-1.1 0-2-.9-2-2V7h14v12c0 1.1-.9 2-2 2H7zm3-4h2V9h-2v8zm4 0h2V9h-2v8zM15.5 4l-1-1h-5l-1 1H5v2h14V4h-3.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm18-11.5a1.003 1.003 0 000-1.42l-1.34-1.34a1.003 1.003 0 00-1.42 0l-1.05 1.05 3.75 3.75L21 5.75z"
        fill="currentColor"
      />
    </svg>
  );
}

function PostCard({ post, canManage, onEdit, onDelete }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<string[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const contentWithMentions = useMemo(() => {
    const mentionRegex = /(@[a-zA-Z0-9_]+)/g;
    const chunks = post.content.split(mentionRegex);
    return chunks.map((chunk, index) => {
      if (/^@[a-zA-Z0-9_]+$/.test(chunk)) {
        return (
          <span key={`${post.id}-mention-${index}`} className="mention">
            {chunk}
          </span>
        );
      }
      return <span key={`${post.id}-text-${index}`}>{chunk}</span>;
    });
  }, [post.content, post.id]);

  function handleToggleLike() {
    setIsLiked((previousLikeState) => {
      setLikesCount((previousCount) => {
        if (previousLikeState) {
          return Math.max(0, previousCount - 1);
        }
        return previousCount + 1;
      });
      return !previousLikeState;
    });
  }

  function handleAddComment(event: FormEvent) {
    event.preventDefault();
    const trimmedComment = commentDraft.trim();
    if (trimmedComment.length === 0) {
      return;
    }
    setComments((previousComments) => [...previousComments, trimmedComment]);
    setCommentDraft("");
    setIsCommentsOpen(true);
  }

  return (
    <article className="card post-card">
      <header className="post-header">
        <h3 className="post-title">{post.title}</h3>
        {canManage && (
          <div className="icon-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => onDelete(post)}
              aria-label={`Delete post ${post.title}`}
            >
              <TrashIcon />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => onEdit(post)}
              aria-label={`Edit post ${post.title}`}
            >
              <EditIcon />
            </button>
          </div>
        )}
      </header>

      <div className="post-meta">
        <span className="post-username">@{post.username}</span>
        <time className="post-time">{formatRelativeTime(post.created_datetime)}</time>
      </div>

      <p className="post-content">{contentWithMentions}</p>

      <div className="post-footer-actions">
        <button
          type="button"
          className={`like-button${isLiked ? " liked" : ""}`}
          onClick={handleToggleLike}
        >
          {isLiked ? "Liked" : "Like"}
        </button>
        <span className="likes-count">{likesCount} likes</span>
        <button
          type="button"
          className="comment-toggle-button"
          onClick={() => setIsCommentsOpen((previousOpen) => !previousOpen)}
        >
          Comments ({comments.length})
        </button>
      </div>

      {isCommentsOpen && (
        <div className="comments-panel">
          <form className="comment-form" onSubmit={handleAddComment}>
            <input
              className="input"
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Write a comment"
            />
            <button
              type="submit"
              className="button button-secondary comment-submit-button"
              disabled={commentDraft.trim().length === 0}
            >
              Add
            </button>
          </form>
          {comments.length > 0 && (
            <ul className="comment-list">
              {comments.map((comment, index) => (
                <li key={`${post.id}-comment-${index}`} className="comment-item">
                  {comment}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

export default PostCard;
