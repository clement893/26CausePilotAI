import { Card } from '@/components/ui';
interface FAQItemProps {
  question: string;
  answer: string;
}
export default function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <Card variant="glass">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white dark:text-foreground mb-2">{question}</h3>
        <p className="text-gray-400 dark:text-muted-foreground">{answer}</p>
      </div>
    </Card>
  );
}
