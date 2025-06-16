import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  issueId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

const fieldConfigs = [
  { key: 'type', label: 'Type', type: 'select', options: ['Bug', 'Task', 'Story'] },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'description', label: 'Summary', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: ['To Do', 'In Progress', 'Done'] },
  { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
  { key: 'assigneeId', label: 'Assignee', type: 'text' },
  { key: 'reporterId', label: 'Reporter', type: 'text' },
];

const ViewIssue = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [editIssue, setEditIssue] = useState<any>(null);  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const userDetails = sessionStorage.getItem('userdetails');
  const userId = userDetails ? JSON.parse(userDetails).id : null;

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/issues/${issueId}`);
        setIssue(res.data.issue || res.data);
      } catch {
        setIssue(null);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [issueId]);

  useEffect(() => {
    if (issue) setEditIssue(issue);
  }, [issue]);
  useEffect(() => {
    // Fetch users for dropdowns
    axios.get('http://localhost:4000/api/users').then(res => {
      setUsers(res.data.users || res.data);
    });
  }, [issueId]);

  useEffect(() => {
    // Fetch comments for the issue
    const fetchComments = async () => {
      if (issueId) {
        setLoadingComments(true);
        try {
          const res = await axios.get(`http://localhost:4000/api/comments/issue/${issueId}`);
          setComments(res.data.comments || res.data || []);
        } catch (error) {
          console.error('Error fetching comments:', error);
          setComments([]);
        } finally {
          setLoadingComments(false);
        }
      }
    };
    fetchComments();
  }, [issueId]);

  // Helper function to get avatar image or fallback to initials
  const getAvatarImage = (user: any) => {
    if (!user) return null;
    if (user.avatar) {
      if (user.avatar.startsWith('/uploads/')) {
        return `http://localhost:4000${user.avatar}`;
      }
      return user.avatar;
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFieldClick = (key: string) => {
    setEditField(key);
    setEditValue(editIssue[key]);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditValue(e.target.value);
  };
  const handleFieldSave = async (key: string) => {
    setSaving(true);
    try {
      const res = await axios.patch(`http://localhost:4000/api/issues/${issueId}`, { [key]: editValue });
      setEditIssue(res.data);
      setIssue(res.data);
      setEditField(null);
     
    } catch {
      // handle error (optional: show toast)
    } finally {
      setSaving(false);
      setToast('Updated successfully!');
      setTimeout(() => {
        setToast(null);
        navigate(-1);
      }, 1000);
    }
  };
  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    
    setSubmittingComment(true);
    try {
      await axios.post(`http://localhost:4000/api/comments`, { content: comment, issueId, userId });
      setComment('');
      
      // Refresh comments list
      const res = await axios.get(`http://localhost:4000/api/comments/issue/${issueId}`);
      setComments(res.data.comments || res.data || []);
      
      setToast('Comment added successfully!');
      setTimeout(() => setToast(null), 2000);
    } catch (error) {
      console.error('Error adding comment:', error);
      setToast('Failed to add comment');
      setTimeout(() => setToast(null), 2000);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!issue) return <div className="flex justify-center items-center min-h-screen text-red-500">Issue not found</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0098EB] to-blue-200 pt-24 px-4 md:px-8">
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-10 w-full max-w-2xl flex flex-col items-center mt-4 mb-8">
        <h2 className="text-2xl font-bold text-[#0098EB] mb-6 text-center">View Issue</h2>
        <div className="w-full flex flex-col gap-4">
          {fieldConfigs.map(({ key, label, type, options }) => {
            // For assigneeId and reporterId, use dropdowns
            const isUserDropdown = key === 'assigneeId' || key === 'reporterId';
            return (
              <div className="flex gap-4 items-center" key={key}>
                <div className="font-semibold text-[#0098EB] w-32">{label}:</div>
                {editField === key ? (
                  <>
                    {isUserDropdown ? (
                      <select
                        className="border rounded px-2 py-1"
                        value={editValue || ''}
                        onChange={handleFieldChange}
                        disabled={saving}
                      >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    ) : type === 'select' ? (
                      <select
                        className="border rounded px-2 py-1"
                        value={editValue}
                        onChange={handleFieldChange}
                        disabled={saving}
                      >
                        {Array.isArray(options) && options.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : type === 'textarea' ? (
                      <textarea
                        className="border rounded px-2 py-1 w-full"
                        value={editValue}
                        onChange={handleFieldChange}
                        disabled={saving}
                      />
                    ) : (
                      <input
                        className="border rounded px-2 py-1"
                        value={editValue}
                        onChange={handleFieldChange}
                        disabled={saving}
                      />
                    )}
                  </>
                ) : (
                  <div
                    className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded min-w-[120px]"
                    onClick={() => handleFieldClick(key)}
                    title="Click to edit"
                  >
                    {isUserDropdown
                      ? (users.find(u => u.id === editIssue?.[key])?.name || '-')
                      : (editIssue && editIssue[key] ? editIssue[key] : '-')}
                  </div>
                )}
              </div>
            );
          })}        </div>
          {/* Comments Section */}
        <div className="w-full mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-[#0098EB] mb-4">Comments</h3>
          
          {/* Existing Comments List */}
          <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <div className="text-gray-500">Loading comments...</div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No comments yet</div>
            ) : (
              comments.map((commentItem: any) => (
                <div key={commentItem.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {getAvatarImage(commentItem.user) ? (
                        <img 
                          src={getAvatarImage(commentItem.user)!} 
                          alt={commentItem.user?.name || 'User'}
                          className="w-8 h-8 rounded-full object-cover border border-gray-300"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-[#0098EB] text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {getInitials(commentItem.user?.name || 'Unknown User')}
                        </div>
                      )}
                    </div>
                    
                    {/* Comment Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {commentItem.user?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(commentItem.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {commentItem.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Comment */}
          <h4 className="text-md font-semibold text-[#0098EB] mb-3">Add Comment</h4>
          <div className="flex flex-col gap-3">
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-vertical min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#0098EB] focus:border-transparent"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submittingComment}
            />
            <button
              onClick={handleCommentSubmit}
              disabled={submittingComment || !comment.trim()}
              className="self-end px-4 py-2 bg-[#0098EB] text-white rounded-lg hover:bg-[#007fc2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submittingComment ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </div>

        {/* Save Changes and Back buttons on the same line if editing */}
        <div className="w-full flex flex-row gap-4 mt-6 mb-2">
          <button
            type="button"
            className="flex-1 py-2 rounded bg-[#0098EB] text-white font-bold hover:bg-[#007fc2] transition"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
           {editField && (
            <button
              className="flex-1 py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700 transition"
              onClick={() => handleFieldSave(editField)}
              disabled={saving}
            >
              Save Changes
            </button>
          )}
        </div>
        {/* Toast message for update success */}
        {toast && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg bg-green-600 text-white font-semibold transition-all">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewIssue;
