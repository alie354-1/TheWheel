import React from 'react';
import { InvestorContactFormBlock } from '../../../types/blocks.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.tsx';
import { Mail } from 'lucide-react';

interface InvestorContactFormBlockProps extends Omit<InvestorContactFormBlock, 'type' | 'id'> {
  onUpdate?: (data: Partial<InvestorContactFormBlock>) => void;
}

export const InvestorContactForm: React.FC<InvestorContactFormBlockProps> = ({
  formFields,
  submitButtonText,
  recipientEmail,
  title,
  onUpdate,
}) => {
  // For MVP, just render the form, no actual submission logic
  return (
    <Card className="flex flex-col items-center justify-center p-4 shadow-md bg-white rounded-lg min-w-[260px] max-w-[400px]">
      <CardHeader className="flex flex-row items-center gap-2 pb-2 w-full">
        <Mail className="h-6 w-6 text-primary" />
        <CardTitle className="text-base font-semibold">{title || "Investor Contact"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center w-full">
        <form className="w-full flex flex-col gap-2" onSubmit={e => e.preventDefault()}>
          {formFields && formFields.length > 0 ? (
            formFields.map((field: { name: string; label: string; type: string; required: boolean }, i: number) => (
              <div key={field.name || i} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600" htmlFor={field.name}>{field.label}{field.required && <span className="text-red-500">*</span>}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                    rows={2}
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No fields defined</div>
          )}
          <button
            type="submit"
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
            disabled
            title="Form submission not implemented in MVP"
          >
            {submitButtonText || "Submit"}
          </button>
        </form>
        {recipientEmail && (
          <div className="text-[10px] text-gray-400 mt-2">Recipient: {recipientEmail}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestorContactForm;
