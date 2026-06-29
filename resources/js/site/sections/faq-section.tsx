import { ChevronDown, HelpCircle } from 'lucide-react';
import { richTextToHtml, richTextToPlainText } from '@site/lib/richtext';
import type { SectionProps } from '@site/lib/template-registry';

type FaqItem = { question: string; answer: unknown };

export function FaqSection({ content, theme }: SectionProps) {
    const { title, subtitle, items } = content as {
        title?: string;
        subtitle?: string;
        items?: FaqItem[];
    };

    const list: FaqItem[] = Array.isArray(items) ? items : [];
    const primaryColor = theme?.primary_color;

    return (
        <section
            id="faq"
            className="border-b bg-muted/20 py-12 sm:py-16 lg:py-20"
        >
            <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        style={
                            primaryColor
                                ? {
                                      backgroundColor: `${primaryColor}1a`,
                                      color: primaryColor,
                                  }
                                : undefined
                        }
                    >
                        <HelpCircle className="h-3 w-3" />
                        Preguntas frecuentes
                    </span>
                    {title && (
                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                            {subtitle}
                        </p>
                    )}
                    {!title && (
                        <p className="mt-3 text-sm text-muted-foreground">
                            Configurá el título y las preguntas desde el panel
                            derecho.
                        </p>
                    )}
                </div>

                {list.length > 0 ? (
                    <div className="mt-10 overflow-hidden rounded-xl border bg-card shadow-sm sm:mt-12">
                        {list.map((item, idx) => (
                            <details
                                key={`${item.question}-${idx}`}
                                className="group border-b transition-colors last:border-b-0 open:bg-muted/30"
                            >
                                <summary
                                    className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 text-left text-base font-semibold text-foreground transition-colors hover:bg-accent/40 sm:px-7 sm:py-5 sm:text-lg"
                                    style={
                                        primaryColor
                                            ? ({
                                                  '--puck-accent': primaryColor,
                                              } as React.CSSProperties)
                                            : undefined
                                    }
                                >
                                    <span
                                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary transition-colors group-open:bg-primary group-open:text-primary-foreground sm:h-8 sm:w-8 sm:text-sm"
                                        style={
                                            primaryColor
                                                ? {
                                                      backgroundColor: `${primaryColor}1a`,
                                                      color: primaryColor,
                                                  }
                                                : undefined
                                        }
                                    >
                                        {idx + 1}
                                    </span>
                                    <span className="flex-1">
                                        {item.question}
                                    </span>
                                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                                </summary>
                                {item.answer &&
                                    richTextToPlainText(item.answer) && (
                                        <div className="border-l-2 border-primary/30 bg-muted/20 px-5 pt-1 pb-5 pl-12 sm:px-7 sm:pl-[4.25rem]">
                                            <div
                                                className="prose prose-sm dark:prose-invert prose-headings:text-foreground prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground max-w-none text-muted-foreground"
                                                dangerouslySetInnerHTML={{
                                                    __html: richTextToHtml(
                                                        item.answer,
                                                    ),
                                                }}
                                            />
                                        </div>
                                    )}
                            </details>
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 rounded-xl border-2 border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground sm:mt-12">
                        Agregá preguntas desde el panel derecho.
                    </div>
                )}
            </div>
        </section>
    );
}
