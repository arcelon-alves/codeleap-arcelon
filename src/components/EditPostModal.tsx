import { FormEvent, useEffect, useState } from "react";
import type { Post } from "../types/post";
import ModalShell from "./ModalShell";

type EditPostModalProps = {
  post: Post;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (data: { title: string; content: string }) => Promise<void>;
};

function EditPostModal({ post, isSaving, onCancel, onSave }: EditPostModalProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  useEffect(() => {
    setTitle(post.title);
    setContent(post.content);
  }, [post]);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || isSaving) {
      return;
    }
    await onSave({
      title: title.trim(),
      content: content.trim()
    });
  }

  return (
    <ModalShell onClose={onCancel}>
      <form className="modal-content" onSubmit={handleSubmit}>
        <h2 className="title-large">Edit item</h2>

        <label htmlFor="edit-title" className="label">
          Title
        </label>
        <input
          id="edit-title"
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Hello world"
        />

        <label htmlFor="edit-content" className="label">
          Content
        </label>
        <textarea
          id="edit-content"
          className="textarea"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Content here"
        />

        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="submit"
            className="button button-success"
            disabled={!canSubmit || isSaving}
          >
            Save
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export default EditPostModal;
