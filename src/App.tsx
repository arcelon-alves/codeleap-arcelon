import { useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { createPost, deletePost, getPostsPage, updatePost } from "./api/posts";
import type { Post } from "./types/post";
import SignupScreen from "./components/SignupScreen";
import CreatePostCard from "./components/CreatePostCard";
import PostCard from "./components/PostCard";
import DeletePostModal from "./components/DeletePostModal";
import EditPostModal from "./components/EditPostModal";

const USERNAME_STORAGE_KEY = "codeleap:username";
type SortOrder = "newest" | "oldest";
type FeedFilter = "all" | "mine";

function getStoredUsername(): string {
  return localStorage.getItem(USERNAME_STORAGE_KEY) ?? "";
}

function App() {
  const [username, setUsername] = useState<string>(getStoredUsername);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const postsQuery = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => getPostsPage(pageParam),
    enabled: username.length > 0,
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.next ?? undefined
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ postId, title, content }: { postId: number; title: string; content: string }) =>
      updatePost(postId, { title, content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  });

  const allPosts = useMemo(() => {
    const pages = postsQuery.data?.pages ?? [];
    const seen = new Set<number>();
    const merged: Post[] = [];

    for (const page of pages) {
      for (const post of page.results) {
        if (seen.has(post.id)) {
          continue;
        }
        seen.add(post.id);
        merged.push(post);
      }
    }

    return merged;
  }, [postsQuery.data]);

  const visiblePosts = useMemo(() => {
    let posts = allPosts;

    if (feedFilter === "mine") {
      posts = posts.filter((post) => post.username === username);
    }

    const trimmedSearch = searchTerm.trim().toLowerCase();
    if (trimmedSearch.length > 0) {
      posts = posts.filter((post) => {
        return (
          post.title.toLowerCase().includes(trimmedSearch) ||
          post.content.toLowerCase().includes(trimmedSearch) ||
          post.username.toLowerCase().includes(trimmedSearch)
        );
      });
    }

    return [...posts].sort(
      (a, b) =>
        (sortOrder === "newest" ? 1 : -1) *
        (new Date(b.created_datetime).getTime() -
          new Date(a.created_datetime).getTime())
    );
  }, [allPosts, feedFilter, searchTerm, sortOrder, username]);

  function handleSubmitUsername(nextUsername: string) {
    localStorage.setItem(USERNAME_STORAGE_KEY, nextUsername);
    setUsername(nextUsername);
  }

  function handleLogout() {
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    queryClient.removeQueries({ queryKey: ["posts"] });
    setEditingPost(null);
    setDeletingPost(null);
    setUsername("");
  }

  if (!username) {
    return <SignupScreen onSubmitUsername={handleSubmitUsername} />;
  }

  return (
    <main className="page">
      <section className="app-shell">
        <header className="app-header">
          <h1 className="app-title">CodeLeap Network</h1>
          <button
            type="button"
            className="button button-header"
            onClick={handleLogout}
          >
            LOGOUT
          </button>
        </header>

        <div className="content-stack">
          <CreatePostCard
            isSubmitting={createMutation.isPending}
            onCreatePost={async ({ title, content }) => {
              await createMutation.mutateAsync({
                username,
                title,
                content
              });
            }}
          />

          <section className="card feed-controls">
            <div className="control-item control-item-wide">
              <label htmlFor="search-input" className="label">
                Search
              </label>
              <input
                id="search-input"
                className="input"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title, content, or username"
              />
            </div>

            <div className="control-item">
              <label htmlFor="sort-order" className="label">
                Sort by
              </label>
              <select
                id="sort-order"
                className="select"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as SortOrder)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            <div className="control-item">
              <label htmlFor="feed-filter" className="label">
                Show
              </label>
              <select
                id="feed-filter"
                className="select"
                value={feedFilter}
                onChange={(event) => setFeedFilter(event.target.value as FeedFilter)}
              >
                <option value="all">All posts</option>
                <option value="mine">My posts</option>
              </select>
            </div>
          </section>

          {postsQuery.isPending && (
            <div className="status-card">Loading posts...</div>
          )}
          {postsQuery.isError && (
            <div className="status-card error">
              Failed to load posts. Please try again.
            </div>
          )}

          {!postsQuery.isPending &&
            !postsQuery.isError &&
            visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                canManage={post.username === username}
                onEdit={setEditingPost}
                onDelete={setDeletingPost}
              />
            ))}

          {!postsQuery.isPending && !postsQuery.isError && visiblePosts.length === 0 && (
            <div className="status-card">
              No posts found for the current filters.
            </div>
          )}

          {postsQuery.hasNextPage && (
            <div className="actions-center">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => postsQuery.fetchNextPage()}
                disabled={postsQuery.isFetchingNextPage}
              >
                {postsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      </section>

      {deletingPost && (
        <DeletePostModal
          isDeleting={deleteMutation.isPending}
          onCancel={() => setDeletingPost(null)}
          onConfirmDelete={async () => {
            await deleteMutation.mutateAsync(deletingPost.id);
            setDeletingPost(null);
          }}
        />
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          isSaving={updateMutation.isPending}
          onCancel={() => setEditingPost(null)}
          onSave={async ({ title, content }) => {
            await updateMutation.mutateAsync({
              postId: editingPost.id,
              title,
              content
            });
            setEditingPost(null);
          }}
        />
      )}
    </main>
  );
}

export default App;
