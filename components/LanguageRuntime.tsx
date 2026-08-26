"use client";

import { useEffect } from "react";

const TRADUCCIONES: Record<string, [string, string]> = {
    "Inicio": ["Home", "首页"],
    "Dashboard": ["Dashboard", "仪表板"],
    "Simuladores": ["Simulators", "模拟器"],
    "Equipos": ["Teams", "团队"],
    "Usuarios": ["Users", "用户"],
    "Notificaciones": ["Notifications", "通知"],
    "Proyecto": ["Project", "项目"],
    "Administración": ["Administration", "管理"],
    "Auditoría": ["Audit", "审计"],
    "Perfil": ["Profile", "个人资料"],
    "Cerrar sesión": ["Sign out", "退出登录"],
    "Ingresar": ["Sign in", "登录"],
    "Volver al dashboard": ["Back to dashboard", "返回仪表板"],
    "Guardar cambios": ["Save changes", "保存更改"],
    "Nueva revisión": ["New review", "新建审查"],
    "Nuevo riesgo": ["New risk", "新建风险"],
    "Nueva vulnerabilidad": ["New vulnerability", "新建漏洞"],
    "Guardar riesgo": ["Save risk", "保存风险"],
    "Guardar vulnerabilidad": ["Save vulnerability", "保存漏洞"],
    "Ver todas": ["View all", "查看全部"],
    "No tienes notificaciones.": ["You have no notifications.", "没有通知。"],
};

function actualizarIdioma(codigo: string) {
    const indice: 0 | 1 | null = codigo === "EN" ? 0 : codigo === "ZH" ? 1 : null;
    const elementos = document.querySelectorAll("body *:not(script):not(style)");
    elementos.forEach((elemento) => {
        if (elemento.children.length > 0) return;
        const original = elemento.getAttribute("data-aerion-text") ?? elemento.textContent ?? "";
        if (!elemento.hasAttribute("data-aerion-text")) elemento.setAttribute("data-aerion-text", original);
        const traduccion = TRADUCCIONES[original.trim()];
        if (traduccion && indice !== null) elemento.textContent = original.replace(original.trim(), traduccion[indice]);
        else if (indice === null) elemento.textContent = original;
    });
    document.querySelectorAll<HTMLElement>("[placeholder]").forEach((elemento) => {
        const original = elemento.getAttribute("data-aerion-placeholder") ?? elemento.getAttribute("placeholder") ?? "";
        if (!elemento.hasAttribute("data-aerion-placeholder")) elemento.setAttribute("data-aerion-placeholder", original);
        const traduccion = TRADUCCIONES[original.trim()];
        if (traduccion && indice !== null) elemento.setAttribute("placeholder", traduccion[indice]);
        else if (indice === null) elemento.setAttribute("placeholder", original);
    });
}

export default function LanguageRuntime() {
    useEffect(() => {
        const idioma = window.localStorage.getItem("aerion-idioma") ?? "ES";
        document.documentElement.lang = idioma === "ES" ? "es" : idioma === "EN" ? "en" : "zh";
        actualizarIdioma(idioma);
        const cambiar = (evento: Event) => actualizarIdioma((evento as CustomEvent<string>).detail);
        window.addEventListener("aerion:idioma", cambiar);
        const observador = new MutationObserver(() => {
            observador.disconnect();
            actualizarIdioma(window.localStorage.getItem("aerion-idioma") ?? "ES");
            observador.observe(document.body, { childList: true, subtree: true });
        });
        observador.observe(document.body, { childList: true, subtree: true });
        return () => {
            window.removeEventListener("aerion:idioma", cambiar);
            observador.disconnect();
        };
    }, []);

    return null;
}