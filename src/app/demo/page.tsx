'use client';

import React from 'react';
import styles from './Demo.module.css';
import Link from 'next/link';
import { usePromptManager } from './usePromptManager';

export default function DemoPage() {
  const {
    promptText, setPromptText,
    metrics,
    isAnalyzing, isImproving, isSaving,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    savedPrompts,
    selectedPromptId,
    selectedPromptName,
    selectedVersionNumber,
    evalResults,
    isEvaluating,
    handleCreatePrompt,
    handleSelectPrompt,
    handleSave, handleAnalyze, handleImprove,
    handleMultiModelEval,
    handleExport,
    handleImport,
    handleDeletePrompt
  } = usePromptManager();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredPrompts = savedPrompts.filter((prompt) =>
    prompt.prompt_versions[0]?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to join class names safely without trailing spaces
  const classNames = (...classes: (string | boolean | undefined)[]) => {
    const result = classes.filter(Boolean).join(' ').trim();
    return result || undefined;
  };

  return (
    <div className={styles.demoContainer}>

      {/* LEFT SIDEBAR */}
      <aside className={styles.leftSidebar}>
        <Link href="/" className={styles.brand} style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2z" />
              <path d="M8 10l3 3-3 3" />
              <path d="M13 16h3" />
            </svg>
          </div>
          <div className={styles.brandText}>
            <h2>VaultPrompt</h2>
            <span>ENTERPRISE VAULT</span>
          </div>
        </Link>

        <button className={styles.newPromptBtn} onClick={handleCreatePrompt} type="button">
          + New Prompt
        </button>

        <nav className={styles.navMenu}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('editor') }} className={classNames(styles.navItem, activeTab === 'editor' && styles.activeNavItem)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            Prompts
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('search') }} className={classNames(styles.navItem, activeTab === 'search' && styles.activeNavItem)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            Search
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('analytics') }} className={classNames(styles.navItem, activeTab === 'analytics' && styles.activeNavItem)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            Analytics
          </a>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            className={styles.toolbarBtn}
            onClick={handleExport}
            style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Export Backup
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => fileInputRef.current?.click()}
            style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Import JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = ''; // Reset
            }}
          />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        <div className={styles.headerTop}>
          <span className={styles.badge}>ENGINEERING</span>
          <span className={styles.lastEdited}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {selectedPromptId
              ? `${selectedPromptName} · v${selectedVersionNumber ?? 1}`
              : 'Unsaved draft'}
          </span>
        </div>

        {activeTab === 'editor' && (
          <div className={styles.editorCard}>
            <div className={styles.editorLabel}>SYSTEM PROMPT & INSTRUCTIONS</div>

            <div className={styles.editorBody}>
              <textarea
                className={styles.promptTextarea}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#e4e4e7',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none'
                }}
                placeholder="Write your prompt here..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
            </div>

            <div className={styles.editorToolbar}>
              <button
                className={styles.toolbarBtn}
                onClick={handleSave}
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.5 : 1 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                {isSaving ? "Saving..." : selectedPromptId ? "Save Version" : "Create Save"}
              </button>
              <button
                className={classNames(styles.toolbarBtn, isAnalyzing && styles.analyzingBtn)}
                onClick={handleAnalyze}
                disabled={isAnalyzing || isImproving}
                style={{ opacity: (isAnalyzing || isImproving) ? 0.5 : 1 }}
              >
                {isAnalyzing ? (
                  <svg className={styles.loadingIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
              <button
                className={classNames(styles.toolbarBtn, isImproving && styles.improvingBtn)}
                onClick={handleImprove}
                disabled={isAnalyzing || isImproving}
                style={{ opacity: (isAnalyzing || isImproving) ? 0.5 : 1 }}
              >
                {isImproving ? (
                  <svg className={styles.loadingIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>
                )}
                {isImproving ? "Fixing..." : "Improve"}
              </button>
              <button
                className={classNames(styles.toolbarBtn, styles.runBtn)}
                onClick={handleMultiModelEval}
                disabled={isEvaluating}
                style={{ opacity: isEvaluating ? 0.5 : 1, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ fill: 'currentColor' }}><polygon points="5 3 19 12 5 21 5 3" /></svg>
                {isEvaluating ? "Evaluating..." : "Run Multi-model Eval"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'eval' && (
          <div className={styles.editorCard} style={{ marginTop: '1rem' }}>
            <div className={styles.editorLabel}>MULTI-MODEL COMPARISON</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              {isEvaluating && !evalResults && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#a1a1aa' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite', opacity: 0.8, display: 'inline-block' }}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="10" />
                  </svg>
                  <p>Running prompt through GPT, Claude, and Gemini...</p>
                </div>
              )}
              {evalResults?.map((result, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#e4e4e7', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {result.model}
                    </span>
                    {result.status === 'success' ? (
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' }}>
                        Success
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
                        Error
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    {result.status === 'success' ? (
                      <>
                        <div style={{ color: '#d4d4d8', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                          {result.data?.actual_output}
                        </div>
                        {result.data?.score && (
                          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid #60a5fa' }}>
                            <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>JUDGE SCORE: {result.data.score}/5</div>
                            <div style={{ fontSize: '0.85rem', color: '#e4e4e7', fontStyle: 'italic' }}>{result.data.judgement_reason}</div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ color: '#f87171', fontSize: '0.875rem' }}>{result.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button
                className={styles.toolbarBtn}
                onClick={() => setActiveTab('editor')}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Back to Editor
              </button>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className={styles.editorCard} style={{ marginTop: '1rem' }}>
            <input type="text" placeholder="Search saved prompts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7', borderRadius: '8px', marginBottom: '1rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', position: 'relative' }}
                  className={styles.historyItem}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 style={{ margin: 0, color: 'white' }}>{prompt.name}</h4>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#a1a1aa', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prompt.prompt_versions[0]?.content ?? 'No saved versions yet'}
                      </p>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => handleDeletePrompt(prompt.id, e)}
                      title="Delete prompt"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {filteredPrompts.length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 1rem auto', color: '#a1a1aa', opacity: 0.5, display: 'block' }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p style={{ margin: 0, color: '#e4e4e7', fontSize: '0.95rem', fontWeight: 500 }}>No saved prompts found</p>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#a1a1aa', fontSize: '0.85rem' }}>Start by writing and saving a prompt in the editor.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={styles.editorCard} style={{ marginTop: '1rem' }}>
            <div className={styles.editorLabel}>RECENT ANALYTICS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
              {savedPrompts.map((prompt) => {
                const latestVersion = prompt.prompt_versions[0];
                const score = latestVersion?.analysis_score;
                const isGood = (score ?? 0) >= 80;
                return (
                  <div
                    key={prompt.id}
                    onClick={() => handleSelectPrompt(prompt)}
                    style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
                    className={styles.historyItem}
                  >
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <h4 style={{ margin: 0, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prompt.name || "Untitled Prompt"}</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.875rem' }}>
                          {prompt.updated_at
                            ? new Date(prompt.updated_at).toLocaleString()
                            : new Date(prompt.created_at).toLocaleString()}
                        </p>
                        {latestVersion?.tags?.map((tag) => (
                          <span key={tag} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#e4e4e7', textTransform: 'uppercase' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {score != null ? (
                        <div style={{ flexShrink: 0, padding: '0.5rem 1rem', background: isGood ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: isGood ? '#4ade80' : '#facc15', borderRadius: '20px', fontWeight: 'bold' }}>
                          Score: {score}
                        </div>
                      ) : (
                        <div style={{ flexShrink: 0, padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.05)', color: '#a1a1aa', borderRadius: '20px', fontSize: '0.875rem' }}>
                          No Score
                        </div>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => handleDeletePrompt(prompt.id, e)}
                        title="Delete prompt"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              {savedPrompts.filter(p => p.prompt_versions?.[0]?.analysis_score != null).length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 1rem auto', color: '#a1a1aa', opacity: 0.5, display: 'block' }}>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <p style={{ margin: 0, color: '#e4e4e7', fontSize: '0.95rem', fontWeight: 500 }}>No analytics data found</p>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#a1a1aa', fontSize: '0.85rem' }}>Run an evaluation and save a prompt to see it here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.quoteCard}>
          <div className={styles.quoteBgEffect}></div>
          <p className={styles.quoteText}>{'"Great prompts are not written, they are refined."'}</p>
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className={styles.rightSidebar}>
        {metrics ? (
          <>
            {/* Score Section */}
            <div className={styles.scoreSection}>
              <h3 className={styles.sectionTitle}>READINESS SCORE</h3>
              <div className={styles.scoreDial}>
                <div className={styles.scoreCircle}>
                  <div className={styles.scoreValue}>{metrics.overall}</div>
                  <div className={styles.scoreMax}>/ 100</div>
                </div>
              </div>
              <div className={classNames(styles.riskBadge, styles[`risk${metrics.hallucination_risk}`])}>
                Risk: {metrics.hallucination_risk}
              </div>
            </div>

            {/* Metrics Section */}
            <div className={styles.metricsSection}>
              <h3 className={styles.sectionTitle}>CORE PILLARS</h3>
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricName}>Clarity</div>
                  <div className={styles.metricValue}>{metrics.clarity}%</div>
                  <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${metrics.clarity}%`, backgroundColor: '#60a5fa' }}></div></div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricName}>Constraints</div>
                  <div className={styles.metricValue}>{metrics.constraints}%</div>
                  <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${metrics.constraints}%`, backgroundColor: '#a78bfa' }}></div></div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricName}>Output Format</div>
                  <div className={styles.metricValue}>{metrics.output_format}%</div>
                  <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${metrics.output_format}%`, backgroundColor: '#fbbf24' }}></div></div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricName}>Reliability</div>
                  <div className={styles.metricValue}>{metrics.hallucination_risk === 'Low' ? 'High' : metrics.hallucination_risk === 'Medium' ? 'Moderate' : 'Low'}</div>
                  <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${metrics.hallucination_risk === 'Low' ? 100 : metrics.hallucination_risk === 'Medium' ? 60 : 30}%`, backgroundColor: '#4ade80' }}></div></div>
                </div>
              </div>
            </div>

            {/* Suggestions Section */}
            <div className={styles.issuesSection}>
              <h3 className={styles.sectionTitle}>SMART SUGGESTIONS</h3>
              <div className={styles.suggestionList}>
                {metrics.suggestions.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Prompt is fully optimized.</p>
                ) : (
                  metrics.suggestions.map((suggestion, idx) => (
                    <div key={idx} className={styles.suggestionItem}>
                      <span className={styles.suggestionIcon}>✔</span>
                      <span className={styles.suggestionText}>{suggestion.replace(/^✔\s*/, '')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button className={styles.downloadBtn}>
              Download Report
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: '#a1a1aa' }}>
            {isAnalyzing ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite', opacity: 0.8 }}>
                <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="10" />
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
            <p style={{ fontSize: '0.875rem' }}>
              {isAnalyzing ? "Analyzing prompt constraints..." : "Run an analysis to generate\\nthe AI optimization report."}
            </p>
          </div>
        )}

      </aside>
    </div>
  );
}
