import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type HiddenFieldProps = {
    value: boolean;
    onChange: (value: boolean) => void;
};

export function HiddenField({ value, onChange }: HiddenFieldProps) {
    return (
        <Button
            type="button"
            variant={value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(!value)}
            className="w-full"
        >
            {value ? (
                <>
                    <EyeOff className="mr-2 h-3 w-3" />
                    Oculto en el sitio público
                </>
            ) : (
                <>
                    <Eye className="mr-2 h-3 w-3" />
                    Visible en el sitio público
                </>
            )}
        </Button>
    );
}
