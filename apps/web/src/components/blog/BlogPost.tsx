/** * Blog Post Component * * Displays a single blog post with full content. * * @component */ 'use client';
import { Card, Badge } from '@/components/ui';
import { SafeHTML } from '@/components/ui/SafeHTML';
import { Link } from '@/i18n/routing';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import type { BlogPost } from '@/components/content';
export interface BlogPostProps {
  post: BlogPost;
  className?: string;
}
/** * Blog Post Component * * Displays a single blog post with metadata, content, and navigation. */ export default function BlogPost({
  post,
  className,
}: BlogPostProps) {
  return (
    <article className={className}>
      {/* Back Link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> <span>Back to Blog</span>
      </Link>
      <Card variant="glass" className="border border-gray-800">
        {/* Post Header */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="default">{post.status}</Badge>
            {post.category_name && (
              <Link
                href={`/blog/category/${post.category_name.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                {post.category_name}
              </Link>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4"> {post.title} </h1>
          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {post.author_name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <Link
                  href={`/blog/author/${post.author_name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {post.author_name}
                </Link>
              </div>
            )}
            {post.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            )}
          </div>
        </header>
        {/* Featured Image Placeholder */}
        <div className="aspect-video glass-effect bg-[#13131A] border border-gray-800 rounded-lg mb-6" />
        {/* Post Excerpt */}
        {post.excerpt && (
          <div className="text-xl text-gray-300 mb-6 font-medium"> {post.excerpt} </div>
        )}
        {/* Post Content */}
        <div className="prose prose-lg prose-invert max-w-none mb-8 text-gray-300">
          {post.content_html && typeof post.content_html === 'string' ? (
            <SafeHTML html={post.content_html} />
          ) : (
            <div className="whitespace-pre-wrap">
              {typeof post.content === 'string' ? post.content : ''}
            </div>
          )}
        </div>
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-gray-800">
            <Tag className="w-4 h-4 text-gray-400" />
            {post.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </Card>
    </article>
  );
}
