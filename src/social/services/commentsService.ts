import { useSocialStore as useOrbitxSocialStore } from '../../store/socialStore';
import type { SocialComment } from '../../types/social';
import { createMockDelay } from '../utils/createMockDelay';

export async function getComments(postId: string) {
  await createMockDelay();
  return useOrbitxSocialStore.getState().comments.filter((comment) => comment.postId === postId);
}

export async function addComment(
  postId: string,
  body: string,
  author: { id: string; displayName: string; handle: string },
  replyToCommentId?: string | null,
) {
  await createMockDelay(120);
  return useOrbitxSocialStore
    .getState()
    .addComment(postId, { body, replyToCommentId: replyToCommentId ?? null }, author);
}

export async function likeComment(commentId: string) {
  await createMockDelay(90);
  useOrbitxSocialStore.getState().toggleLikeComment(commentId);
  return commentId;
}

export async function replyComment(
  postId: string,
  parentComment: SocialComment,
  body: string,
  author: { id: string; displayName: string; handle: string },
) {
  await createMockDelay(120);
  return addComment(postId, body, author, parentComment.id);
}
