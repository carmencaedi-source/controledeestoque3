import {
  InventoryDatabase,
  ItemType,
  ItemGroup,
  ItemSubgroup,
  Article,
  StockMovement,
  ArticleWithHierarchy,
  GitHubSyncConfig,
} from '../types/inventory';
import { getSeededDatabase, getEmptyDatabase, TECHNICIAN_DEFAULT_NAME } from './validationData';

const STORAGE_KEY = 'senai_sp_inventory_db_v1';
const GITHUB_CONFIG_KEY = 'senai_sp_github_config_v1';

class StorageService {
  private listeners: Array<(db: InventoryDatabase) => void> = [];

  constructor() {
    // Escuta mudanças de storage entre abas
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            this.notifyListeners(parsed);
          } catch (e) {
            console.error('Erro ao sincronizar abas do storage:', e);
          }
        }
      });
    }
  }

  public subscribe(listener: (db: InventoryDatabase) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(db: InventoryDatabase) {
    this.listeners.forEach((listener) => {
      try {
        listener(db);
      } catch (err) {
        console.error('Erro no listener de estoque:', err);
      }
    });
  }

  public getDatabase(): InventoryDatabase {
    if (typeof window === 'undefined') {
      return getSeededDatabase();
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Inicializa com os 10 materiais técnicos de validação exigidos na entrega
      const seeded = getSeededDatabase();
      this.saveDatabase(seeded);
      return seeded;
    }

    try {
      const parsed: InventoryDatabase = JSON.parse(stored);
      // Validação de integridade mínima
      if (!parsed.types || !parsed.groups || !parsed.subgroups || !parsed.articles || !parsed.movements) {
        const seeded = getSeededDatabase();
        this.saveDatabase(seeded);
        return seeded;
      }
      return parsed;
    } catch (e) {
      console.error('Erro ao ler base de dados do localStorage, recriando:', e);
      const seeded = getSeededDatabase();
      this.saveDatabase(seeded);
      return seeded;
    }
  }

  public saveDatabase(db: InventoryDatabase): void {
    if (typeof window === 'undefined') return;
    db.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    this.notifyListeners(db);
  }

  public setTechnicianName(name: string): void {
    const db = this.getDatabase();
    db.technicianName = name.trim() || TECHNICIAN_DEFAULT_NAME;
    this.saveDatabase(db);
  }

  public getTechnicianName(): string {
    const db = this.getDatabase();
    return db.technicianName || TECHNICIAN_DEFAULT_NAME;
  }

  // Geração automática de códigos hierárquicos
  public getNextTypeCode(): string {
    const db = this.getDatabase();
    const count = db.types.length + 1;
    return String(count).padStart(2, '0');
  }

  public getNextGroupCode(typeId: string): string {
    const db = this.getDatabase();
    const type = db.types.find((t) => t.id === typeId);
    if (!type) return '01.01';

    const existingGroups = db.groups.filter((g) => g.typeId === typeId);
    const nextNum = existingGroups.length + 1;
    return `${type.code}.${String(nextNum).padStart(2, '0')}`;
  }

  public getNextSubgroupCode(groupId: string): string {
    const db = this.getDatabase();
    const group = db.groups.find((g) => g.id === groupId);
    if (!group) return '01.01.01';

    const existingSubgroups = db.subgroups.filter((sg) => sg.groupId === groupId);
    const nextNum = existingSubgroups.length + 1;
    return `${group.code}.${String(nextNum).padStart(2, '0')}`;
  }

  public getNextArticleCode(subgroupId: string): string {
    const db = this.getDatabase();
    const subgroup = db.subgroups.find((sg) => sg.id === subgroupId);
    if (!subgroup) return '01.01.01.0001';

    const existingArticles = db.articles.filter((a) => a.subgroupId === subgroupId);
    const nextNum = existingArticles.length + 1;
    return `${subgroup.code}.${String(nextNum).padStart(4, '0')}`;
  }

  // Operações Hierárquicas
  public addType(data: { name: string; description: string }): ItemType {
    const db = this.getDatabase();
    const newType: ItemType = {
      id: `type-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: this.getNextTypeCode(),
      name: data.name.trim(),
      description: data.description.trim(),
      createdAt: new Date().toISOString(),
    };
    db.types.push(newType);
    this.saveDatabase(db);
    return newType;
  }

  public addGroup(data: { typeId: string; name: string; description: string }): ItemGroup {
    const db = this.getDatabase();
    const newGroup: ItemGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: this.getNextGroupCode(data.typeId),
      typeId: data.typeId,
      name: data.name.trim(),
      description: data.description.trim(),
      createdAt: new Date().toISOString(),
    };
    db.groups.push(newGroup);
    this.saveDatabase(db);
    return newGroup;
  }

  public addSubgroup(data: { groupId: string; name: string; description: string }): ItemSubgroup {
    const db = this.getDatabase();
    const newSubgroup: ItemSubgroup = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: this.getNextSubgroupCode(data.groupId),
      groupId: data.groupId,
      name: data.name.trim(),
      description: data.description.trim(),
      createdAt: new Date().toISOString(),
    };
    db.subgroups.push(newSubgroup);
    this.saveDatabase(db);
    return newSubgroup;
  }

  public addArticle(data: Omit<Article, 'id' | 'code' | 'createdAt' | 'updatedAt'>): Article {
    const db = this.getDatabase();
    const code = this.getNextArticleCode(data.subgroupId);
    const now = new Date().toISOString();
    const technicianName = this.getTechnicianName();

    // Garante que a descrição termina com o primeiro nome do responsável técnico
    let formattedDescription = data.description.trim();
    if (!formattedDescription.endsWith(technicianName) && !formattedDescription.endsWith(`${technicianName}.`)) {
      formattedDescription = `${formattedDescription} ${technicianName}.`;
    }

    const newArticle: Article = {
      ...data,
      id: `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code,
      description: formattedDescription,
      createdAt: now,
      updatedAt: now,
    };

    db.articles.push(newArticle);

    // Se o artigo foi cadastrado com estoque inicial maior que zero, registra a movimentação de implantação/saldo inicial
    if (newArticle.currentStock > 0) {
      const initialMovement: StockMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        articleId: newArticle.id,
        type: 'ENTRADA',
        quantity: newArticle.currentStock,
        previousStock: 0,
        newStock: newArticle.currentStock,
        location: newArticle.defaultLocation,
        unitCost: newArticle.unitCost,
        documentNumber: 'SALDO-INICIAL-CADASTRO',
        entityName: 'Implantação de Inventário SENAI SP',
        reason: 'Registro do saldo inicial no cadastro do artigo',
        technicianName,
        timestamp: now,
      };
      db.movements.push(initialMovement);
    }

    this.saveDatabase(db);
    return newArticle;
  }

  public updateArticle(id: string, updates: Partial<Omit<Article, 'id' | 'code' | 'createdAt'>>): Article {
    const db = this.getDatabase();
    const idx = db.articles.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Artigo não encontrado');

    const technicianName = this.getTechnicianName();
    let updatedDesc = updates.description ? updates.description.trim() : db.articles[idx].description;
    if (updates.description && !updatedDesc.endsWith(technicianName) && !updatedDesc.endsWith(`${technicianName}.`)) {
      updatedDesc = `${updatedDesc} ${technicianName}.`;
    }

    db.articles[idx] = {
      ...db.articles[idx],
      ...updates,
      description: updatedDesc,
      updatedAt: new Date().toISOString(),
    };

    this.saveDatabase(db);
    return db.articles[idx];
  }

  // Gestão de Movimentações (Entrada e Saída)
  public registerMovement(movementData: {
    articleId: string;
    type: 'ENTRADA' | 'SAIDA';
    quantity: number;
    location: string;
    unitCost?: number;
    documentNumber: string;
    entityName: string;
    reason: string;
    notes?: string;
  }): StockMovement {
    const db = this.getDatabase();
    const article = db.articles.find((a) => a.id === movementData.articleId);
    if (!article) throw new Error('Artigo selecionado não existe');

    if (movementData.quantity <= 0) {
      throw new Error('A quantidade deve ser estritamente positiva');
    }

    const previousStock = article.currentStock;
    let newStock = previousStock;

    if (movementData.type === 'ENTRADA') {
      newStock = previousStock + movementData.quantity;
      if (movementData.unitCost && movementData.unitCost > 0) {
        // Custo médio ponderado
        const currentTotalCost = previousStock * article.unitCost;
        const incomingTotalCost = movementData.quantity * movementData.unitCost;
        article.unitCost = Number(((currentTotalCost + incomingTotalCost) / newStock).toFixed(2));
      }
    } else if (movementData.type === 'SAIDA') {
      if (movementData.quantity > previousStock) {
        throw new Error(
          `Saldo insuficiente em estoque! Saldo atual: ${previousStock} ${article.unit}. Quantidade requisitada: ${movementData.quantity} ${article.unit}.`
        );
      }
      newStock = previousStock - movementData.quantity;
    }

    article.currentStock = newStock;
    article.updatedAt = new Date().toISOString();
    // Atualiza a localização padrão se informada
    if (movementData.location && movementData.location.trim()) {
      article.defaultLocation = movementData.location.trim();
    }

    const technicianName = this.getTechnicianName();
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      articleId: article.id,
      type: movementData.type,
      quantity: movementData.quantity,
      previousStock,
      newStock,
      location: movementData.location || article.defaultLocation,
      unitCost: movementData.unitCost ?? article.unitCost,
      documentNumber: movementData.documentNumber.trim() || (movementData.type === 'ENTRADA' ? 'NF-AVULSA' : 'REQ-INTERNA'),
      entityName: movementData.entityName.trim() || 'SENAI SP - Almoxarifado Central',
      reason: movementData.reason.trim(),
      notes: movementData.notes?.trim(),
      technicianName,
      timestamp: new Date().toISOString(),
    };

    db.movements.push(newMovement);
    this.saveDatabase(db);
    return newMovement;
  }

  // Consultas Enriquecidas
  public getArticlesWithHierarchy(): ArticleWithHierarchy[] {
    const db = this.getDatabase();
    return db.articles.map((art) => {
      const subgroup = db.subgroups.find((sg) => sg.id === art.subgroupId);
      const group = subgroup ? db.groups.find((g) => g.id === subgroup.groupId) : undefined;
      const type = group ? db.types.find((t) => t.id === group.typeId) : undefined;
      const recentMovements = db.movements
        .filter((m) => m.articleId === art.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        ...art,
        subgroup,
        group,
        type,
        recentMovements,
      };
    });
  }

  // Backup e Restauração (Google Drive & JSON)
  public exportDatabaseAsJson(): string {
    const db = this.getDatabase();
    return JSON.stringify(db, null, 2);
  }

  public importDatabaseFromJson(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString) as InventoryDatabase;
      if (!Array.isArray(parsed.articles) || !Array.isArray(parsed.types) || !Array.isArray(parsed.movements)) {
        return { success: false, message: 'Arquivo JSON inválido: estrutura de dados incompatível.' };
      }
      this.saveDatabase(parsed);
      return { success: true, message: `Banco de dados restaurado com sucesso! (${parsed.articles.length} artigos carregados).` };
    } catch (err: any) {
      return { success: false, message: `Erro ao importar arquivo: ${err.message || 'JSON malformatado'}` };
    }
  }

  public resetToEmpty(): void {
    const emptyDb = getEmptyDatabase(this.getTechnicianName());
    this.saveDatabase(emptyDb);
  }

  public reloadSeededData(): void {
    const seeded = getSeededDatabase(this.getTechnicianName());
    this.saveDatabase(seeded);
  }

  // Configuração GitHub
  public getGitHubConfig(): GitHubSyncConfig | null {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(GITHUB_CONFIG_KEY);
    return item ? JSON.parse(item) : null;
  }

  public saveGitHubConfig(config: GitHubSyncConfig): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
  }
}

export const storageService = new StorageService();
