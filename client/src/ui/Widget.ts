/**
 * Widget — 类型安全的 DOM 建造器。
 * 链式 API 构建 DOM，类型安全可复用。
 */

type StyleMap = Partial<CSSStyleDeclaration> & Record<string, string | number>;

export class Widget<E extends HTMLElement = HTMLElement> {
    readonly el: E;

    constructor(tag: string) {
        this.el = document.createElement(tag) as E;
    }

    id(v: string): this { this.el.id = v; return this; }
    cls(...names: string[]): this { this.el.classList.add(...names); return this; }
    text(v: string): this { this.el.textContent = v; return this; }
    html(v: string): this { this.el.innerHTML = v; return this; }
    attr(k: string, v: string): this { this.el.setAttribute(k, v); return this; }

    style(props: StyleMap): this {
        for (const [key, val] of Object.entries(props)) {
            const cssKey = key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
            (this.el.style as any)[cssKey] = String(val);
        }
        return this;
    }

    src(v: string): this {
        if (this.el instanceof HTMLImageElement) this.el.src = v;
        else this.el.setAttribute('src', v);
        return this;
    }

    children(...kids: (Widget<any> | HTMLElement | string | null | false)[]): this {
        for (const kid of kids) {
            if (!kid) continue;
            if (typeof kid === 'string') this.el.appendChild(document.createTextNode(kid));
            else if (kid instanceof Widget) this.el.appendChild(kid.el);
            else this.el.appendChild(kid);
        }
        return this;
    }

    on<K extends keyof HTMLElementEventMap>(
        event: K,
        fn: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
        options?: AddEventListenerOptions,
    ): this {
        this.el.addEventListener(event, fn as EventListener, options);
        return this;
    }

    as<T extends HTMLElement>(): Widget<T> { return this as unknown as Widget<T>; }
    get raw(): E { return this.el; }
}

export function el<K extends keyof HTMLElementTagNameMap>(tag: K): Widget<HTMLElementTagNameMap[K]>;
export function el(tag: string): Widget<HTMLElement>;
export function el(tag: string): Widget<HTMLElement> { return new Widget(tag); }

export const div = () => el('div');
export const span = (text?: string) => { const s = el('span'); if (text !== undefined) s.text(text); return s; };
export const btn = (text?: string) => { const b = el('button'); if (text !== undefined) b.text(text); return b; };
export const inputEl = (type?: string, placeholder?: string) => {
    const i = el('input').as<HTMLInputElement>();
    if (type) i.el.type = type;
    if (placeholder) i.el.placeholder = placeholder;
    return i;
};
export const imgEl = (src?: string) => {
    const i = el('img').as<HTMLImageElement>();
    if (src) i.el.src = src;
    return i;
};
