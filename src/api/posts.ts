import { request } from "./client";
import type { CreatePostPayload, Post, UpdatePostPayload } from "../types/post";

export type PostsPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
};

type ListResponse = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Post[];
};

function normalizePosts(payload: Post[] | ListResponse): PostsPage {
  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      next: null,
      previous: null,
      results: payload
    };
  }

  const results = payload && Array.isArray(payload.results) ? payload.results : [];
  return {
    count: typeof payload?.count === "number" ? payload.count : results.length,
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
    results
  };
}

export async function getPostsPage(pageUrl?: string): Promise<PostsPage> {
  const endpoint = pageUrl ?? "";
  const payload = await request<Post[] | ListResponse>(endpoint, {
    method: "GET"
  });
  return normalizePosts(payload);
}

export async function getPosts(): Promise<Post[]> {
  const page = await getPostsPage();
  return page.results;
}

export async function createPost(data: CreatePostPayload): Promise<Post> {
  return request<Post>("", {
    method: "POST",
    body: data
  });
}

export async function updatePost(
  postId: number,
  data: UpdatePostPayload
): Promise<Post> {
  return request<Post>(`${postId}/`, {
    method: "PATCH",
    body: data
  });
}

export async function deletePost(postId: number): Promise<void> {
  await request<void>(`${postId}/`, {
    method: "DELETE"
  });
}
