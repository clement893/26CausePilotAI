/**
 * Types communs pour les composants UI
 * Ce fichier définit les types de base utilisés par tous les composants
 * pour assurer la cohérence et la réutilisabilité.
 */

import { ReactNode, HTMLAttributes } from 'react';

/**
 * Variants de couleur communs pour les composants
 * Utilisés par Alert, Badge, et autres composants de feedback
 */
export type ColorVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * Variants pour les Alertes (sans 'default', utilise 'info' à la place)
 */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Variants pour les Badges (inclut les variants de couleur de base + les variants gradient)
 */
export type BadgeVariant = ColorVariant | 'gradient-primary' | 'gradient-success' | 'gradient-warning' | 'gradient-info';

/**
 * Variants de style pour les boutons
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'error' | 'gradient';

/**
 * Tailles communes pour les composants
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * Props de base communes à tous les composants
 */
export interface BaseComponentProps extends HTMLAttributes<HTMLElement> {
  /** Classes CSS supplémentaires */
  className?: string;
  /** Contenu enfant */
  children?: ReactNode;
}

/**
 * Props pour les composants avec variants de couleur
 */
export interface ColorVariantProps {
  /** Variant de couleur du composant */
  variant?: ColorVariant;
}

/**
 * Props pour les composants avec taille
 */
export interface SizeProps {
  /** Taille du composant */
  size?: Size;
}

/**
 * Props pour les composants avec label
 */
export interface LabelProps {
  /** Label du composant */
  label?: string;
}

/**
 * Props pour les composants avec état d'erreur
 */
export interface ErrorProps {
  /** Message d'erreur à afficher */
  error?: string;
  /** Texte d'aide supplémentaire */
  helperText?: string;
}

/**
 * Props pour les composants avec icône
 */
export interface IconProps {
  /** Icône à afficher à gauche */
  leftIcon?: ReactNode;
  /** Icône à afficher à droite */
  rightIcon?: ReactNode;
  /** Icône personnalisée */
  icon?: ReactNode;
}

/**
 * Props pour les composants avec état de chargement
 */
export interface LoadingProps {
  /** Indique si le composant est en état de chargement */
  loading?: boolean;
}

/**
 * Props pour les composants avec état désactivé
 */
export interface DisabledProps {
  /** Indique si le composant est désactivé */
  disabled?: boolean;
}

/**
 * Props pour les composants avec largeur complète
 */
export interface FullWidthProps {
  /** Indique si le composant doit prendre toute la largeur disponible */
  fullWidth?: boolean;
}

/**
 * Props pour les composants avec titre
 */
export interface TitleProps {
  /** Titre du composant */
  title?: string;
}

/**
 * Props pour les composants avec action de fermeture
 */
export interface ClosableProps {
  /** Callback appelé lors de la fermeture */
  onClose?: () => void;
}

/**
 * Mapping des couleurs pour les variants
 * Utilisé pour générer les classes Tailwind de manière cohérente
 */
export const colorVariantMap: Record<
  ColorVariant,
  {
    bg: string;
    text: string;
    border: string;
    darkBg: string;
    darkText: string;
    darkBorder: string;
  }
> = {
  default: {
    bg: 'bg-muted',
    text: 'text-foreground',
    border: 'border-border',
    darkBg: 'bg-[#1C1C26]',
    darkText: 'text-white',
    darkBorder: 'border-gray-800',
  },
  success: {
    bg: 'bg-success-50',
    text: 'text-success-800',
    border: 'border-success-200',
    darkBg: 'bg-green-500/20',
    darkText: 'text-green-300',
    darkBorder: 'border-green-500/30',
  },
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-800',
    border: 'border-warning-200',
    darkBg: 'bg-yellow-500/20',
    darkText: 'text-yellow-300',
    darkBorder: 'border-yellow-500/30',
  },
  error: {
    bg: 'bg-error-50',
    text: 'text-error-800',
    border: 'border-error-200',
    darkBg: 'bg-red-500/20',
    darkText: 'text-red-300',
    darkBorder: 'border-red-500/30',
  },
  info: {
    bg: 'bg-info-50',
    text: 'text-info-800',
    border: 'border-info-200',
    darkBg: 'bg-blue-500/20',
    darkText: 'text-blue-300',
    darkBorder: 'border-blue-500/30',
  },
};

/**
 * Mapping des tailles pour les composants
 */
export const sizeMap: Record<
  Size,
  {
    padding: string;
    text: string;
  }
> = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-base',
  },
  lg: {
    padding: 'px-6 py-3',
    text: 'text-lg',
  },
};
