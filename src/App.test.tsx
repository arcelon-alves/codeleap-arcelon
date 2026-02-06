import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import {
  createPost,
  deletePost,
  getPostsPage,
  updatePost,
  type PostsPage
} from "./api/posts";
import type { Post } from "./types/post";

vi.mock("./api/posts", () => ({
  getPostsPage: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn()
}));

const mockedGetPostsPage = vi.mocked(getPostsPage);
const mockedCreatePost = vi.mocked(createPost);
const mockedUpdatePost = vi.mocked(updatePost);
const mockedDeletePost = vi.mocked(deletePost);

function asPage(posts: Post[], next: string | null = null): PostsPage {
  return {
    count: posts.length,
    next,
    previous: null,
    results: posts
  };
}

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

const ownPost: Post = {
  id: 1,
  username: "alice",
  created_datetime: "2025-01-02T12:00:00.000Z",
  title: "Alice post",
  content: "Alice content"
};

const anotherUserPost: Post = {
  id: 2,
  username: "bob",
  created_datetime: "2025-01-01T12:00:00.000Z",
  title: "Bob post",
  content: "Bob content"
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mockedGetPostsPage.mockResolvedValue(asPage([]));
  mockedCreatePost.mockResolvedValue(ownPost);
  mockedUpdatePost.mockResolvedValue(ownPost);
  mockedDeletePost.mockResolvedValue();
});

describe("critical flows", () => {
  it("disables ENTER on signup until username is provided", async () => {
    renderApp();
    const user = userEvent.setup();

    const enterButton = screen.getByRole("button", { name: "ENTER" });
    expect(enterButton).toBeDisabled();

    await user.type(screen.getByLabelText("Please enter your username"), "alice");
    expect(enterButton).toBeEnabled();
  });

  it("disables CREATE until title and content are both provided", async () => {
    localStorage.setItem("codeleap:username", "alice");
    renderApp();
    const user = userEvent.setup();

    const createButton = screen.getByRole("button", { name: "CREATE" });
    expect(createButton).toBeDisabled();

    await user.type(screen.getByLabelText("Title"), "Hello world");
    expect(createButton).toBeDisabled();

    await user.type(screen.getByLabelText("Content"), "Content here");
    expect(createButton).toBeEnabled();

    await user.clear(screen.getByLabelText("Title"));
    expect(createButton).toBeDisabled();
  });

  it("shows edit/delete actions only for posts owned by current username", async () => {
    localStorage.setItem("codeleap:username", "alice");
    mockedGetPostsPage.mockResolvedValue(asPage([anotherUserPost, ownPost]));
    renderApp();

    await screen.findByText("Alice post");

    expect(screen.getByLabelText("Delete post Alice post")).toBeInTheDocument();
    expect(screen.getByLabelText("Edit post Alice post")).toBeInTheDocument();
    expect(screen.queryByLabelText("Delete post Bob post")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Edit post Bob post")).not.toBeInTheDocument();
  });

  it("opens delete modal and closes on Cancel without deleting", async () => {
    localStorage.setItem("codeleap:username", "alice");
    mockedGetPostsPage.mockResolvedValue(asPage([ownPost]));
    renderApp();
    const user = userEvent.setup();

    await screen.findByText("Alice post");
    await user.click(screen.getByLabelText("Delete post Alice post"));

    const prompt = "Are you sure you want to delete this item?";
    expect(screen.getByText(prompt)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByText(prompt)).not.toBeInTheDocument();
    });
    expect(mockedDeletePost).not.toHaveBeenCalled();
  });

  it("confirms delete and calls API with the selected post id", async () => {
    localStorage.setItem("codeleap:username", "alice");
    mockedGetPostsPage.mockResolvedValue(asPage([ownPost]));
    renderApp();
    const user = userEvent.setup();

    await screen.findByText("Alice post");
    await user.click(screen.getByLabelText("Delete post Alice post"));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mockedDeletePost).toHaveBeenCalled();
    });
    expect(mockedDeletePost.mock.calls[0]?.[0]).toBe(1);
  });

  it("opens edit modal with current data and saves updated fields", async () => {
    localStorage.setItem("codeleap:username", "alice");
    mockedGetPostsPage.mockResolvedValue(asPage([ownPost]));
    renderApp();
    const user = userEvent.setup();

    await screen.findByText("Alice post");
    await user.click(screen.getByLabelText("Edit post Alice post"));

    const dialog = screen.getByRole("dialog");
    const titleInput = within(dialog).getByLabelText("Title");
    const contentInput = within(dialog).getByLabelText("Content");
    expect(titleInput).toHaveValue("Alice post");
    expect(contentInput).toHaveValue("Alice content");

    await user.clear(titleInput);
    await user.type(titleInput, "Alice post updated");
    await user.clear(contentInput);
    await user.type(contentInput, "Alice content updated");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockedUpdatePost).toHaveBeenCalledWith(1, {
        title: "Alice post updated",
        content: "Alice content updated"
      });
    });
  });

  it("logs out and returns to signup screen", async () => {
    localStorage.setItem("codeleap:username", "alice");
    mockedGetPostsPage.mockResolvedValue(asPage([ownPost]));
    renderApp();
    const user = userEvent.setup();

    await screen.findByText("Alice post");
    await user.click(screen.getByRole("button", { name: "LOGOUT" }));

    await waitFor(() => {
      expect(screen.getByText("Welcome to CodeLeap network!")).toBeInTheDocument();
    });
    expect(localStorage.getItem("codeleap:username")).toBeNull();
  });

  it("loads more posts when next page is available", async () => {
    localStorage.setItem("codeleap:username", "alice");
    mockedGetPostsPage
      .mockResolvedValueOnce(
        asPage([ownPost], "https://dev.codeleap.co.uk/careers/?limit=10&offset=10")
      )
      .mockResolvedValueOnce(asPage([anotherUserPost]));

    renderApp();
    const user = userEvent.setup();

    await screen.findByText("Alice post");
    await user.click(screen.getByRole("button", { name: "Load more" }));

    await screen.findByText("Bob post");
    expect(mockedGetPostsPage).toHaveBeenNthCalledWith(
      2,
      "https://dev.codeleap.co.uk/careers/?limit=10&offset=10"
    );
  });
});
