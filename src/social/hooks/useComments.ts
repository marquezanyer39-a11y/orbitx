import { useCallback, useMemo, useState } from 'react';

import { useSocialFeed as useLegacySocialFeed } from '../../hooks/useSocialFeed';
import type { SocialComment } from '../../types/social';
import { SOCIAL_COMMENTS_ASTRA_INSIGHT } from '../mocks/comments.mock';
import * as commentsService from '../services/commentsService';

export function useComments(postId: string | null) {
  const [loading, setLoading] = useState(false);
  const legacy = useLegacySocialFeed();

  const comments = useMemo(
    () => (postId ? legacy.commentsByPost[postId] ?? [] : []),
    [legacy.commentsByPost, postId],
  );

  const addComment = useCallback(async (body: string, replyToCommentId?: string | null) => {
    if (!postId) return null;
    setLoading(true);
    try {
      return await commentsService.addComment(postId, body, legacy.currentCreator, replyToCommentId);
    } finally {
      setLoading(false);
    }
  }, [legacy.currentCreator, postId]);

  const likeComment = useCallback(async (commentId: string) => {
    setLoading(true);
    try {
      return await commentsService.likeComment(commentId);
    } finally {
      setLoading(false);
    }
  }, []);

  const replyComment = useCallback(async (parentComment: SocialComment, body: string) => {
    if (!postId) return null;
    setLoading(true);
    try {
      return await commentsService.replyComment(postId, parentComment, body, legacy.currentCreator);
    } finally {
      setLoading(false);
    }
  }, [legacy.currentCreator, postId]);

  return {
    loading,
    comments,
    currentUser: {
      displayName: legacy.currentCreator.displayName,
      handle: legacy.currentCreator.handle,
      avatarUri: legacy.currentCreator.avatarUri,
      avatarFallback: legacy.currentCreator.avatar ?? legacy.currentCreator.displayName.slice(0, 1),
    },
    creatorIds: legacy.creators.map((creator) => creator.id),
    likedCommentIds: legacy.likedCommentIds,
    astraInsight: SOCIAL_COMMENTS_ASTRA_INSIGHT,
    addComment,
    likeComment,
    replyComment,
  };
}
