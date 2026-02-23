import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/data/projects";

interface Props {
  project: Project;
  showCase: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, showCase, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg border border-border bg-card shadow-2xl shadow-primary/10"
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-terminal-header border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <button onClick={onClose} className="w-3 h-3 rounded-full bg-[hsl(0_70%_55%)] hover:brightness-110 cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-[hsl(45_70%_55%)]" />
                <div className="w-3 h-3 rounded-full bg-[hsl(142_60%_45%)]" />
              </div>
              <span className="text-muted-foreground text-xs ml-3">
                ~/projects/{project.slug}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 font-mono text-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground terminal-glow">
                {project.title}
              </h2>
              <p className="text-muted-foreground text-xs mt-1">{project.year}</p>
            </div>

            <p className="text-foreground/90">{project.oneLiner}</p>

            <div>
              <span className="text-terminal-prompt text-xs font-bold">DESCRIÇÃO</span>
              <p className="text-foreground/80 mt-1 text-xs leading-relaxed">
                {project.description}
              </p>
            </div>

            <div>
              <span className="text-terminal-prompt text-xs font-bold">STACK</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 text-xs rounded bg-terminal-badge-bg text-terminal-badge-text border border-border"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-terminal-prompt text-xs font-bold">HIGHLIGHTS</span>
              <ul className="mt-1 space-y-1">
                {project.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-foreground/80">
                    <span className="text-primary mr-2">▸</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {project.tags.length > 0 && (
              <div>
                <span className="text-terminal-prompt text-xs font-bold">TAGS</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {project.tags.map((t) => (
                    <span key={t} className="text-xs text-muted-foreground">[{t}]</span>
                  ))}
                </div>
              </div>
            )}

            {(project.links.github || project.links.live) && (
              <div>
                <span className="text-terminal-prompt text-xs font-bold">LINKS</span>
                <div className="flex gap-3 mt-1">
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-terminal-link underline hover:text-primary transition-colors"
                    >
                      GitHub →
                    </a>
                  )}
                  {project.links.live && (
                    <a
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-terminal-link underline hover:text-primary transition-colors"
                    >
                      Live →
                    </a>
                  )}
                </div>
              </div>
            )}

            {showCase && project.caseStudy && (
              <div>
                <span className="text-terminal-prompt text-xs font-bold">CASE STUDY</span>
                <p className="text-foreground/80 mt-1 text-xs leading-relaxed">
                  {project.caseStudy}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              Pressione ESC ou clique fora para fechar
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
