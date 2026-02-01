/**
 * Génère le HTML de l'email à partir des blocs (Étape 3.1.2)
 * Pour preview et export.
 */

import type { EmailBlock, TextBlockProps, ImageBlockProps, ButtonBlockProps, SeparatorBlockProps, ColumnsBlockProps } from './types';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function blockToHtml(block: EmailBlock): string {
  const { type, props } = block;
  if (type === 'text') {
    const p = props as TextBlockProps;
    const style = `font-size:${p.fontSize ?? 16}px;font-family:${p.fontFamily ?? 'Arial'};color:${p.color ?? '#333'};text-align:${p.align ?? 'left'};`;
    return `<div style="${style}">${(p.content ?? '').replace(/\n/g, '<br/>')}</div>`;
  }
  if (type === 'image') {
    const p = props as ImageBlockProps;
    if (!p.src) return '<div style="padding:12px;background:#f0f0f0;color:#666;text-align:center;">[Image]</div>';
    const w = p.width ?? 600;
    const img = `<img src="${escapeHtml(p.src)}" alt="${escapeHtml(p.alt ?? '')}" width="${w}" style="max-width:100%;height:auto;" />`;
    return p.link ? `<a href="${escapeHtml(p.link)}">${img}</a>` : `<div>${img}</div>`;
  }
  if (type === 'button') {
    const p = props as ButtonBlockProps;
    const style = `display:inline-block;padding:12px 24px;background:${p.backgroundColor ?? '#3B82F6'};color:${p.color ?? '#fff'};font-size:${p.fontSize ?? 16}px;text-decoration:none;border-radius:6px;`;
    return `<p style="text-align:center;"><a href="${escapeHtml(p.href ?? '#')}" style="${style}">${escapeHtml(p.label ?? '')}</a></p>`;
  }
  if (type === 'separator') {
    const p = props as SeparatorBlockProps;
    const thickness = p.thickness ?? 1;
    return `<hr style="border:none;border-top:${thickness}px solid ${p.color ?? '#e5e7eb'};margin:16px 0;" />`;
  }
  if (type === 'columns') {
    const p = props as ColumnsBlockProps;
    const cols = p.columns ?? 2;
    const width = `${100 / cols}%`;
    const colHtml = (p.blocks ?? [[], []])
      .slice(0, cols)
      .map((colBlocks) => colBlocks.map((b) => blockToHtml(b)).join(''))
      .map((html) => `<td style="width:${width};vertical-align:top;padding:8px;">${html}</td>`)
      .join('');
    return `<table role="presentation" style="width:100%;border-collapse:collapse;"><tr>${colHtml}</tr></table>`;
  }
  return '';
}

export function blocksToHtml(blocks: EmailBlock[]): string {
  const body = blocks.map(blockToHtml).join('\n');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:16px;font-family:Arial,sans-serif;">${body}</body></html>`;
}
