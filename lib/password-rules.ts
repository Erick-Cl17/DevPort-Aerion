// Esta validación en frontend es solo ayuda visual. 
// El backend  debe repetir estas mismas reglas antes de aceptar la cuenta.

export type PasswordRule = {
    id: string;
    label: string;
    test: (value: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
    {
        id: "len",
        label: "Mínimo 10 caracteres",
        test: (v) => v.length >= 10,
    },
    {
        id: "upper",
        label: "Incluye al menos una mayúscula",
        test: (v) => /[A-Z]/.test(v),
    },
    {
        id: "lower",
        label: "Incluye al menos una minúscula",
        test: (v) => /[a-z]/.test(v),
    },
    {
        id: "digit",
        label: "Incluye al menos un número",
        test: (v) => /[0-9]/.test(v),
    },
    {
        id: "special",
        label: "Incluye al menos un carácter especial",
        test: (v) => /[^A-Za-z0-9]/.test(v),
    },
    {
        id: "seqnum",
        label: "Evita secuencias numéricas consecutivas (123, 234...)",
        // v.length > 0 evita que un campo vacío se muestre en verde: la
        // ausencia de una secuencia no es lo mismo que cumplir la regla.
        test: (v) =>
            v.length > 0 &&
            !/(?:012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/.test(
                v
            ),
    },
    {
        id: "seqalpha",
        label: "Evita secuencias alfabéticas consecutivas (abc, xyz...)",
        test: (v) => {
            if (v.length === 0) return false;
            const s = v.toLowerCase();
            for (let i = 0; i + 2 < s.length; i++) {
                const a = s.charCodeAt(i);
                const b = s.charCodeAt(i + 1);
                const c = s.charCodeAt(i + 2);
                if (a >= 97 && a <= 122) {
                    if (b === a + 1 && c === a + 2) return false;
                    if (b === a - 1 && c === a - 2) return false;
                }
            }
            return true;
        },
    },
    {
        id: "keyboard",
        label: "Evita patrones de teclado (qwerty, asdf...) y vocales seguidas",
        test: (v) => {
            if (v.length === 0) return false;
            const s = v.toLowerCase();
            const patrones = [
                "qwerty",
                "qwertyuiop",
                "asdfgh",
                "asdfghjkl",
                "zxcvbn",
                "zxcvbnm",
                "aeiou",
                "uoiea",
            ];
            return !patrones.some((p) => s.includes(p) || s.includes([...p].reverse().join("")));
        },
    },
];

export function passwordCumpleTodo(value: string): boolean {
    return PASSWORD_RULES.every((rule) => rule.test(value));
}
