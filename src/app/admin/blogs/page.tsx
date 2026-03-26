'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { BlogRecord } from '@/lib/cms';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);

  useEffect(() => {
    void fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      if (Array.isArray(data)) setBlogs(data);
    } catch {
      toast.error('Failed to load blogs');
    }
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

  const togglePublish = async (blog: BlogRecord) => {
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

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Blog Posts</h1>
          <p className={styles.pageSubtitle}>{blogs.length} total posts</p>
        </div>

        <Link href="/admin/blogs/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> New Post
        </Link>
      </div>

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
                <Link href={`/admin/blogs/${blog.id}`} className="btn btn-sm btn-outline">
                  <Edit2 size={14} /> Edit
                </Link>

                <button className="btn btn-sm" onClick={() => togglePublish(blog)}>
                  {blog.published ? (
                    <>
                      <EyeOff size={14} /> Unpublish
                    </>
                  ) : (
                    <>
                      <Eye size={14} /> Publish
                    </>
                  )}
                </button>

                <button
                  className="btn btn-sm"
                  style={{ color: 'var(--error)' }}
                  onClick={() => deleteBlog(blog.id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
