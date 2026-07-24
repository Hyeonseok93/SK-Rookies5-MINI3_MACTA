import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, CornerDownRight, Loader2 } from 'lucide-react';
import { auctionApi } from '../../api/auction';
import type { Comment } from '../../api/types';
import { formatDate, getServerNow } from '../../utils/format';

interface QaSectionProps {
  auctionId: string;
  comments: Comment[];
  isLoggedIn: boolean;
  isSeller: boolean;
  user: { id?: number | string; nickname?: string } | null;
  onCommentsChange: (comments: Comment[]) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export function QaSection({
  auctionId,
  comments,
  isLoggedIn,
  isSeller,
  user,
  onCommentsChange,
  showToast,
}: QaSectionProps) {
  const navigate = useNavigate();
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    if (isSeller) {
      showToast('본인 경매 상품에는 질문을 남길 수 없습니다.', 'error');
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      const res = await auctionApi.postComment(auctionId, newQuestion);
      if (res.success) {
        const newComment: Comment = {
          id: res.data.id,
          userId: user?.id || 999,
          nickname: user?.nickname || 'You',
          content: newQuestion,
          createdAt: getServerNow().toISOString(),
          children: [],
        };
        onCommentsChange([newComment, ...comments]);
        setNewQuestion('');
        showToast('Question submitted!', 'success');
      }
    } catch {
      showToast('Failed to submit question', 'error');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      const res = await auctionApi.postAnswer(auctionId, commentId, replyContent);
      if (res.success) {
        const newReply: Comment = {
          id: res.data.id,
          userId: user?.id || 999,
          nickname: user?.nickname || 'Seller',
          content: replyContent,
          createdAt: getServerNow().toISOString(),
        };

        onCommentsChange(
          comments.map((c) =>
            c.id === commentId
              ? { ...c, children: [...(c.children || []), newReply] }
              : c,
          ),
        );

        setReplyToId(null);
        setReplyContent('');
        showToast('Reply submitted!', 'success');
      }
    } catch {
      showToast('Failed to submit reply', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6">
        <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-blue-400" />
          Questions & Answers
        </h3>

        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-[#1e3a5f] pb-6 last:border-0">
              <div className="mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-medium mb-1">Q: {comment.content}</div>
                        <div className="text-gray-400 text-sm">
                          Asked by {comment.nickname} • {formatDate(comment.createdAt)}
                        </div>
                      </div>
                      {isSeller && (!comment.children || comment.children.length === 0) && (
                        <button
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          onClick={() => {
                            setReplyToId(replyToId === comment.id ? null : comment.id);
                            setReplyContent('');
                          }}
                        >
                          {replyToId === comment.id ? 'Cancel' : 'Reply'}
                        </button>
                      )}
                    </div>

                    {replyToId === comment.id && (
                      <div className="mt-4 ml-6 p-4 bg-[#1e3a5f]/30 rounded-lg border border-blue-500/20">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write your answer as a seller..."
                          rows={3}
                          className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-2"
                        ></textarea>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={isSubmittingReply || !replyContent.trim()}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {isSubmittingReply && <Loader2 className="w-3 h-3 animate-spin" />}
                            Answer
                          </button>
                          <button
                            onClick={() => setReplyToId(null)}
                            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {comment.children && comment.children.map((reply) => (
                      <div key={reply.id} className="mt-4 ml-6 pl-4 border-l-2 border-blue-500/30 flex gap-3">
                        <CornerDownRight className="w-4 h-4 text-blue-500/50 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-blue-100 font-medium mb-1">A: {reply.content}</div>
                          <div className="text-gray-500 text-xs">
                            Replied by <span className="text-blue-400 font-medium">{reply.nickname}</span> (Seller) • {formatDate(reply.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-8">No questions asked yet.</p>
          )}
        </div>

        {isLoggedIn ? (
          !isSeller ? (
            <form onSubmit={handleSubmitQuestion} className="bg-[#1e3a5f]/20 p-6 rounded-lg border border-[#1e3a5f]/50">
              <label className="block text-white font-medium mb-3">Ask a Question</label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question here..."
                rows={4}
                className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-3"
              ></textarea>
              <button
                type="submit"
                disabled={isSubmittingQuestion}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmittingQuestion ? 'Submitting...' : 'Submit Question'}
              </button>
            </form>
          ) : (
            <div className="bg-blue-600/10 p-6 rounded-lg border border-blue-500/30 text-center">
              <p className="text-blue-400">판매자는 본인의 상품에 질문을 남길 수 없습니다. 구매자의 문의에 답변해 주세요!</p>
            </div>
          )
        ) : (
          <div className="bg-[#1e3a5f]/20 p-8 rounded-lg border border-[#1e3a5f]/50 text-center">
            <p className="text-gray-400 mb-4">질문을 남기려면 로그인이 필요합니다.</p>
            <button
              onClick={() => navigate('/login', { state: { from: { pathname: `/product/${auctionId}` } } })}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              로그인하러 가기 &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
