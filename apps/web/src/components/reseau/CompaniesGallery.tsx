'use client';
import { Card } from '@/components/ui';
import { Building2 } from 'lucide-react';
import { type Company } from '@/lib/api/companies';
interface CompaniesGalleryProps {
  companies?: Company[];
  onCompanyClick?: (company: Company) => void;
}
export default function CompaniesGallery({
  companies = [],
  onCompanyClick,
}: CompaniesGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {' '}
      {companies.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-400">
          {' '}
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />{' '}
          <p>Aucune entreprise trouvée</p>{' '}
        </div>
      ) : (
        companies.map((company) => (
          <Card
            key={company.id}
            variant="glass"
            className="p-4 cursor-pointer hover-lift border border-gray-800 transition-all duration-200"
            onClick={() => onCompanyClick?.(company)}
          >
            {' '}
            <div className="flex items-center gap-3">
              {' '}
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-[#1C1C26] flex items-center justify-center">
                  {' '}
                  <Building2 className="w-6 h-6 text-gray-400" />{' '}
                </div>
              )}{' '}
              <div className="flex-1 min-w-0">
                {' '}
                <h3 className="font-medium truncate">{company.name}</h3>{' '}
                {company.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {company.description}
                  </p>
                )}{' '}
              </div>{' '}
            </div>{' '}
          </Card>
        ))
      )}{' '}
    </div>
  );
}
