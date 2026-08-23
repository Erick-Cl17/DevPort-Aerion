"use client";

import { PASSWORD_RULES } from "@/lib/password-rules";

export default function PasswordChecklist({ password }: { password: string }) {
    return (
        <ul className="grid gap-1.5 mt-2">
            {PASSWORD_RULES.map((rule) => {
                const cumple = rule.test(password);
                return (
                    <li
                        key={rule.id}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                            cumple ? "text-success" : "text-muted-foreground"
                        }`}
                    >
                        <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                                cumple
                                    ? "bg-success text-background"
                                    : "bg-secondary text-muted-foreground"
                            }`}
                        >
                            {cumple ? "✓" : "•"}
                        </span>
                        {rule.label}
                    </li>
                );
            })}
        </ul>
    );
}
