'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    seoTitle: '',
    seoDesc: '',
    published: false,
  });

  useEffect(() => { void fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      if (Array.isArray(data)) setBlogs(data);
    } catch { }
  };

  const resetForm = () => {
    setForm({ title: '', slug: '', excerpt: '', content: '', image: '', seoTitle: '', seoDesc: '', published: false });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res: Response;
      if (editId) {
        res = await fetch(`/api/blogs/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('update');
        toast.success('Blog updated');
      } else {
        res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.status === 409) { toast.error('Slug already exists'); return; }
        if (!res.ok) throw new Error('create');
        toast.success('Blog created');
      }
      resetForm();
      void fetchBlogs();
    } catch { toast.error('Failed'); }
  };

  const editBlog = (blog: any) => {
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.image || '',
      seoTitle: blog.seoTitle,
      seoDesc: blog.seoDesc,
      published: blog.published,
    });
    setEditId(blog.id);
    setShowForm(true);
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Delete failed');
      return;
    }
    toast.success('Blog deleted');
    void fetchBlogs();
  };

  const togglePublish = async (blog: any) => {
    const res = await fetch(`/api/blogs/${blog.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...blog,
        published: !blog.published,
      }),
    });
    if (!res.ok) {
      toast.error('Update failed');
      return;
    }
    toast.success(blog.published ? 'Unpublished' : 'Published');
    void fetchBlogs();
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Blog Posts</h1>
          <p className={styles.pageSubtitle}>{blogs.length} total posts</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className={styles.formCard}>
          <h3>{editId ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-input" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: editId ? form.slug : generateSlug(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Slug</label>
              <input type="text" className="form-input" value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Excerpt *</label>
              <input type="text" className="form-input" required value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL *</label>
              <input type="text" className="form-input" required value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/images/brand/spectra-pack-logo.png" />
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea className="form-input form-textarea" required value={form.content} style={{ minHeight: '200px' }}
                onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">SEO Title</label>
                <input type="text" className="form-input" value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">SEO Description</label>
                <input type="text" className="form-input" value={form.seoDesc}
                  onChange={(e) => setForm({ ...form, seoDesc: e.target.value })} />
              </div>
            </div>
            <div className={styles.formActions}>
              <label className={styles.checkbox}>
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                Publish immediately
              </label>
              <div className={styles.formBtns}>
                <button type="button" className="btn btn-sm" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editId ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Blog list */}
      {blogs.length === 0 ? (
        <div className={styles.empty}>No blog posts yet. Create your first post!</div>
      ) : (
        <div className={styles.blogList}>
          {blogs.map((blog) => (
            <div key={blog.id} className={styles.blogCard}>
              <div className={styles.blogHeader}>
                <div>
                  <h3>{blog.title}</h3>
                  <span className={styles.blogSlug}>/{blog.slug}</span>
                </div>
                <span className={`badge ${blog.published ? 'badge-success' : 'badge-warning'}`}>
                  {blog.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className={styles.blogExcerpt}>{blog.excerpt}</p>
              <div className={styles.blogActions}>
                <button className="btn btn-sm btn-outline" onClick={() => editBlog(blog)}><Edit2 size={14} /> Edit</button>
                <button className="btn btn-sm" onClick={() => togglePublish(blog)}>
                  {blog.published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
                </button>
                <button className="btn btn-sm" style={{ color: 'var(--error)' }} onClick={() => deleteBlog(blog.id)}><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
