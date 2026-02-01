'use client';
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { BookOpen, Search, Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  is_featured: boolean;
  view_count: number;
  created_at: string;
}
interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
}
interface ArticleListProps {
  className?: string;
}
export function ArticleList({ className = '' }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [selectedCategory, searchQuery]);
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get<Category[]>(
        '/api/v1/documentation/documentation/categories'
      );
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      logger.error('', 'Failed to fetch categories:', error);
    }
  };
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<Article[]>(
        '/api/v1/documentation/documentation/articles',
        { params: { category_id: selectedCategory || undefined, search: searchQuery || undefined } }
      );
      if (response.data) {
        setArticles(response.data);
      }
    } catch (error) {
      logger.error('', 'Failed to fetch articles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const featuredArticles = articles.filter((a) => a.is_featured);
  const regularArticles = articles.filter((a) => !a.is_featured);
  return (
    <div className={className}>
      {' '}
      <div className="mb-6">
        {' '}
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
          {' '}
          <BookOpen className="h-6 w-6 text-blue-400" /> Documentation{' '}
        </h2>{' '}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {' '}
          <div className="flex-1">
            {' '}
            <div className="relative form-input-glow">
              {' '}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />{' '}
              <Input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />{' '}
            </div>{' '}
          </div>{' '}
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border border-gray-700 rounded-lg bg-[#1C1C26] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {' '}
            <option value="">All Categories</option>{' '}
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {' '}
                {cat.name}{' '}
              </option>
            ))}{' '}
          </select>{' '}
        </div>{' '}
      </div>{' '}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading articles...</div>
      ) : articles.length === 0 ? (
        <Card variant="glass" className="border border-gray-800">
          {' '}
          <div className="text-center py-8 text-gray-400">
            {' '}
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-500" />{' '}
            <p className="text-white">No articles found</p>{' '}
          </div>{' '}
        </Card>
      ) : (
        <div className="space-y-6">
          {' '}
          {featuredArticles.length > 0 && (
            <div>
              {' '}
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
                {' '}
                <Star className="h-5 w-5 text-yellow-400" /> Featured Articles{' '}
              </h3>{' '}
              <div className="grid md:grid-cols-2 gap-4">
                {' '}
                {featuredArticles.map((article) => (
                  <Card key={article.id} variant="glass" className="hover:shadow-lg transition-shadow border border-gray-800 hover-lift">
                    {' '}
                    <Link href={`/docs/${article.slug}`}>
                      {' '}
                      <h4 className="font-semibold mb-2 text-white">{article.title}</h4>{' '}
                      {article.excerpt && (
                        <p className="text-sm text-gray-400 mb-2"> {article.excerpt} </p>
                      )}{' '}
                      <div className="text-xs text-gray-400">
                        {' '}
                        {article.view_count} views{' '}
                      </div>{' '}
                    </Link>{' '}
                  </Card>
                ))}{' '}
              </div>{' '}
            </div>
          )}{' '}
          {regularArticles.length > 0 && (
            <div>
              {' '}
              <h3 className="text-lg font-semibold mb-3 text-white">All Articles</h3>{' '}
              <div className="space-y-2">
                {' '}
                {regularArticles.map((article) => (
                  <Card key={article.id} variant="glass" className="hover:shadow-md transition-shadow border border-gray-800 hover-lift">
                    {' '}
                    <Link href={`/docs/${article.slug}`}>
                      {' '}
                      <div className="flex items-center justify-between">
                        {' '}
                        <div>
                          {' '}
                          <h4 className="font-semibold text-white">{article.title}</h4>{' '}
                          {article.excerpt && (
                            <p className="text-sm text-gray-400 mt-1">
                              {' '}
                              {article.excerpt}{' '}
                            </p>
                          )}{' '}
                        </div>{' '}
                        <div className="text-xs text-gray-400 ml-4">
                          {' '}
                          {article.view_count} views{' '}
                        </div>{' '}
                      </div>{' '}
                    </Link>{' '}
                  </Card>
                ))}{' '}
              </div>{' '}
            </div>
          )}{' '}
        </div>
      )}{' '}
    </div>
  );
}
