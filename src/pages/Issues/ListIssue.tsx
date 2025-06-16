import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_END_POINT } from "../../settings";

interface Issue {
  id: string;
  description: string;
  assigneeId: string;
  assignee?: { id: string; name: string; avatar?: string } | null;
  reporterId: string;
  reporter?: { id: string; name: string; avatar?: string } | null;
  status: string;
  type: string;
  priority: string;
  title: string;
}

const ListIssue = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState("");
  const [assignee, setAssignee] = useState("");  const [type, setType] = useState("");
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Helper function to get avatar image or fallback to initials
  const getAvatarImage = (user: { id: string; name: string; avatar?: string } | null) => {
    if (!user) return null;
    
    // Check if user has avatar URL/path
    if (user.avatar) {
      // Handle both relative URLs (from our API) and absolute URLs
      if (user.avatar.startsWith('/uploads/')) {
        return `${API_END_POINT}/${user.avatar}`;
      }
      return user.avatar;
    }
    // Return null if no avatar found - will show initials
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-l-red-500 bg-red-50';
      case 'Medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'Low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Bug':
        return <div className="w-4 h-4 rounded-sm bg-red-600"></div>;
      case 'Task':
        return <div className="w-4 h-4 rounded-sm bg-blue-600"></div>;
      case 'Story':
        return <div className="w-4 h-4 rounded-sm bg-green-600"></div>;
      default:
        return <div className="w-4 h-4 rounded-sm bg-gray-600"></div>;
    }
  };

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_END_POINT}/api/projects/${projectId}`
        );
        setIssues(res.data.issues);
      } catch (err) {
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [projectId]);

  const typeOptions = Array.from(
    new Set(issues.map((issue) => issue.type))
  ).sort();

  // Filter issues client-side
  const filteredIssues = issues.filter(
    (issue) =>
      (!search ||
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        (issue.description && issue.description.toLowerCase().includes(search.toLowerCase())) ||
        (issue.type && issue.type.toLowerCase().includes(search.toLowerCase())) ||
        (issue.status && issue.status.toLowerCase().includes(search.toLowerCase())) ||
        (issue.priority && issue.priority.toLowerCase().includes(search.toLowerCase())) ||
        (issue.assignee?.name && issue.assignee.name.toLowerCase().includes(search.toLowerCase())) ||
        (issue.reporter?.name && issue.reporter.name.toLowerCase().includes(search.toLowerCase()))
      ) &&
      (!assignee || issue.assigneeId === assignee) &&
      (!type || issue.type === type)
  );

  // Group issues by status for Kanban board
  const kanbanColumns = [
    { id: 'To Do', title: 'To Do', color: 'bg-gray-100' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'Done', title: 'Done', color: 'bg-green-100' }
  ];
  const getIssuesByStatus = (status: string) => {
    return filteredIssues.filter(issue => issue.status === status);
  };
  // Drag and Drop handlers with enhanced visual feedback
  const handleDragStart = (e: React.DragEvent, issue: Issue) => {
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', issue.id);
    
    // Create custom drag image
    const dragElement = e.currentTarget as HTMLElement;
    const clone = dragElement.cloneNode(true) as HTMLElement;
    clone.style.transform = 'rotate(3deg)';
    clone.style.opacity = '0.8';
    clone.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
    clone.style.position = 'absolute';
    clone.style.top = '-1000px';
    clone.style.left = '-1000px';
    clone.style.width = dragElement.offsetWidth + 'px';
    document.body.appendChild(clone);
    
    e.dataTransfer.setDragImage(clone, dragElement.offsetWidth / 2, 20);
    
    // Remove the clone after a short delay
    setTimeout(() => {
      document.body.removeChild(clone);
    }, 100);
  };

  const handleDragOver = (e: React.DragEvent, columnId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (columnId && columnId !== dragOverColumn) {
      setDragOverColumn(columnId);
    }
  };



  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedIssue || draggedIssue.status === newStatus) {
      setDraggedIssue(null);
      return;
    }

    setUpdating(draggedIssue.id);
    
    try {
      // Update issue status in backend
      await axios.patch(`${API_END_POINT}/api/issues/${draggedIssue.id}`, {
        status: newStatus
      });

      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === draggedIssue.id 
            ? { ...issue, status: newStatus }
            : issue
        )
      );
    } catch (error) {
      console.error('Error updating issue status:', error);
      // You could add a toast notification here for error handling
    } finally {
      setUpdating(null);
      setDraggedIssue(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIssue(null);
    setDragOverColumn(null);
  };
  const KanbanCard = ({ issue }: { issue: Issue }) => {
    const isDone = issue.status === 'Done';
    const isUpdating = updating === issue.id;
    
    return (
      <div 
        className={`rounded-lg shadow-sm border-l-4 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow ${
          isDone 
            ? 'bg-gray-100 border-l-gray-400 opacity-75' 
            : `bg-white ${getPriorityColor(issue.priority)}`
        } ${isUpdating ? 'opacity-50 scale-95' : ''}`}
        draggable={!isDone}
        onDragStart={(e) => handleDragStart(e, issue)}
        onDragEnd={handleDragEnd}
        onClick={() => navigate(`/project/${projectId}/issue/${issue.id}`)}
      >
        {/* Loading indicator while updating */}
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
            <div className="text-sm text-gray-600">Updating...</div>
          </div>
        )}
        
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getTypeIcon(issue.type)}
            <span className={`text-xs uppercase ${isDone ? 'text-gray-400' : 'text-gray-500'}`}>
              {issue.type}
            </span>
          </div>
          <span className={`text-xs ${isDone ? 'text-gray-400' : 'text-gray-400'}`}>
            {issue.priority}
          </span>
        </div>
        
        <h3 className={`font-medium mb-2 line-clamp-2 ${isDone ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {issue.title}
        </h3>
        
        {issue.description && (
          <p className={`text-sm mb-3 line-clamp-2 ${isDone ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
            {issue.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {issue.assignee && (
              <>
                {getAvatarImage(issue.assignee) ? (
                  <img 
                    src={getAvatarImage(issue.assignee)!} 
                    alt={issue.assignee.name}
                    className={`w-6 h-6 rounded-full object-cover border border-gray-300 ${isDone ? 'opacity-60' : ''}`}
                  />
                ) : (
                  <div className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-medium ${
                    isDone ? 'bg-gray-400' : 'bg-blue-500'
                  }`}>
                    {getInitials(issue.assignee.name)}
                  </div>
                )}
              </>
            )}
          </div>
          {issue.reporter && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Reporter:</span>
              {getAvatarImage(issue.reporter) ? (
                <img 
                  src={getAvatarImage(issue.reporter)!} 
                  alt={issue.reporter.name}
                  className={`w-5 h-5 rounded-full object-cover border border-gray-300 ${isDone ? 'opacity-60' : ''}`}
                />
              ) : (
                <div className={`w-5 h-5 text-white rounded-full flex items-center justify-center text-xs font-medium ${
                  isDone ? 'bg-gray-400' : 'bg-green-500'
                }`}>
                  {getInitials(issue.reporter.name)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div style={{ width: "95%" }} className="mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Issues</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-white text-[#0098EB] shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setViewMode('kanban')}
            >
              Board
            </button>
            <button
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-[#0098EB] shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          <button
            className="bg-[#0098EB] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#007fc2] transition"
            onClick={() => navigate(`/project/${projectId}/issue/create`)}
          >
            Create Issue
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-nowrap items-center">
        <input
          placeholder="Search issues"
          className="flex-1 max-w-[300px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0098EB] focus:border-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0098EB] focus:border-transparent"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        >
          <option value="">All Assignees</option>
          {Array.from(new Set(issues.map((issue) => issue.assigneeId)))
            .map((id) => {
              const user = issues.find((issue) => issue.assignee && issue.assignee.id === id)?.assignee;
              return id ? (
                <option key={id} value={id}>
                  {user?.name || id}
                </option>
              ) : null;
            })}
        </select>
        <select
          className="min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0098EB] focus:border-transparent"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          {typeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="text-lg">Loading...</div>
        </div>
      ) : viewMode === 'kanban' ? (        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map((column) => {
            const columnIssues = getIssuesByStatus(column.id);
            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.color} rounded-t-lg px-4 py-3 border-b border-gray-200`}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">{column.title}</h2>
                    <span className="bg-gray-500 text-white text-xs rounded-full px-2 py-1">
                      {columnIssues.length}
                    </span>
                  </div>
                </div>
                <div 
                  className="bg-gray-50 rounded-b-lg p-4 min-h-96 flex-1"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {columnIssues.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      No issues in {column.title.toLowerCase()}
                    </div>
                  ) : (
                    columnIssues.map((issue) => (
                      <KanbanCard key={issue.id} issue={issue} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View - Original Table */
        <div className="bg-white rounded-lg shadow-sm">
          <table className="min-w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-sm text-gray-600">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Summary</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Reporter</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No issues found.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => {
                  const isDone = issue.status === 'Done';
                  return (
                    <tr
                      key={issue.id}
                      className={`border-b border-gray-100 cursor-pointer ${
                        isDone 
                          ? 'bg-gray-100 opacity-75 hover:bg-gray-150' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => navigate(`/project/${projectId}/issue/${issue.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(issue.type)}
                          <span className={`text-sm ${isDone ? 'text-gray-500 line-through' : ''}`}>
                            {issue.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium hover:underline ${
                          isDone ? 'text-gray-500 line-through' : 'text-blue-600'
                        }`}>
                          {issue.title}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm max-w-xs truncate ${
                        isDone ? 'text-gray-400 line-through' : 'text-gray-600'
                      }`}>
                        {issue.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          issue.status === 'Done' 
                            ? 'bg-gray-200 text-gray-600'
                            : issue.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isDone
                            ? 'bg-gray-200 text-gray-600'
                            : issue.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : issue.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {issue.priority}
                        </span>
                      </td>                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {issue.assignee && (
                            <>
                              {getAvatarImage(issue.assignee) ? (
                                <img 
                                  src={getAvatarImage(issue.assignee)!} 
                                  alt={issue.assignee.name}
                                  className={`w-6 h-6 rounded-full object-cover border border-gray-300 ${
                                    isDone ? 'opacity-60' : ''
                                  }`}
                                />
                              ) : (
                                <div className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-medium ${
                                  isDone ? 'bg-gray-400' : 'bg-blue-500'
                                }`}>
                                  {getInitials(issue.assignee.name)}
                                </div>
                              )}
                              <span className={`text-sm ${isDone ? 'text-gray-500 line-through' : ''}`}>
                                {issue.assignee.name}
                              </span>
                            </>
                          )}
                          {!issue.assignee && (
                            <span className={`text-sm ${isDone ? 'text-gray-400' : 'text-gray-400'}`}>
                              Unassigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {issue.reporter && (
                            <>
                              {getAvatarImage(issue.reporter) ? (
                                <img 
                                  src={getAvatarImage(issue.reporter)!} 
                                  alt={issue.reporter.name}
                                  className={`w-6 h-6 rounded-full object-cover border border-gray-300 ${
                                    isDone ? 'opacity-60' : ''
                                  }`}
                                />
                              ) : (
                                <div className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-medium ${
                                  isDone ? 'bg-gray-400' : 'bg-green-500'
                                }`}>
                                  {getInitials(issue.reporter.name)}
                                </div>
                              )}
                              <span className={`text-sm ${isDone ? 'text-gray-500 line-through' : ''}`}>
                                {issue.reporter.name}
                              </span>
                            </>
                          )}
                          {!issue.reporter && (
                            <span className={`text-sm ${isDone ? 'text-gray-400' : 'text-gray-400'}`}>
                              -
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListIssue;
