export interface ItemType {
  id: string;
  code: string; // Ex: "01", "02"
  name: string;
  description: string;
  createdAt: string;
}

export interface ItemGroup {
  id: string;
  code: string; // Ex: "01.01"
  typeId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface ItemSubgroup {
  id: string;
  code: string; // Ex: "01.01.01"
  groupId: string;
  name: string;
  description: string;
  createdAt: string;
}

export type UnitOfMeasure = 'UN' | 'PC' | 'KG' | 'M' | 'L' | 'CX' | 'JG' | 'RL' | 'PAR';

export interface Article {
  id: string;
  code: string; // Ex: "01.01.01.0001"
  subgroupId: string;
  name: string;
  description: string; // Deve terminar com o primeiro nome do responsável técnico
  unit: UnitOfMeasure;
  defaultLocation: string; // Localização padrão no almoxarifado
  minStock: number;
  currentStock: number;
  unitCost: number;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'ENTRADA' | 'SAIDA' | 'AJUSTE';

export interface StockMovement {
  id: string;
  articleId: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  location: string;
  unitCost?: number;
  documentNumber: string; // NF, Requisição, OS
  entityName: string; // Fornecedor ou Turma/Instrutor Solicitante
  reason: string; // Motivo da movimentação
  notes?: string;
  technicianName: string; // Primeiro nome do responsável técnico
  timestamp: string;
}

export interface InventoryDatabase {
  version: string;
  lastUpdated: string;
  technicianName: string;
  types: ItemType[];
  groups: ItemGroup[];
  subgroups: ItemSubgroup[];
  articles: Article[];
  movements: StockMovement[];
}

export interface ArticleWithHierarchy extends Article {
  type?: ItemType;
  group?: ItemGroup;
  subgroup?: ItemSubgroup;
  recentMovements: StockMovement[];
}

export interface GitHubSyncConfig {
  token: string;
  owner: string;
  repo: string;
  path: string;
  gistId?: string;
  branch?: string;
  lastSync?: string;
}
