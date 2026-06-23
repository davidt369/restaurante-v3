import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Children,
  isValidElement,
  type ComponentPropsWithoutRef,
} from "react"
import { Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import mermaid from "mermaid"
import {
  BookOpen,
  FileText,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Menu,
  X,
  Search,
  BookMarked,
  Database,
  GitBranch,
  Settings,
  KeyRound,
  ScrollText,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

// ── Tipos ──────────────────────────────────────────────────────
interface DocItem {
  id: string
  filename: string
  title: string
  emoji: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

// ── Documentos disponibles ─────────────────────────────────────
const DOCS: DocItem[] = [
  {
    id: "01-manual-de-usuario",
    filename: "01-manual-de-usuario.md",
    title: "Manual de Usuario",
    emoji: "📘",
    icon: BookOpen,
    description: "Guía completa para el uso del sistema",
  },
  {
    id: "02-manual-tecnico",
    filename: "02-manual-tecnico.md",
    title: "Manual Técnico",
    emoji: "🔧",
    icon: Settings,
    description: "Arquitectura, instalación y configuración",
  },
  {
    id: "03-diccionario-base-de-datos",
    filename: "03-diccionario-base-de-datos.md",
    title: "Diccionario de Base de Datos",
    emoji: "📋",
    icon: Database,
    description: "Esquema y relaciones de la BD",
  },
  {
    id: "04-casos-de-uso-y-flujos",
    filename: "04-casos-de-uso-y-flujos.md",
    title: "Casos de Uso y Flujos",
    emoji: "🔄",
    icon: GitBranch,
    description: "Diagramas y flujos del sistema",
  },
  {
    id: "05-requerimientos-del-sistema",
    filename: "05-requerimientos-del-sistema.md",
    title: "Requerimientos del Sistema",
    emoji: "⚙️",
    icon: ScrollText,
    description: "Hardware, software y funcionales",
  },
  {
    id: "06-credenciales-de-prueba",
    filename: "06-credenciales-de-prueba.md",
    title: "Credenciales de Prueba",
    emoji: "🔑",
    icon: KeyRound,
    description: "Usuarios y accesos de prueba",
  },
]

// ── Slugify: sigue el algoritmo GFM exactamente ───────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, "")
    .replace(/ /g, "-")
    .replace(/^-+|-+$/g, "")
}

// Extrae texto plano de los children de un nodo React
function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children))
    return (children as React.ReactNode[]).map(extractText).join("")
  if (children && typeof children === "object" && "props" in (children as object)) {
    return extractText((children as React.ReactElement<{ children?: React.ReactNode }>).props.children)
  }
  return ""
}

// ── Contador global para IDs únicos de diagramas Mermaid ──────
let mermaidCounter = 0

// ── Componente Mermaid ─────────────────────────────────────────
function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(`mermaid-diagram-${++mermaidCounter}`)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const isDark = document.documentElement.classList.contains("dark")

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "base",
      themeVariables: isDark
        ? {
            primaryColor: "#4f46e5",
            primaryTextColor: "#f1f5f9",
            primaryBorderColor: "#6366f1",
            lineColor: "#818cf8",
            background: "#1e1b4b",
            mainBkg: "#1e1b4b",
            nodeBorder: "#6366f1",
            clusterBkg: "#1e1b4b",
            titleColor: "#f1f5f9",
            edgeLabelBackground: "#312e81",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }
        : {
            primaryColor: "#eef2ff",
            primaryTextColor: "#1e1b4b",
            primaryBorderColor: "#4338ca",
            lineColor: "#4338ca",
            background: "#f5f7ff",
            mainBkg: "#eef2ff",
            nodeBorder: "#4338ca",
            clusterBkg: "#f5f7ff",
            titleColor: "#1e1b4b",
            edgeLabelBackground: "#eef2ff",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          },
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      fontSize: 14,
    })

    setError(null)
    mermaid
      .render(idRef.current, code.trim())
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          const svgEl = containerRef.current.querySelector("svg")
          if (svgEl) {
            svgEl.style.maxWidth = "100%"
            svgEl.style.height = "auto"
          }
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Error desconocido"
        setError(msg)
      })
  }, [code])

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <strong>Error al renderizar diagrama Mermaid</strong>
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Ver código fuente
          </summary>
          <pre className="mt-1 text-xs text-muted-foreground">{code}</pre>
        </details>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center overflow-x-auto rounded-xl border border-border bg-card p-6 shadow-sm"
    />
  )
}

// ── Componentes personalizados para ReactMarkdown ──────────────
type HeadingProps = ComponentPropsWithoutRef<"h1">

function buildHeading(Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  return function Heading({ children, ...props }: HeadingProps) {
    const text = extractText(children)
    const id = slugify(text)
    return (
      <Tag id={id} {...props}>
        <a href={`#${id}`} className="anchor-link" aria-hidden="true" tabIndex={-1} />
        {children}
      </Tag>
    )
  }
}

