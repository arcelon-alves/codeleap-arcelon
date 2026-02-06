import { FormEvent, useState } from "react";

type CreatePostCardProps = {
  onCreatePost: (data: { title: string; content: string }) => Promise<void>;
  isSubmitting: boolean;
};

function CreatePostCard({ onCreatePost, isSubmitting }: CreatePostCardProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    await onCreatePost({
      title: title.trim(),
      content: content.trim()
    });

    setTitle("");
    setContent("");
  }

  return (
    <form className="card create-card" onSubmit={handleSubmit}>
      <h2 className="title-large">What's on your mind?</h2>
      <label htmlFor="create-title" className="label">
        Title
      </label>
      <input
        id="create-title"
        className="input"
        placeholder="Hello world"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <label htmlFor="create-content" className="label">
        Content
      </label>
      <textarea
        id="create-content"
        className="textarea"
        placeholder="Content here"
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />

      <div className="actions-end">
        <button
          type="submit"
          className="button button-primary"
          disabled={!canSubmit || isSubmitting}
        >
          CREATE
        </button>
      </div>
    </form>
  );
}

export default CreatePostCard;
