const fs = require('fs');
let code = fs.readFileSync('src/components/HomeHub.tsx', 'utf8');

const contentRegex = /<main className="flex-1 overflow-y-auto">[\s\S]*?<\/main>/;

const replacementContent = `<main className="flex-1 overflow-y-auto">
        {activeTab === 'projects' && (
          <>
            {/* 1. Hero / Prompt Section */}
            <section className="relative overflow-hidden bg-ink-2 border-b border-ink-2/50 py-16 lg:py-24">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[140%] rounded-full bg-gold/5 blur-[120px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[120%] rounded-full bg-seal/5 blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-[0.03]" />
              </div>
              
              <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center text-center">
                <Postmark />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-paper tracking-tight mt-6 mb-4 max-w-3xl leading-tight">
                  Design brilliant emails,<br/>
                  <span className="italic font-light text-gold">at the speed of thought.</span>
                </h1>
                <p className="text-text-on-ink-muted text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-light">
                  A new breed of email editor. Professional grade blocks, free-form canvas capabilities, and an AI co-pilot that actually understands design.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
                  <button 
                    onClick={onNewFromScratch}
                    className="w-full sm:w-auto px-8 py-3.5 bg-paper hover:bg-white text-ink font-bold text-sm uppercase tracking-wider rounded-lg shadow-xl shadow-paper/5 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Blank Canvas
                  </button>
                  <button 
                    onClick={() => setIsAiPromptOpen(true)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-ink-2 hover:bg-ink-2/80 text-gold border border-gold/30 hover:border-gold/60 font-bold text-sm uppercase tracking-wider rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                    Generate with AI
                  </button>
                </div>
              </div>
            </section>

            {/* 2. Drafts & Recent Projects */}
            <section id="drafts-section" className="py-16 max-w-[1400px] mx-auto px-6 lg:px-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif text-paper">Your Workspace</h2>
                  <p className="text-sm text-text-on-ink-muted mt-1">Continue editing your recent drafts.</p>
                </div>
              </div>

              {drafts.length === 0 ? (
                <div className="border border-dashed border-ink-2/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-ink-2/10">
                  <div className="w-16 h-16 rounded-full bg-ink-2 flex items-center justify-center mb-4">
                    <MousePointer2 className="w-6 h-6 text-text-on-ink-muted" />
                  </div>
                  <h3 className="text-lg font-bold text-paper mb-2">No projects yet</h3>
                  <p className="text-sm text-text-on-ink-muted max-w-sm mb-6">
                    Start with a blank canvas, use a template, or ask the AI to generate a layout for you.
                  </p>
                  <button 
                    onClick={() => setActiveTab('templates')}
                    className="px-6 py-2.5 bg-ink-2 hover:bg-ink-2/80 text-paper border border-ink-2 rounded-lg text-sm font-bold transition-all"
                  >
                    Browse Templates
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {drafts.map((draft) => (
                      <motion.div 
                        key={draft.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group flex flex-col bg-ink-2/30 rounded-xl border border-ink-2 overflow-hidden hover:border-gold/30 transition-all hover:shadow-[0_0_20px_rgba(217,164,65,0.05)] cursor-pointer"
                        onClick={() => onSelectTemplate(draft)}
                      >
                        {/* Thumbnail placeholder */}
                        <div className="aspect-[4/3] bg-ink-2 relative flex items-center justify-center overflow-hidden">
                          <LayoutGrid className="w-8 h-8 text-ink-2/50 opacity-20 absolute" />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink-2 to-transparent opacity-80" />
                          <div className="absolute bottom-3 left-4 flex gap-2">
                            {draft.themeId && (
                              <span className="text-[9px] uppercase tracking-widest font-bold bg-ink/80 text-gold px-2 py-0.5 rounded border border-gold/20 backdrop-blur-sm">
                                Theme
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-bold text-paper text-sm mb-1 truncate group-hover:text-gold transition-colors">{draft.name || 'Untitled Draft'}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-auto pt-3">
                            <span className="flex items-center gap-1.5 text-xs text-text-on-ink-muted">
                              <Clock className="w-3 h-3" />
                              {formatTime(draft.updatedAt)}
                            </span>
                            {draft.approvalState && draft.approvalState !== 'draft' && (
                              <span className={\`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider \${
                                draft.approvalState === 'approved' ? 'text-emerald-400' : 'text-purple-400'
                              }\`}>
                                <div className={\`w-1.5 h-1.5 rounded-full \${
                                  draft.approvalState === 'approved' ? 'bg-emerald-400' : 'bg-purple-400'
                                }\`} />
                                {draft.approvalState.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete action overlay */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => onDeleteDraft(draft.id, e)}
                            className="p-2 bg-ink/80 backdrop-blur-md hover:bg-rose-500/20 text-text-on-ink-muted hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/30 shadow-lg"
                            title="Delete draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'templates' && (
          <TemplatesGallery onSelectTemplate={onSelectTemplate} />
        )}

        {activeTab === 'brands' && (
          <BrandHub />
        )}
      </main>`;

code = code.replace(contentRegex, replacementContent);
fs.writeFileSync('src/components/HomeHub.tsx', code);
