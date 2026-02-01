'use client';

/**
 * Éditeur d'emails drag & drop - Étape 3.1.2
 * Page: /dashboard/marketing/templates/[id]/edit
 */

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { EmailEditor } from '@/components/email-editor';
import type { EmailEditorContent } from '@/components/email-editor';
import { getEmailTemplateAction } from '@/app/actions/email-templates/get';
import { updateEmailTemplateAction } from '@/app/actions/email-templates/update';
import { blocksToHtml } from '@/components/email-editor';
import { ChevronRight, Monitor, Smartphone, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

function parseContent(raw: unknown): EmailEditorContent | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.blocks)) return { blocks: [] };
  return { blocks: o.blocks as EmailEditorContent['blocks'] };
}

export default function EditEmailTemplatePage() {
  const params = useParams();
  const templateId = params?.id as string;
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [template, setTemplate] = useState<{ id: string; name: string; content: EmailEditorContent | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [exportHtml, setExportHtml] = useState<string | null>(null);
  const [latestContent, setLatestContent] = useState<EmailEditorContent | null>(null);

  useEffect(() => {
    if (!templateId || templateId === 'new' || !activeOrganization) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getEmailTemplateAction(templateId, activeOrganization.id);
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
        setTemplate(null);
      } else if (res.template) {
        const content = parseContent(res.template.content) ?? { blocks: [] };
        setTemplate({ id: res.template.id, name: res.template.name, content });
        setLatestContent(content);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [templateId, activeOrganization?.id]);

  const handleSave = useCallback(
    async (content: EmailEditorContent, html: string) => {
      if (!activeOrganization || !templateId || templateId === 'new') return;
      const res = await updateEmailTemplateAction(templateId, activeOrganization.id, { content, html });
      if (res.error) throw new Error(res.error);
    },
    [activeOrganization?.id, templateId]
  );

  const unsplashSearch = useCallback(async (query: string): Promise<{ url: string }[]> => {
    const res = await fetch(`/api/unsplash/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, []);

  const handleContentChange = useCallback((content: EmailEditorContent) => {
    setLatestContent(content);
  }, []);

  const handleExportHtml = useCallback(() => {
    const content = latestContent ?? template?.content ?? { blocks: [] };
    setExportHtml(blocksToHtml(content.blocks));
  }, [latestContent, template?.content]);

  if (orgLoading || (templateId && templateId !== 'new' && loading)) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 h-8 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-96 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Aucune organisation active</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (templateId === 'new') {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Créez un template depuis la liste des templates.</p>
          <Link href="/dashboard/marketing/templates" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Voir les templates
          </Link>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-red-400">{error ?? 'Template introuvable'}</p>
          <Link href="/dashboard/marketing/templates" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-[1600px]">
        <nav className="mb-4 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/marketing/templates" className="hover:text-white">Templates email</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{template.name}</span>
        </nav>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Éditeur d&apos;email</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm ${previewMode === 'desktop' ? 'border-[var(--color-primary,#3B82F6)] bg-[var(--color-primary,#3B82F6)]/20 text-white' : 'border-white/10 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5'}`}
            >
              <Monitor className="w-4 h-4" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm ${previewMode === 'mobile' ? 'border-[var(--color-primary,#3B82F6)] bg-[var(--color-primary,#3B82F6)]/20 text-white' : 'border-white/10 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5'}`}
            >
              <Smartphone className="w-4 h-4" /> Mobile
            </button>
            <button
              type="button"
              onClick={handleExportHtml}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5"
            >
              <Download className="w-4 h-4" /> Export HTML
            </button>
          </div>
        </div>
        {exportHtml !== null && (
          <ExportHtmlModal html={exportHtml} onClose={() => setExportHtml(null)} />
        )}
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 min-h-[500px]">
          <EmailEditor
            initialContent={template.content}
            onContentChange={handleContentChange}
            onSave={handleSave}
            unsplashSearch={unsplashSearch}
            autoSaveMs={5000}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--text-secondary,#A0A0B0)]">
          Sauvegarde automatique toutes les 5 secondes après une modification.
        </p>
      </div>
    </div>
  );
}

function ExportHtmlModal({ html, onClose }: { html: string; onClose: () => void }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h3 className="font-medium text-white">HTML exporté</h3>
          <div className="flex gap-2">
            <button type="button" onClick={handleCopy} className="rounded bg-[var(--color-primary,#3B82F6)] px-3 py-1.5 text-sm text-white">
              Copier
            </button>
            <button type="button" onClick={onClose} className="rounded border border-white/10 px-3 py-1.5 text-sm text-[var(--text-secondary,#A0A0B0)]">
              Fermer
            </button>
          </div>
        </div>
        <pre className="max-h-[60vh] overflow-auto p-4 text-xs text-[var(--text-secondary,#A0A0B0)] whitespace-pre-wrap break-all">
          {html}
        </pre>
      </div>
    </div>
  );
}
