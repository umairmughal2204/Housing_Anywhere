import { useState, useEffect } from "react";
import { AdminPortalLayout } from "../components/admin-portal-layout";
import {
  getStoredBlogs,
  saveStoredBlogs,
  type BlogPost,
} from "../utils/content-storage";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Clock,
  X,
  User,
} from "lucide-react";

export function AdminBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [viewingBlog, setViewingBlog] = useState<BlogPost | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    audience: "tenant" as "tenant" | "landlord",
    category: "Renting Advice",
    author: "Super Admin",
    readTime: "5 min read",
    excerpt: "",
    content: "",
    status: "published" as "published" | "draft",
  });

  useEffect(() => {
    setBlogs(getStoredBlogs());

    const handleUpdate = () => setBlogs(getStoredBlogs());
    window.addEventListener("ezzy_content_updated", handleUpdate);
    return () => window.removeEventListener("ezzy_content_updated", handleUpdate);
  }, []);

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      audience: "tenant",
      category: "Renting Advice",
      author: "Super Admin",
      readTime: "5 min read",
      excerpt: "",
      content: "",
      status: "published",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      audience: blog.audience,
      category: blog.category,
      author: blog.author,
      readTime: blog.readTime,
      excerpt: blog.excerpt,
      content: blog.content,
      status: blog.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: BlogPost[];
    if (editingBlog) {
      updated = blogs.map((b) =>
        b.id === editingBlog.id ? { ...b, ...formData } : b
      );
    } else {
      const newBlog: BlogPost = {
        id: `blog-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
      };
      updated = [newBlog, ...blogs];
    }
    setBlogs(updated);
    saveStoredBlogs(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = blogs.filter((b) => b.id !== id);
    setBlogs(updated);
    saveStoredBlogs(updated);
    setDeletingId(null);
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    const matchesAudience = audienceFilter === "all" || b.audience === audienceFilter;
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesAudience && matchesStatus;
  });

  return (
    <AdminPortalLayout>
      <div className="max-w-[1200px] mx-auto">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px] mb-[28px]">
          <div>
            <h1 className="text-[26px] sm:text-[30px] font-bold text-neutral-black tracking-tight">
              Blogs Management
            </h1>
            <p className="text-[#6B7280] text-[14px] mt-[2px]">
              Upload, edit, and publish blogs that appear dynamically on the Tenants and Landlords blog pages.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-[8px] bg-[#0891B2] text-white px-[20px] py-[10px] rounded-[10px] text-[14px] font-bold hover:bg-[#0E7490] transition-colors"
          >
            <Plus className="w-[18px] h-[18px]" />
            Upload New Blog Post
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[16px] mb-[24px] flex flex-col md:flex-row gap-[12px] md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search blogs by title, category, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-[40px] pr-[14px] py-[9px] rounded-[10px] border border-[#E5E7EB] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0891B2]"
            />
          </div>
          <div className="flex flex-wrap gap-[10px]">
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="px-[12px] py-[9px] rounded-[10px] border border-[#E5E7EB] text-[14px] bg-white text-[#374151]"
            >
              <option value="all">All Audiences</option>
              <option value="tenant">Tenants Blog</option>
              <option value="landlord">Landlords Blog</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-[12px] py-[9px] rounded-[10px] border border-[#E5E7EB] text-[14px] bg-white text-[#374151]"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Blogs List */}
        <div className="space-y-[14px]">
          {filteredBlogs.length === 0 ? (
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[48px] text-center">
              <BookOpen className="w-[40px] h-[40px] text-[#9CA3AF] mx-auto mb-[12px]" />
              <h2 className="text-[18px] font-bold text-neutral-black mb-[4px]">No Blog Posts Found</h2>
              <p className="text-[#6B7280] text-[14px]">
                No blogs match your search criteria. Click "Upload New Blog Post" to add one.
              </p>
            </div>
          ) : (
            filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[20px] md:p-[24px] flex flex-col md:flex-row md:items-center md:justify-between gap-[16px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-[8px] mb-[8px]">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.05em] px-[8px] py-[2px] rounded-full ${
                        blog.audience === "tenant"
                          ? "bg-[#E0F2FE] text-[#0369A1]"
                          : "bg-[#FEF3C7] text-[#92400E]"
                      }`}
                    >
                      {blog.audience === "tenant" ? "Tenant Blog" : "Landlord Blog"}
                    </span>
                    <span className="text-[12px] bg-[#F1F5F9] text-[#475569] px-[8px] py-[2px] rounded">
                      {blog.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.05em] px-[8px] py-[2px] rounded-full ${
                        blog.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>
                  <h2 className="text-[#0F2D36] text-[17px] font-bold mb-[6px] truncate">
                    {blog.title}
                  </h2>
                  <p className="text-[#6B7280] text-[14px] line-clamp-2 mb-[10px]">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center gap-[16px] text-[12px] text-[#9CA3AF]">
                    <span className="flex items-center gap-[4px]">
                      <User className="w-[12px] h-[12px]" />
                      {blog.author}
                    </span>
                    <span className="flex items-center gap-[4px]">
                      <Clock className="w-[12px] h-[12px]" />
                      {blog.readTime}
                    </span>
                    <span>Date: {blog.createdAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-[8px] flex-shrink-0">
                  <button
                    onClick={() => setViewingBlog(blog)}
                    className="p-[8px] rounded-[8px] border border-[#E5E7EB] text-[#4B5563] hover:text-[#0891B2] hover:bg-[#F0FDFA] transition-colors"
                    title="View details"
                  >
                    <Eye className="w-[16px] h-[16px]" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(blog)}
                    className="p-[8px] rounded-[8px] border border-[#E5E7EB] text-[#4B5563] hover:text-[#0891B2] hover:bg-[#F0FDFA] transition-colors"
                    title="Edit blog"
                  >
                    <Edit2 className="w-[16px] h-[16px]" />
                  </button>
                  <button
                    onClick={() => setDeletingId(blog.id)}
                    className="p-[8px] rounded-[8px] border border-[#E5E7EB] text-[#EF4444] hover:bg-red-50 transition-colors"
                    title="Delete blog"
                  >
                    <Trash2 className="w-[16px] h-[16px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal - Create/Edit Blog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-[16px]">
          <div className="bg-white rounded-[20px] max-w-[650px] w-full max-h-[90vh] overflow-y-auto p-[28px] shadow-xl">
            <div className="flex items-center justify-between pb-[16px] border-b border-[#E5E7EB] mb-[20px]">
              <h2 className="text-[20px] font-bold text-[#0F2D36]">
                {editingBlog ? "Edit Blog Post" : "Upload New Blog Post"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-[6px] rounded-full text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <X className="w-[20px] h-[20px]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-[16px]">
              <div>
                <label className="block text-[14px] font-medium text-[#374151] mb-[6px]">
                  Blog Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 10 Essential Tips for Renters"
                  className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0891B2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-[14px] font-medium text-[#374151] mb-[6px]">
                    Target Audience Page
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) =>
                      setFormData({ ...formData, audience: e.target.value as "tenant" | "landlord" })
                    }
                    className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] text-[14px] bg-white"
                  >
                    <option value="tenant">Tenants Blog (/blog/tenants)</option>
                    <option value="landlord">Landlords Blog (/blog/landlords)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#374151] mb-[6px]">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Renting Advice, Market Insights"
                    className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] text-[14px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
                <div>
                  <label className="block text-[14px] font-medium text-[#374151] mb-[6px]">
                    Author Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Super Admin"
                    className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] text-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#374151] mb-[6px]">
                    Read Time
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] text-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#374151] mb-[6px]">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "published" | "draft" })
                    }
                    className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] text-[14px] bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#374151] mb-[6px]">
                  Excerpt / Summary
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short summary displayed on blog card..."
                  className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] text-[14px] resize-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#374151] mb-[6px]">
                  Full Blog Content
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write full article content..."
                  className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] text-[14px] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-[12px] pt-[16px] border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-[20px] py-[10px] rounded-[10px] border border-[#D1D5DB] text-[14px] font-semibold text-[#4B5563] hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-[24px] py-[10px] rounded-[10px] bg-[#0891B2] text-white text-[14px] font-bold hover:bg-[#0E7490]"
                >
                  Save Blog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Preview Blog */}
      {viewingBlog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-[16px]">
          <div className="bg-white rounded-[20px] max-w-[650px] w-full max-h-[85vh] overflow-y-auto p-[28px] shadow-xl">
            <div className="flex items-center justify-between pb-[16px] border-b border-[#E5E7EB] mb-[20px]">
              <div>
                <span className="text-[12px] font-bold text-[#0891B2] uppercase">
                  {viewingBlog.category} • {viewingBlog.audience}
                </span>
                <h2 className="text-[20px] font-bold text-[#0F2D36] mt-[4px]">
                  {viewingBlog.title}
                </h2>
              </div>
              <button
                onClick={() => setViewingBlog(null)}
                className="p-[6px] rounded-full text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <X className="w-[20px] h-[20px]" />
              </button>
            </div>
            <div className="text-[13px] text-[#6B7280] mb-[16px]">
              By {viewingBlog.author} • {viewingBlog.readTime} • Published: {viewingBlog.createdAt}
            </div>
            <p className="text-[#374151] text-[15px] leading-[1.7] mb-[20px] font-medium bg-[#F8FAFB] p-[16px] rounded-[12px]">
              {viewingBlog.excerpt}
            </p>
            <div className="text-[#4B5563] text-[15px] leading-[1.8] whitespace-pre-wrap">
              {viewingBlog.content}
            </div>
          </div>
        </div>
      )}

      {/* Modal - Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-[16px]">
          <div className="bg-white rounded-[16px] max-w-[420px] w-full p-[24px] text-center shadow-xl">
            <h2 className="text-[18px] font-bold text-[#0F2D36] mb-[8px]">Confirm Delete</h2>
            <p className="text-[#6B7280] text-[14px] mb-[24px]">
              Are you sure you want to delete this blog post? This action will remove it from the public blog page immediately.
            </p>
            <div className="flex items-center justify-center gap-[12px]">
              <button
                onClick={() => setDeletingId(null)}
                className="px-[18px] py-[9px] rounded-[8px] border border-[#D1D5DB] text-[14px] font-semibold text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-[20px] py-[9px] rounded-[8px] bg-[#EF4444] text-white text-[14px] font-bold hover:bg-[#DC2626]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPortalLayout>
  );
}
