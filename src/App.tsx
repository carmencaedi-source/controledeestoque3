/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Navigation, ActiveTab } from './components/Navigation';
import { StockOverview } from './components/StockOverview';
import { MovementForm } from './components/MovementForm';
import { HierarchyManager } from './components/HierarchyManager';
import { ReportsView } from './components/ReportsView';
import { PersistenceSync } from './components/PersistenceSync';
import { ArticleModal } from './components/ArticleModal';
import { ArticleDetailsModal } from './components/ArticleDetailsModal';
import { TechnicianModal } from './components/TechnicianModal';
import { storageService } from './services/storageService';
import { InventoryDatabase, ArticleWithHierarchy, Article } from './types/inventory';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [database, setDatabase] = useState<InventoryDatabase>(() => storageService.getDatabase());
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modais
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const [selectedSubgroupIdForNew, setSelectedSubgroupIdForNew] = useState<string | undefined>(undefined);
  const [detailsArticle, setDetailsArticle] = useState<ArticleWithHierarchy | null>(null);
  const [isTechnicianModalOpen, setIsTechnicianModalOpen] = useState(false);

  // Parâmetros de navegação rápida entre telas
  const [movementPreselectedArticleId, setMovementPreselectedArticleId] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<string | null>(null);

  // Carrega e assina mudanças do banco
  const refreshData = useCallback(() => {
    const current = storageService.getDatabase();
    setDatabase({ ...current });
  }, []);

  useEffect(() => {
    const unsubscribe = storageService.subscribe((updatedDb) => {
      setDatabase({ ...updatedDb });
    });
    return () => unsubscribe();
  }, []);

  const articlesWithHierarchy = storageService.getArticlesWithHierarchy();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // Handlers de navegação rápida
  const handleOpenQuickEntry = (articleId: string) => {
    setMovementPreselectedArticleId(articleId);
    setActiveTab('movement_in');
  };

  const handleOpenQuickExit = (articleId: string) => {
    setMovementPreselectedArticleId(articleId);
    setActiveTab('movement_out');
  };

  const handleViewHistory = (articleId: string) => {
    setMovementPreselectedArticleId(articleId);
    setActiveTab('reports');
  };

  const handleNewArticle = () => {
    setArticleToEdit(null);
    setSelectedSubgroupIdForNew(undefined);
    setIsArticleModalOpen(true);
  };

  const handleNewArticleUnderSubgroup = (subgroupId: string) => {
    setArticleToEdit(null);
    setSelectedSubgroupIdForNew(subgroupId);
    setIsArticleModalOpen(true);
  };

  const handleEditArticle = (art: ArticleWithHierarchy) => {
    setArticleToEdit(art);
    setIsArticleModalOpen(true);
  };

  const handleMovementSuccess = (articleId: string) => {
    refreshData();
    showNotification('Movimentação de estoque registrada com sucesso! Posição atualizada em tempo real.');
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-neutral-900 font-sans antialiased selection:bg-[#E30613] selection:text-white">
      {/* Notificação Flutuante Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-black text-white px-5 py-3 rounded-xl border-l-4 border-[#E30613] shadow-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-neutral-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cabeçalho Institucional SENAI SP */}
      <Header
        database={database}
        onOpenTechnicianModal={() => setIsTechnicianModalOpen(true)}
        onRefresh={refreshData}
      />

      {/* Menu Superior com Botões Grandes e Destacados */}
      <div className="print:hidden">
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          articlesCount={database.articles.length}
          movementsCount={database.movements.length}
        />
      </div>

      {/* Conteúdo Principal Dinâmico por Aba */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'overview' && (
          <StockOverview
            database={database}
            articlesWithHierarchy={articlesWithHierarchy}
            onOpenQuickEntry={handleOpenQuickEntry}
            onOpenQuickExit={handleOpenQuickExit}
            onViewHistory={handleViewHistory}
            onNewArticle={handleNewArticle}
            onViewDetails={(art) => setDetailsArticle(art)}
          />
        )}

        {activeTab === 'movement_in' && (
          <MovementForm
            initialType="ENTRADA"
            selectedArticleId={movementPreselectedArticleId}
            database={database}
            onSuccess={handleMovementSuccess}
            onCancel={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'movement_out' && (
          <MovementForm
            initialType="SAIDA"
            selectedArticleId={movementPreselectedArticleId}
            database={database}
            onSuccess={handleMovementSuccess}
            onCancel={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'hierarchy' && (
          <HierarchyManager
            database={database}
            onSelectArticle={(artId) => {
              const art = articlesWithHierarchy.find((a) => a.id === artId);
              if (art) setDetailsArticle(art);
            }}
            onNewArticleUnderSubgroup={handleNewArticleUnderSubgroup}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            database={database}
            articlesWithHierarchy={articlesWithHierarchy}
            initialSelectedArticleId={movementPreselectedArticleId}
          />
        )}

        {activeTab === 'sync' && (
          <PersistenceSync
            database={database}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Modais do Sistema */}
      <ArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        database={database}
        initialSubgroupId={selectedSubgroupIdForNew}
        articleToEdit={articleToEdit}
        onSuccess={(art) => {
          refreshData();
          showNotification(`Artigo [${art.code}] ${art.name} salvo com sucesso!`);
        }}
      />

      <ArticleDetailsModal
        article={detailsArticle}
        onClose={() => setDetailsArticle(null)}
        onEdit={(art) => {
          setDetailsArticle(null);
          handleEditArticle(art);
        }}
        onEntry={(id) => {
          setDetailsArticle(null);
          handleOpenQuickEntry(id);
        }}
        onExit={(id) => {
          setDetailsArticle(null);
          handleOpenQuickExit(id);
        }}
      />

      <TechnicianModal
        isOpen={isTechnicianModalOpen}
        onClose={() => setIsTechnicianModalOpen(false)}
        currentName={database.technicianName}
        onUpdated={(newName) => {
          refreshData();
          showNotification(`Responsável Técnico atualizado para: ${newName}`);
        }}
      />

      {/* Rodapé Institucional com Responsável Técnico */}
      <Footer
        technicianName={database.technicianName}
        onEditTechnician={() => setIsTechnicianModalOpen(true)}
        onOpenDocs={() => setActiveTab('sync')}
      />
    </div>
  );
}