const markdownComponents = {
  h1: buildHeading("h1"),
  h2: buildHeading("h2"),
  h3: buildHeading("h3"),
  h4: buildHeading("h4"),
  h5: buildHeading("h5"),
  h6: buildHeading("h6"),

  // Maneja bloques de código: mermaid → diagrama visual, resto → <code> normal
  code: ({ className, children }: ComponentPropsWithoutRef<"code">) => {
    const lang = /language-(\w+)/.exec(className || "")?.[1]
    if (lang === "mermaid") {
      return <MermaidDiagram code={String(children).replace(/\n$/, "")} />
    }
    return <code className={className}>{children}</code>
  },

  // Evita envolver el diagrama Mermaid en un <pre> extra
  pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => {
    const child = Children.toArray(children)[0]
    if (
      isValidElement(child) &&
      (child.props as { className?: string }).className?.includes("language-mermaid")
    ) {
      return <>{children}</>
    }
    return <pre {...props}>{children}</pre>
  },

  // Links internos → scroll suave; externos → nueva pestaña
  a: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => {
    if (href?.startsWith("#")) {
      return (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault()
            document
              .getElementById(href.slice(1))
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }}
          {...props}
        >
          {children}
        </a>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  },
}

// ── Página principal ───────────────────────────────────────────
export function DocumentacionPage() {
  const [selectedDoc, setSelectedDoc] = useState<DocItem>(DOCS[0])
  const [markdown, setMarkdown] = useState("")
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { theme, toggleTheme } = useTheme()

  const fetchDoc = useCallback(async (doc: DocItem) => {
    setLoading(true)
    try {
      const response = await fetch(`/docs/${doc.filename}`)
      if (!response.ok) throw new Error("Failed to fetch document")
      const text = await response.text()
      setMarkdown(text)
    } catch {
      setMarkdown(
        `# ❌ Error\n\nNo se pudo cargar el documento **${doc.title}**.\n\nVerifique que el archivo exista en \`public/docs/${doc.filename}\`.`
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDoc(selectedDoc)
  }, [selectedDoc, fetchDoc])

  const handleSelectDoc = (doc: DocItem) => {
    setSelectedDoc(doc)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const filteredDocs = DOCS.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentIndex = DOCS.findIndex((d) => d.id === selectedDoc.id)
  const prevDoc = currentIndex > 0 ? DOCS[currentIndex - 1] : null
  const nextDoc = currentIndex < DOCS.length - 1 ? DOCS[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden text-sm font-medium sm:inline">Inicio</span>
          </Link>

          <div className="mx-2 h-6 w-px bg-border" />

          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <BookMarked className="size-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">Documentación</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Charquería Oruro
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              id="tour-nav-theme-toggle"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              v1.0
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        {/* Sidebar Overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-16 z-40 h-[calc(100vh-4rem)] w-72 shrink-0 border-r border-border/60 bg-background
            transition-transform duration-300 ease-in-out
            lg:sticky lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex h-full flex-col">
            {/* Search */}
            <div className="border-b border-border/40 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar documento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Doc List */}
            <nav className="flex-1 overflow-y-auto p-3">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Documentos
              </p>
              <ul className="space-y-1">
                {filteredDocs.map((doc) => {
                  const Icon = doc.icon
                  const isActive = doc.id === selectedDoc.id
                  return (
                    <li key={doc.id}>
                      <button
                        onClick={() => handleSelectDoc(doc)}
                        className={`
                          group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200
                          ${
                            isActive
                              ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                          }
                        `}
                      >
                        <div
                          className={`
                          mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors
                          ${
                            isActive
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
                          }
                        `}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-medium leading-tight ${
                              isActive ? "text-primary" : ""
                            }`}
                          >
                            {doc.title}
                          </p>
                          <p
                            className={`mt-0.5 truncate text-[11px] leading-tight ${
                              isActive ? "text-primary/60" : "text-muted-foreground/60"
                            }`}
                          >
                            {doc.description}
                          </p>
                        </div>
                        {isActive && (
                          <ChevronRight className="mt-1 size-3.5 shrink-0 text-primary/60" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>

              {filteredDocs.length === 0 && (
                <div className="mt-8 text-center">
                  <FileText className="mx-auto size-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground/60">Sin resultados</p>
                </div>
              )}
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-border/40 p-4">
              <p className="text-[11px] text-muted-foreground/50">
                {DOCS.length} documentos disponibles
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          {loading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto size-8 animate-spin text-primary" />
                <p className="mt-3 animate-pulse text-sm font-medium text-muted-foreground">
                  Cargando documento...
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-8 lg:px-12 lg:py-10">
              {/* Document Header */}
              <div className="mb-8 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-lg">
                  {selectedDoc.emoji}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedDoc.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedDoc.description}</p>
                </div>
              </div>

              {/* Markdown Content */}
              <article className="prose-docs">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {markdown}
                </ReactMarkdown>
              </article>

              {/* Navigation Footer */}
              <div className="mt-12 flex items-center justify-between border-t border-border/60 pt-6">
                {prevDoc ? (
                  <Button variant="ghost" className="gap-2" onClick={() => handleSelectDoc(prevDoc)}>
                    <ArrowLeft className="size-4" />
                    <span className="hidden sm:inline">{prevDoc.title}</span>
                    <span className="sm:hidden">Anterior</span>
                  </Button>
                ) : (
                  <div />
                )}
                {nextDoc ? (
                  <Button variant="ghost" className="gap-2" onClick={() => handleSelectDoc(nextDoc)}>
                    <span className="hidden sm:inline">{nextDoc.title}</span>
                    <span className="sm:hidden">Siguiente</span>
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
