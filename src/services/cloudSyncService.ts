import { storageService } from './storageService';
import { GitHubSyncConfig } from '../types/inventory';

export interface SyncResult {
  success: boolean;
  message: string;
  url?: string;
  versionId?: string;
}

export class CloudSyncService {
  /**
   * Sincroniza o estado atual do estoque com o GitHub Gist
   */
  public async syncToGitHubGist(config: GitHubSyncConfig): Promise<SyncResult> {
    if (!config.token) {
      return { success: false, message: 'Token de Acesso Pessoal (PAT) do GitHub não configurado.' };
    }

    const payload = storageService.exportDatabaseAsJson();
    const fileName = 'senai_sp_estoque_db.json';
    const timestamp = new Date().toLocaleString('pt-BR');

    try {
      if (config.gistId) {
        // Atualiza Gist existente
        const response = await fetch(`https://api.github.com/gists/${config.gistId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${config.token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: `SENAI SP - Backup de Estoque [${timestamp}] por ${storageService.getTechnicianName()}`,
            files: {
              [fileName]: {
                content: payload,
              },
            },
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || `Erro HTTP ${response.status}`);
        }

        const data = await response.json();
        config.lastSync = new Date().toISOString();
        storageService.saveGitHubConfig(config);

        return {
          success: true,
          message: `Snapshot sincronizado no GitHub Gist com sucesso! Revisão registrada.`,
          url: data.html_url,
          versionId: data.history?.[0]?.version?.substring(0, 7),
        };
      } else {
        // Cria novo Gist
        const response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: `SENAI SP - SGEM Banco de Dados Inicial [${timestamp}]`,
            public: false,
            files: {
              [fileName]: {
                content: payload,
              },
            },
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || `Erro HTTP ${response.status}`);
        }

        const data = await response.json();
        config.gistId = data.id;
        config.lastSync = new Date().toISOString();
        storageService.saveGitHubConfig(config);

        return {
          success: true,
          message: `Novo GitHub Gist criado e versionado com sucesso!`,
          url: data.html_url,
          versionId: data.history?.[0]?.version?.substring(0, 7),
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Falha na sincronização GitHub: ${err.message}`,
      };
    }
  }

  /**
   * Baixa a versão mais recente do GitHub Gist
   */
  public async pullFromGitHubGist(config: GitHubSyncConfig): Promise<SyncResult> {
    if (!config.gistId) {
      return { success: false, message: 'ID do Gist não informado.' };
    }

    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
      };
      if (config.token) {
        headers['Authorization'] = `Bearer ${config.token}`;
      }

      const response = await fetch(`https://api.github.com/gists/${config.gistId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar Gist: HTTP ${response.status}`);
      }

      const data = await response.json();
      const file = data.files?.['senai_sp_estoque_db.json'] || Object.values(data.files || {})[0];
      if (!file || !file.content) {
        throw new Error('Arquivo de dados não encontrado no Gist.');
      }

      const importRes = storageService.importDatabaseFromJson(file.content);
      if (!importRes.success) {
        return { success: false, message: importRes.message };
      }

      config.lastSync = new Date().toISOString();
      storageService.saveGitHubConfig(config);

      return {
        success: true,
        message: `Dados carregados do GitHub com sucesso! Versão: ${data.history?.[0]?.version?.substring(0, 7) || 'recente'}`,
        url: data.html_url,
      };
    } catch (err: any) {
      return { success: false, message: `Erro ao obter dados do GitHub: ${err.message}` };
    }
  }

  /**
   * Exporta arquivo de backup compatível com Google Drive
   */
  public downloadGoogleDriveBackupFile(): void {
    const json = storageService.exportDatabaseAsJson();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `senai_sp_estoque_backup_${dateStr}.json`;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const cloudSyncService = new CloudSyncService();
